import { DatePrecision } from '@/domain/visited-place';

export interface PastTrip {
  id: string;
  parentTripId?: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  datePrecision: DatePrecision;
  coverPhotoUri?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  version: number;
  placesCount: number;
  countriesCount: number;
}

export interface CreatePastTripInput {
  parentTripId?: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  datePrecision: DatePrecision;
  notes?: string;
}
