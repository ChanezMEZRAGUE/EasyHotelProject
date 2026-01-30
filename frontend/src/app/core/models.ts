export interface Region {
  id: string;
  name: string;
}

export interface HotelPolicy {
  allowPayNow: boolean;
  allowPay20DaysBefore: boolean;
  allowPayOnSite: boolean;
  allowFreeReservation: boolean;
  cancellationFreeUntilDaysBefore: number;
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  capacity: number;
  pricePerNightCents: number;
  totalRooms: number;
  availableRooms?: number;
}

export interface Hotel {
  id: string;
  name: string;
  regionId: string;
  address: string;
  starRating?: number;
  heroImageUrl?: string;
  policies: HotelPolicy;
  roomTypes?: RoomType[];
}

export interface Reservation {
  id: string;
  hotelId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  paymentMode: 'PAY_NOW' | 'PAY_20_DAYS_BEFORE' | 'PAY_ON_SITE' | 'FREE';
  paymentStatus: 'UNPAID' | 'SCHEDULED' | 'PAID' | 'NOT_REQUIRED';
  totalPriceCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
