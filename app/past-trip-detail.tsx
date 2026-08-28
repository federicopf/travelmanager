import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PastTripCard } from '@/components/past-trip-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { VisitedPlaceCard } from '@/components/visited-place-card';
import { PastTrip } from '@/domain/past-trip';
import { VisitedPlace } from '@/domain/visited-place';
import { deletePastTrip, getChildTrips, getPastTrip } from '@/repositories/past-trip-repository';
import { getVisitedPlacesByTrip } from '@/repositories/visited-place-repository';

export default function PastTripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [trip, setTrip] = useState<PastTrip | null>(null);
  const [places, setPlaces] = useState<VisitedPlace[]>([]);
  const [childTrips, setChildTrips] = useState<PastTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
      try {
        const [tripResult, placeResults, childTripResults] = await Promise.all([
          id ? getPastTrip(id) : null,
          id ? getVisitedPlacesByTrip(id) : [],
          id ? getChildTrips(id) : [],
        ]);
        if (!tripResult) {
          Alert.alert('Viaggio non trovato', 'Questo viaggio non e piu disponibile.');
          router.replace('/(tabs)/diary');
          return;
        }
        if (active) {
          setTrip(tripResult);
          setPlaces(placeResults);
          setChildTrips(childTripResults);
        }
      } catch (error) {
        console.error('Errore caricamento viaggio:', error);
        Alert.alert('Errore', 'Non riesco ad aprire il viaggio.');
      } finally {
        if (active) setLoading(false);
      }
      };
      void load();
      return () => { active = false; };
    }, [id])
  );

  const handleDelete = useCallback(() => {
    if (!trip) return;
    Alert.alert(
      'Elimina viaggio',
      'Le tappe resteranno nel diario come luoghi non raggruppati.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina', style: 'destructive', onPress: async () => {
            try {
              setDeleting(true);
              await deletePastTrip(trip.id);
              router.replace('/(tabs)/diary');
            } catch (error) {
              console.error('Errore eliminazione viaggio:', error);
              Alert.alert('Errore', 'Non sono riuscito a eliminare il viaggio.');
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [trip]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: trip?.title ?? 'Viaggio passato',
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => trip && router.push(`/create-past-trip?id=${trip.id}`)}
            disabled={!trip || deleting}
            style={styles.headerButton}>
            <IconSymbol name="pencil" size={21} color="#0a7ea4" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} disabled={!trip || deleting} style={styles.headerButton}>
            <IconSymbol name="trash.fill" size={21} color="#d44855" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [deleting, handleDelete, navigation, trip]);

  if (loading || !trip) {
    return <ThemedView style={styles.loading}><ActivityIndicator size="large" color="#0a7ea4" /></ThemedView>;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}>
        <PastTripCard trip={trip} />

        {!trip.parentTripId && (
          <View style={styles.subTripSection}>
            <View style={styles.sectionHeader}>
              <View>
                <ThemedText type="subtitle">Sottoviaggi</ThemedText>
                <ThemedText style={styles.muted}>Periodi dentro questo viaggio</ThemedText>
              </View>
              <TouchableOpacity style={styles.subTripButton} onPress={() => router.push(`/create-past-trip?parentTripId=${trip.id}`)}>
                <ThemedText style={styles.subTripButtonText}>＋ Sottoviaggio</ThemedText>
              </TouchableOpacity>
            </View>
            {childTrips.map((childTrip) => (
              <PastTripCard key={childTrip.id} trip={childTrip} onPress={() => router.push(`/past-trip-detail?id=${childTrip.id}`)} />
            ))}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="subtitle">Tappe</ThemedText>
            <ThemedText style={styles.muted}>In ordine cronologico</ThemedText>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push(`/create-visited-place?tripId=${trip.id}`)}>
            <ThemedText style={styles.addButtonText}>＋ Aggiungi</ThemedText>
          </TouchableOpacity>
        </View>

        {places.length === 0 ? (
          <ThemedView style={styles.empty}>
            <ThemedText style={styles.emptyEmoji}>📍</ThemedText>
            <ThemedText type="defaultSemiBold">Nessuna tappa ancora</ThemedText>
            <ThemedText style={styles.muted}>Aggiungi il primo luogo vissuto durante questo viaggio.</ThemedText>
          </ThemedView>
        ) : places.map((place) => (
          <VisitedPlaceCard key={place.id} place={place} onPress={() => router.push(`/place-detail?id=${place.id}`)} />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 18 },
  headerButton: { padding: 8, marginRight: 6 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  subTripSection: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  muted: { fontSize: 13, opacity: 0.58 },
  addButton: { backgroundColor: '#0a7ea4', paddingHorizontal: 13, paddingVertical: 9, borderRadius: 14 },
  addButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  subTripButton: { backgroundColor: 'rgba(10,126,164,0.1)', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14 },
  subTripButtonText: { color: '#0a7ea4', fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', padding: 26, gap: 7, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(104,112,118,0.3)' },
  emptyEmoji: { fontSize: 31 },
});
