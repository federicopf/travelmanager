export interface Travel {
  id: string;
  userId: string;
  title: string;
  description?: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'ongoing' | 'completed';
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
}

