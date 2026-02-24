import mongoose from 'mongoose';
import { Booking, IBookingDocument } from '../models/booking.model';
import { BadRequestError, HttpError, UnauthorizedError } from '../errors/http-error';
import {
  BOOKING_STATUSES,
  FLOORING_TYPES,
  PREFERRED_TIMES,
  SERVICE_TYPES,
  BookingStatus,
  CreateBookingDto,
} from '../dtos/booking.dto';
import { userRepository } from '../repositories/user.repository';

interface BookingQuery {
  page?: number | string;
  limit?: number | string;
  status?: string;
}

const PHONE_REGEX = /^(?:\d{10}|\+977\d{10})$/;

export class BookingService {
  private async isAdmin(userId: string): Promise<boolean> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return user.role === 'admin';
  }

  private validateCreatePayload(payload: CreateBookingDto): CreateBookingDto {
    const fullName = payload.fullName?.trim();
    const phoneNumber = payload.phoneNumber?.trim() ?? payload.phone?.trim();
    const cityAddress = payload.cityAddress?.trim();

    if (!fullName || fullName.length < 2 || fullName.length > 120) {
      throw new BadRequestError('Full name must be between 2 and 120 characters');
    }

    if (!phoneNumber || !PHONE_REGEX.test(phoneNumber)) {
      throw new BadRequestError('Phone must be 10 digits or +977 followed by 10 digits');
    }

    if (!cityAddress || cityAddress.length > 250) {
      throw new BadRequestError('City address is required and must be at most 250 characters');
    }

    if (!SERVICE_TYPES.includes(payload.serviceType)) {
      throw new BadRequestError('Invalid service type');
    }

    if (!FLOORING_TYPES.includes(payload.flooringType)) {
      throw new BadRequestError('Invalid flooring type');
    }

    if (!PREFERRED_TIMES.includes(payload.preferredTime)) {
      throw new BadRequestError('Invalid preferred time');
    }

    if (!Number.isFinite(payload.areaSize) || payload.areaSize < 1) {
      throw new BadRequestError('Area size must be at least 1');
    }

    const preferredDate = new Date(payload.preferredDate);
    if (Number.isNaN(preferredDate.getTime())) {
      throw new BadRequestError('Preferred date is invalid');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateOnly = new Date(preferredDate);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly < today) {
      throw new BadRequestError('Preferred date cannot be in the past');
    }

    if (payload.email && payload.email.trim().length > 180) {
      throw new BadRequestError('Email must be at most 180 characters');
    }

    if (payload.notes && payload.notes.length > 2000) {
      throw new BadRequestError('Notes must be at most 2000 characters');
    }

    return {
      ...payload,
      fullName,
      phoneNumber,
      phone: payload.phone?.trim() ?? phoneNumber,
      cityAddress,
      email: payload.email?.trim().toLowerCase(),
    };
  }

  async createBooking(userId: string, payload: CreateBookingDto): Promise<IBookingDocument> {
    const validated = this.validateCreatePayload(payload);

    const booking = await Booking.create({
      ...validated,
      phoneNumber: validated.phoneNumber,
      createdBy: userId,
    });

    return booking;
  }

  async getMyBookings(
    userId: string,
    query: BookingQuery
  ): Promise<{
    items: IBookingDocument[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const filter: Record<string, unknown> = { createdBy: userId };

    if (query.status) {
      if (!BOOKING_STATUSES.includes(query.status as BookingStatus)) {
        throw new BadRequestError('Invalid status');
      }
      filter.status = query.status;
    }

    const total = await Booking.countDocuments(filter);
    const items = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBookingById(userId: string, id: string): Promise<IBookingDocument> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid booking id');
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new HttpError('Booking not found', 404);
    }

    const isAdmin = await this.isAdmin(userId);
    if (booking.createdBy.toString() !== userId && !isAdmin) {
      throw new HttpError('Forbidden', 403);
    }

    return booking;
  }

  async updateBookingStatus(
    userId: string,
    id: string,
    status: BookingStatus
  ): Promise<IBookingDocument> {
    if (!BOOKING_STATUSES.includes(status)) {
      throw new BadRequestError('Invalid status');
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid booking id');
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new HttpError('Booking not found', 404);
    }

    const isAdmin = await this.isAdmin(userId);

    if (booking.createdBy.toString() !== userId && !isAdmin) {
      throw new HttpError('Forbidden', 403);
    }

    if (!isAdmin) {
      // TODO: allow admin role from JWT token if available
      throw new HttpError('Forbidden', 403);
    }

    booking.status = status;
    await booking.save();

    return booking;
  }

  async deleteBooking(userId: string, id: string): Promise<IBookingDocument> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid booking id');
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new HttpError('Booking not found', 404);
    }

    const isAdmin = await this.isAdmin(userId);
    if (booking.createdBy.toString() !== userId && !isAdmin) {
      throw new HttpError('Forbidden', 403);
    }

    await booking.deleteOne();

    return booking;
  }

  async getAllBookingsAdmin(): Promise<IBookingDocument[]> {
    return await Booking.find().sort({ createdAt: -1 });
  }

  async getBookingByIdAdmin(id: string): Promise<IBookingDocument> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid booking id');
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new HttpError('Booking not found', 404);
    }

    return booking;
  }

  async updateBookingStatusAdmin(id: string, status: BookingStatus): Promise<IBookingDocument> {
    if (!BOOKING_STATUSES.includes(status)) {
      throw new BadRequestError('Invalid status');
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid booking id');
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!booking) {
      throw new HttpError('Booking not found', 404);
    }

    return booking;
  }

  async deleteBookingAdmin(id: string): Promise<IBookingDocument> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid booking id');
    }

    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      throw new HttpError('Booking not found', 404);
    }

    return booking;
  }
}

export const bookingService = new BookingService();
