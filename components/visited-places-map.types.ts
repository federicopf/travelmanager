import { VisitedPlace } from '@/domain/visited-place';

export interface VisitedPlacesMapProps {
  places: VisitedPlace[];
  onSelect: (place: VisitedPlace) => void;
}
