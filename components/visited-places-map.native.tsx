import { Platform, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import { VisitedPlacesMapProps } from '@/components/visited-places-map.types';
import { getPlaceCategoryLabel, getPlaceEmoji } from '@/domain/visited-place';

const WORLD_REGION: Region = {
  latitude: 25,
  longitude: 10,
  latitudeDelta: 120,
  longitudeDelta: 120,
};

export function VisitedPlacesMap({ places, onSelect }: VisitedPlacesMapProps) {
  const mappedPlaces = places.filter(
    (place) => place.latitude !== undefined && place.longitude !== undefined
  );
  const first = mappedPlaces[0];
  const initialRegion: Region = first
    ? { latitude: first.latitude!, longitude: first.longitude!, latitudeDelta: 18, longitudeDelta: 18 }
    : WORLD_REGION;

  return (
    <MapView
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      style={styles.map}
      initialRegion={initialRegion}
      showsCompass
      showsScale
      toolbarEnabled={false}
      loadingEnabled>
      {mappedPlaces.map((place) => (
        <Marker
          key={place.id}
          coordinate={{ latitude: place.latitude!, longitude: place.longitude! }}
          title={`${getPlaceEmoji(place)} ${place.title}`}
          description={getPlaceCategoryLabel(place)}
          onCalloutPress={() => onSelect(place)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({ map: { flex: 1 } });
