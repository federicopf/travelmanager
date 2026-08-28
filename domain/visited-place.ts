export const VISITED_PLACE_CATEGORIES = [
  'city',
  'village',
  'trekking',
  'experience',
  'other',
] as const;

export type VisitedPlaceCategory = (typeof VISITED_PLACE_CATEGORIES)[number];
export type DatePrecision = 'exact' | 'month' | 'year' | 'unknown';
export type GeometryType = 'point' | 'route' | 'area';

export interface VisitedPlace {
  id: string;
  tripId?: string;
  title: string;
  description?: string;
  category: VisitedPlaceCategory;
  customCategory?: string;
  customCategoryEmoji?: string;
  countryCode: string;
  countryName: string;
  region?: string;
  locality?: string;
  addressLabel?: string;
  latitude?: number;
  longitude?: number;
  geometryType: GeometryType;
  visitedAt?: string;
  visitEndDate?: string;
  datePrecision: DatePrecision;
  rating?: number;
  favorite: boolean;
  wouldReturn?: boolean;
  tags: string[];
  notes?: string;
  coverPhotoUri?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  version: number;
}

export interface CreateVisitedPlaceInput {
  tripId?: string;
  title: string;
  description?: string;
  category: VisitedPlaceCategory;
  customCategory?: string;
  customCategoryEmoji?: string;
  countryCode: string;
  countryName: string;
  region?: string;
  locality?: string;
  addressLabel?: string;
  latitude?: number;
  longitude?: number;
  visitedAt?: string;
  visitEndDate?: string;
  datePrecision: DatePrecision;
  favorite?: boolean;
  wouldReturn?: boolean;
  tags?: string[];
  notes?: string;
}

export type UpdateVisitedPlaceInput = CreateVisitedPlaceInput;

export const CATEGORY_LABELS: Record<VisitedPlaceCategory, string> = {
  city: 'Città',
  village: 'Paese',
  trekking: 'Trekking',
  experience: 'Esperienza',
  other: 'Altro',
};

export const CATEGORY_EMOJI: Record<VisitedPlaceCategory, string> = {
  city: '🏙️',
  village: '🏘️',
  trekking: '🥾',
  experience: '✨',
  other: '📍',
};

export function getPlaceEmoji(place: Pick<VisitedPlace, 'category' | 'customCategoryEmoji'>): string {
  return place.category === 'other' && place.customCategoryEmoji
    ? place.customCategoryEmoji
    : CATEGORY_EMOJI[place.category];
}

export function getPlaceCategoryLabel(place: Pick<VisitedPlace, 'category' | 'customCategory'>): string {
  return place.category === 'other' && place.customCategory
    ? place.customCategory
    : CATEGORY_LABELS[place.category];
}
