import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import { PlaceMapProps } from '@/components/place-map.types';
import { ThemedText } from '@/components/themed-text';

const ITALY_REGION: Region = {
  latitude: 42.5,
  longitude: 12.5,
  latitudeDelta: 12,
  longitudeDelta: 12,
};

export function PlaceMap({ latitude, longitude, onChange, readOnly = false }: PlaceMapProps) {
  const mapRef = useRef<MapView>(null);
  const [locating, setLocating] = useState(false);
  const hasPoint = latitude !== undefined && longitude !== undefined;

  useEffect(() => {
    if (!hasPoint) return;
    mapRef.current?.animateCamera(
      { center: { latitude, longitude }, zoom: 15 },
      { duration: 450 }
    );
  }, [hasPoint, latitude, longitude]);

  const selectPoint = (event: MapPressEvent) => {
    const coordinate = event.nativeEvent.coordinate;
    onChange(coordinate.latitude, coordinate.longitude);
  };

  const useCurrentLocation = async () => {
    try {
      setLocating(true);
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Posizione non autorizzata', 'Puoi comunque scegliere il punto toccando la mappa.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coordinate = position.coords;
      onChange(coordinate.latitude, coordinate.longitude);
    } catch (error) {
      console.error('Errore geolocalizzazione:', error);
      Alert.alert('Posizione non disponibile', 'Tocca la mappa per scegliere manualmente il punto.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={hasPoint
          ? { latitude, longitude, latitudeDelta: 0.08, longitudeDelta: 0.08 }
          : ITALY_REGION}
        onPress={readOnly ? undefined : selectPoint}
        showsCompass
        showsScale
        toolbarEnabled={false}
        loadingEnabled>
        {hasPoint && (
          <Marker
            coordinate={{ latitude, longitude }}
            draggable={!readOnly}
            onDragEnd={(event) => {
              const coordinate = event.nativeEvent.coordinate;
              onChange(coordinate.latitude, coordinate.longitude);
            }}
          />
        )}
      </MapView>
      {!readOnly && (
        <TouchableOpacity style={styles.locationButton} onPress={useCurrentLocation} disabled={locating}>
          <ThemedText style={styles.locationButtonText}>
            {locating ? 'Localizzazione…' : '◎ Usa la mia posizione'}
          </ThemedText>
        </TouchableOpacity>
      )}
      {!readOnly && (
        <ThemedText style={styles.hint}>
          {hasPoint ? 'Tocca altrove o trascina il pin per correggere il punto.' : 'Tocca la mappa per posizionare il ricordo.'}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 9 },
  map: { width: '100%', height: 300, borderRadius: 18 },
  locationButton: { alignSelf: 'flex-start', backgroundColor: 'rgba(10,126,164,0.12)', paddingHorizontal: 13, paddingVertical: 9, borderRadius: 14 },
  locationButtonText: { color: '#0a7ea4', fontSize: 13, fontWeight: '700' },
  hint: { fontSize: 12, opacity: 0.56 },
});
