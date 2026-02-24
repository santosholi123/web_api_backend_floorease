import mongoose, { Schema, Document, Types } from 'mongoose';
import {
  BOOKING_STATUSES,
  FLOORING_TYPES,
  PREFERRED_TIMES,
  SERVICE_TYPES,
  BookingStatus,
  FlooringType,
  PreferredTime,
  ServiceType,
} from '../dtos/booking.dto';

export interface IBookingDocument extends Document {
  fullName: string;
  phoneNumber: string;
  phone?: string;
  email?: string;
  cityAddress: string;
  serviceType: ServiceType;
  flooringType: FlooringType;
  areaSize: number;
  preferredDate: Date;
  preferredTime: PreferredTime;
  notes?: string;
  roomPhoto?: string;
  status: BookingStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBookingDocument>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 180,
    },
    cityAddress: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    serviceType: {
      type: String,
      enum: SERVICE_TYPES,
      required: true,
    },
    flooringType: {
      type: String,
      enum: FLOORING_TYPES,
      required: true,
    },
    areaSize: {
      type: Number,
      required: true,
      min: 1,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTime: {
      type: String,
      enum: PREFERRED_TIMES,
      required: true,
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
    roomPhoto: {
      type: String,
    },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model<IBookingDocument>('Booking', bookingSchema);
