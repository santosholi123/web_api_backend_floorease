export const SERVICE_TYPES = ['Installation', 'Repair', 'Polish', 'Inspection'] as const;
export const FLOORING_TYPES = ['Homogeneous', 'Heterogeneous', 'SPC', 'Vinyl', 'Carpet', 'Wooden'] as const;
export const PREFERRED_TIMES = ['Morning 8-12', 'Afternoon 12-4', 'Evening 4-8'] as const;
export const BOOKING_STATUSES = ['pending', 'completed'] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];
export type FlooringType = (typeof FLOORING_TYPES)[number];
export type PreferredTime = (typeof PREFERRED_TIMES)[number];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface CreateBookingDto {
  fullName: string;
  phoneNumber?: string;
  phone?: string;
  email?: string;
  cityAddress: string;
  serviceType: ServiceType;
  flooringType: FlooringType;
  areaSize: number;
  preferredDate: string | Date;
  preferredTime: PreferredTime;
  notes?: string;
  roomPhoto?: string;
}

export interface UpdateBookingStatusDto {
  status: BookingStatus;
}

export interface UpdateBookingDto {
  fullName?: string;
  phoneNumber?: string;
  phone?: string;
  email?: string;
  cityAddress?: string;
  serviceType?: ServiceType;
  flooringType?: FlooringType;
  areaSize?: number;
  preferredDate?: string | Date;
  preferredTime?: PreferredTime;
  notes?: string;
  roomPhoto?: string;
  status?: BookingStatus;
}
//