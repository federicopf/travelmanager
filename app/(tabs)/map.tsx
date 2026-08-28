import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VisitedPlacesMap } from '@/components/visited-places-map';
import { VisitedPlace } from '@/domain/visited-place';
import { getVisitedPlaces } from '@/repositories/visited-place-repository';

export default function MapScreen() {
  const [places, setPlaces] = useState<VisitedPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getVisitedPlaces()
        .then((results) => { if (active) setPlaces(results); })
        .catch((error) => {
          console.error('Errore caricamento mappa:', error);
          Alert.alert('Errore', 'Non riesco a caricare la mappa locale.');
        })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  if (loading) {
    return <ThemedView style={styles.center}><ActivityIndicator size="large" color="#0a7ea4" /></ThemedView>;
  }

  const mappedCount = places.filter((place) => place.latitude !== undefined && place.longitude !== undefined).length;

  return (
    <ThemedView style={styles.container}>
      <VisitedPlacesMap places={places} onSelect={(place) => router.push(`/place-detail?id=${place.id}`)} />
      <View style={styles.overlay}>
        <ThemedText style={styles.count}>{mappedCount} {mappedCount === 1 ? 'luogo' : 'luoghi'} sulla mappa</ThemedText>
        <TouchableOpacity style={styles.add} onPress={() => router.push('/create-visited-place')}>
          <ThemedText style={styles.addText}>＋ Aggiungi</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', left: 14, right: 14, top: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.94)' },
  count: { color: '#263238', fontWeight: '700' },
  add: { backgroundColor: '#0a7ea4', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 13 },
  addText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
