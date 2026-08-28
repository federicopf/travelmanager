export interface PlaceMapProps {
  latitude?: number;
  longitude?: number;
  onChange: (latitude: number, longitude: number) => void;
  readOnly?: boolean;
}
