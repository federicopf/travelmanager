import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PlaceMap } from '@/components/place-map';
import { getPlaceCategoryLabel, getPlaceEmoji, VisitedPlace } from '@/domain/visited-place';
import { deleteVisitedPlace, getVisitedPlace } from '@/repositories/visited-place-repository';
import { countryCodeToFlag } from '@/utils/country';

function formatVisitedDate(place: VisitedPlace): string {
  if (!place.visitedAt || place.datePrecision === 'unknown') return 'Data non ricordata';
  if (place.datePrecision === 'year') return place.visitedAt.slice(0, 4);
  if (place.datePrecision === 'month') {
    const [year, month] = place.visitedAt.split('-').map(Number);
    return new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
  }
  return place.visitEndDate && place.visitEndDate !== place.visitedAt
    ? `${place.visitedAt} → ${place.visitEndDate}`
    : place.visitedAt;
}

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [place, setPlace] = useState<VisitedPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
      try {
        const result = id ? await getVisitedPlace(id) : null;
        if (!result) {
          Alert.alert('Posto non trovato', 'Questo posto non è più disponibile.');
          router.replace('/(tabs)/diary');
          return;
        }
        if (active) setPlace(result);
      } catch (error) {
        console.error('Errore caricamento luogo:', error);
        Alert.alert('Errore', 'Non riesco ad aprire questo posto.');
      } finally {
        if (active) setLoading(false);
      }
      };
      void load();
      return () => { active = false; };
    }, [id])
  );

  const handleDelete = useCallback(() => {
    if (!place) return;
    Alert.alert('Elimina posto', `Vuoi eliminare "${place.title}" dalla mappa?`, [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Elimina',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            await deleteVisitedPlace(place.id);
            router.replace('/(tabs)/diary');
          } catch (error) {
            console.error('Errore eliminazione luogo:', error);
            Alert.alert('Errore', 'Non sono riuscito a eliminare il posto.');
            setDeleting(false);
          }
        },
      },
    ]);
  }, [place]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: place?.title ?? 'Posto',
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => place && router.push(`/create-visited-place?id=${place.id}`)}
            disabled={!place || deleting}
            style={styles.deleteButton}>
            <IconSymbol name="pencil" size={21} color="#0a7ea4" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} disabled={!place || deleting} style={styles.deleteButton}>
            <IconSymbol name="trash.fill" size={21} color="#d44855" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [deleting, handleDelete, navigation, place]);

  if (loading || !place) {
    return (
      <ThemedView style={styles.loading}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </ThemedView>
    );
  }

  const visitedLabel = formatVisitedDate(place);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}>
        <View style={styles.hero}>
          <ThemedText style={styles.heroEmoji}>{getPlaceEmoji(place)}</ThemedText>
          <ThemedText type="title" style={styles.title}>{place.title}</ThemedText>
          <ThemedText style={styles.country}>
            {countryCodeToFlag(place.countryCode)} {place.countryName}
          </ThemedText>
          <View style={styles.badges}>
            <ThemedText style={styles.badge}>{getPlaceCategoryLabel(place)}</ThemedText>
          </View>
        </View>

        <ThemedView style={styles.card}>
          <DetailRow label="Visitato" value={visitedLabel} />
          {place.addressLabel ? <DetailRow label="Indirizzo" value={place.addressLabel} /> : null}
        </ThemedView>

        {place.latitude !== undefined && place.longitude !== undefined && (
          <View style={styles.mapSection}>
            <ThemedText type="subtitle">Sulla mappa</ThemedText>
            <PlaceMap latitude={place.latitude} longitude={place.longitude} onChange={() => undefined} readOnly />
          </View>
        )}

        <ThemedView style={styles.photoPlaceholder}>
          <ThemedText style={styles.photoEmoji}>📷</ThemedText>
          <ThemedText type="defaultSemiBold">Foto locali</ThemedText>
          <ThemedText style={styles.photoText}>Arrivano nel prossimo incremento.</ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailLabel}>{label}</ThemedText>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 22 },
  deleteButton: { padding: 8, marginRight: 6 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  hero: { alignItems: 'center', gap: 8, paddingVertical: 14 },
  heroEmoji: { fontSize: 60, lineHeight: 76 },
  title: { textAlign: 'center' },
  country: { fontSize: 17, opacity: 0.72 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  badge: { color: '#0a7ea4', backgroundColor: 'rgba(10,126,164,0.1)', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 14, fontSize: 13, fontWeight: '700' },
  card: { borderWidth: 1, borderColor: 'rgba(104,112,118,0.18)', borderRadius: 16, paddingHorizontal: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(104,112,118,0.22)' },
  detailLabel: { opacity: 0.58, fontSize: 14 },
  detailValue: { flex: 1, textAlign: 'right', fontSize: 14, fontWeight: '600' },
  mapSection: { gap: 10 },
  photoPlaceholder: { alignItems: 'center', gap: 5, padding: 24, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(104,112,118,0.3)' },
  photoEmoji: { fontSize: 30, lineHeight: 40 },
  photoText: { fontSize: 13, opacity: 0.55 },
});
