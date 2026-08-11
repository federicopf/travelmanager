import { router, useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PastTripCard } from '@/components/past-trip-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { VisitedPlaceCard } from '@/components/visited-place-card';
import { PastTrip } from '@/domain/past-trip';
import { VisitedPlace } from '@/domain/visited-place';
import { getPastTrips } from '@/repositories/past-trip-repository';
import { getVisitedPlaces } from '@/repositories/visited-place-repository';

export default function DiaryScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [trips, setTrips] = useState<PastTrip[]>([]);
  const [places, setPlaces] = useState<VisitedPlace[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCreatePlace = useCallback(() => {
    router.push('/create-visited-place');
  }, []);

  const handleCreate = useCallback(() => {
    Alert.alert('Cosa vuoi aggiungere?', undefined, [
      { text: 'Un luogo visitato', onPress: handleCreatePlace },
      { text: 'Un viaggio passato', onPress: () => router.push('/create-past-trip') },
      { text: 'Annulla', style: 'cancel' },
    ]);
  }, [handleCreatePlace]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Diario',
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton} onPress={handleCreate} activeOpacity={0.75}>
          <IconSymbol name="plus.circle.fill" size={22} color="#fff" />
          <ThemedText style={styles.headerButtonText}>Aggiungi</ThemedText>
        </TouchableOpacity>
      ),
    });
  }, [handleCreate, navigation]);

  const loadDiary = useCallback(async () => {
    try {
      setLoading(true);
      const [placeResults, tripResults] = await Promise.all([getVisitedPlaces(), getPastTrips()]);
      setPlaces(placeResults);
      setTrips(tripResults);
    } catch (error) {
      console.error('Errore caricamento diario:', error);
      Alert.alert('Errore', 'Non riesco ad aprire il diario locale.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDiary();
    }, [loadDiary])
  );

  if (loading) {
    return <ThemedView style={styles.centered}><ActivityIndicator size="large" color="#0a7ea4" /></ThemedView>;
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VisitedPlaceCard place={item} onPress={() => router.push(`/place-detail?id=${item.id}`)} />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionCopy}>
                <ThemedText type="subtitle">Viaggi passati</ThemedText>
                <ThemedText style={styles.sectionSubtitle}>Raggruppa i ricordi in un viaggio.</ThemedText>
              </View>
              <TouchableOpacity style={styles.tripButton} onPress={() => router.push('/create-past-trip')}>
                <ThemedText style={styles.tripButtonText}>＋ Viaggio</ThemedText>
              </TouchableOpacity>
            </View>
            {trips.length === 0 ? (
              <TouchableOpacity style={styles.emptyTrip} onPress={() => router.push('/create-past-trip')}>
                <ThemedText style={styles.emptyTripText}>🧳 Crea il tuo primo viaggio passato</ThemedText>
              </TouchableOpacity>
            ) : trips.map((trip) => (
              <PastTripCard
                key={trip.id}
                trip={trip}
                onPress={() => router.push(`/past-trip-detail?id=${trip.id}`)}
              />
            ))}
            <ThemedText type="subtitle" style={styles.placesTitle}>Tutti i luoghi</ThemedText>
          </View>
        }
        ListEmptyComponent={
          <ThemedView style={styles.emptyCard}>
            <ThemedText style={styles.emptyEmoji}>🗺️</ThemedText>
            <ThemedText type="subtitle" style={styles.emptyTitle}>Nessun luogo nel diario</ThemedText>
            <ThemedText style={styles.emptyText}>Aggiungi una citta, un trekking o qualsiasi luogo che hai vissuto.</ThemedText>
            <TouchableOpacity style={styles.emptyButton} onPress={handleCreatePlace}>
              <ThemedText style={styles.emptyButtonText}>Aggiungi il primo luogo</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        }
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20 },
  headerContent: { gap: 12, marginBottom: 10 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionCopy: { flex: 1 },
  sectionSubtitle: { fontSize: 13, opacity: 0.55 },
  tripButton: { backgroundColor: 'rgba(10,126,164,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 13 },
  tripButtonText: { color: '#0a7ea4', fontSize: 13, fontWeight: '700' },
  emptyTrip: { borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(10,126,164,0.28)', borderRadius: 14, padding: 16, alignItems: 'center' },
  emptyTripText: { color: '#0a7ea4', fontWeight: '600', fontSize: 14 },
  placesTitle: { marginTop: 10 },
  headerButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0a7ea4', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, marginRight: 8 },
  headerButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  emptyCard: { alignItems: 'center', padding: 28, gap: 12 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { textAlign: 'center' },
  emptyText: { textAlign: 'center', opacity: 0.65 },
  emptyButton: { marginTop: 8, backgroundColor: '#0a7ea4', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 13 },
  emptyButtonText: { color: '#fff', fontWeight: '700' },
});
