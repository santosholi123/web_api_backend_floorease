import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { bookingService } from '../services/booking.service';
import { BadRequestError, UnauthorizedError } from '../errors/http-error';
import { BookingStatus } from '../dtos/booking.dto';

export class BookingController {
  private getValidatedBookingId(param: string | string[] | undefined): string {
    const bookingId = Array.isArray(param) ? param[0] : param;
    if (!bookingId) {
      throw new BadRequestError('Booking id is required');
    }
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      throw new BadRequestError('Invalid booking id');
    }
    return bookingId;
  }

  async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const booking = await bookingService.createBooking(req.userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const result = await bookingService.getMyBookings(req.userId, {
        page: req.query.page as string | undefined,
        limit: req.query.limit as string | undefined,
        status: req.query.status as string | undefined,
      });

      res.status(200).json({
        success: true,
        message: 'Bookings fetched successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const bookingId = this.getValidatedBookingId(req.params.id);

      const booking = await bookingService.getBookingById(req.userId, bookingId);

      res.status(200).json({
        success: true,
        message: 'Booking fetched successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const { status } = req.body as { status?: BookingStatus };
      if (!status) {
        throw new BadRequestError('Status is required');
      }

      const bookingId = this.getValidatedBookingId(req.params.id);

      const booking = await bookingService.updateBookingStatus(req.userId, bookingId, status);

      res.status(200).json({
        success: true,
        message: 'Booking status updated successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const bookingId = this.getValidatedBookingId(req.params.id);

      const booking = await bookingService.deleteBooking(req.userId, bookingId);

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllBookingsAdmin(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookings = await bookingService.getAllBookingsAdmin();

      res.status(200).json({
        success: true,
        message: 'Bookings fetched successfully',
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookingByIdAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId = this.getValidatedBookingId(req.params.id);

      const booking = await bookingService.getBookingByIdAdmin(bookingId);

      res.status(200).json({
        success: true,
        message: 'Booking fetched successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBookingStatusAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body as { status?: BookingStatus };
      if (!status) {
        throw new BadRequestError('Status is required');
      }

      const bookingId = this.getValidatedBookingId(req.params.id);

      const booking = await bookingService.updateBookingStatusAdmin(bookingId, status);

      res.status(200).json({
        success: true,
        message: 'Booking status updated successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBookingAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId = this.getValidatedBookingId(req.params.id);

      const booking = await bookingService.deleteBookingAdmin(bookingId);

      res.status(200).json({
        success: true,
        message: 'Booking deleted successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const bookingController = new BookingController();
