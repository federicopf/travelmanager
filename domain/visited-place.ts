export const VISITED_PLACE_CATEGORIES = [
  'city',
  'village',
  'culture',
  'archaeology',
  'religious_site',
  'trekking',
  'trail',
  'mountain',
  'viewpoint',
  'national_park',
  'nature_reserve',
  'forest',
  'lake',
  'river',
  'waterfall',
  'beach',
  'island',
  'desert',
  'scenic_route',
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
  countryCode: string;
  countryName: string;
  region?: string;
  locality?: string;
  latitude?: number;
  longitude?: number;
  visitedAt?: string;
  datePrecision: DatePrecision;
  favorite?: boolean;
  wouldReturn?: boolean;
  tags?: string[];
  notes?: string;
}

export type UpdateVisitedPlaceInput = CreateVisitedPlaceInput;

export const CATEGORY_LABELS: Record<VisitedPlaceCategory, string> = {
  city: 'Citta',
  village: 'Borgo',
  culture: 'Cultura',
  archaeology: 'Archeologia',
  religious_site: 'Luogo religioso',
  trekking: 'Trekking',
  trail: 'Sentiero',
  mountain: 'Montagna',
  viewpoint: 'Panorama',
  national_park: 'Parco nazionale',
  nature_reserve: 'Riserva naturale',
  forest: 'Foresta',
  lake: 'Lago',
  river: 'Fiume',
  waterfall: 'Cascata',
  beach: 'Spiaggia',
  island: 'Isola',
  desert: 'Deserto',
  scenic_route: 'Strada panoramica',
  other: 'Altro',
};

export const CATEGORY_EMOJI: Record<VisitedPlaceCategory, string> = {
  city: '🏙️',
  village: '🏘️',
  culture: '🎭',
  archaeology: '🏺',
  religious_site: '⛪',
  trekking: '🥾',
  trail: '🧭',
  mountain: '⛰️',
  viewpoint: '🌄',
  national_park: '🏞️',
  nature_reserve: '🌿',
  forest: '🌲',
  lake: '🏔️',
  river: '🏞️',
  waterfall: '💧',
  beach: '🏖️',
  island: '🏝️',
  desert: '🏜️',
  scenic_route: '🛣️',
  other: '📍',
};
