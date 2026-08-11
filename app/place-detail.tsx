import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CATEGORY_EMOJI, CATEGORY_LABELS, VisitedPlace } from '@/domain/visited-place';
import { deleteVisitedPlace, getVisitedPlace } from '@/repositories/visited-place-repository';
import { countryCodeToFlag } from '@/utils/country';

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
          Alert.alert('Luogo non trovato', 'Questo ricordo non e piu disponibile.');
          router.replace('/(tabs)/diary');
          return;
        }
        if (active) setPlace(result);
      } catch (error) {
        console.error('Errore caricamento luogo:', error);
        Alert.alert('Errore', 'Non riesco ad aprire questo ricordo.');
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
    Alert.alert('Elimina ricordo', `Vuoi eliminare "${place.title}" dal diario?`, [
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
            Alert.alert('Errore', 'Non sono riuscito a eliminare il ricordo.');
            setDeleting(false);
          }
        },
      },
    ]);
  }, [place]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: place?.title ?? 'Ricordo',
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

  const visitedLabel = place.visitedAt ?? 'Data non ricordata';

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}>
        <View style={styles.hero}>
          <ThemedText style={styles.heroEmoji}>{CATEGORY_EMOJI[place.category]}</ThemedText>
          <ThemedText type="title" style={styles.title}>{place.title}</ThemedText>
          <ThemedText style={styles.country}>
            {countryCodeToFlag(place.countryCode)} {place.countryName}
          </ThemedText>
          <View style={styles.badges}>
            <ThemedText style={styles.badge}>{place.customCategory || CATEGORY_LABELS[place.category]}</ThemedText>
            {place.favorite && <ThemedText style={styles.favoriteBadge}>♥ Luogo del cuore</ThemedText>}
          </View>
        </View>

        <ThemedView style={styles.card}>
          <DetailRow label="Visitato" value={visitedLabel} />
          {place.locality && <DetailRow label="Localita" value={place.locality} />}
          {place.region && <DetailRow label="Regione" value={place.region} />}
          {place.latitude !== undefined && place.longitude !== undefined && (
            <DetailRow label="Coordinate" value={`${place.latitude.toFixed(5)}, ${place.longitude.toFixed(5)}`} />
          )}
          <DetailRow label="Ci tornerei" value={place.wouldReturn ? 'Si' : 'Non indicato'} />
        </ThemedView>

        {place.tags.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle">Tag</ThemedText>
            <View style={styles.tags}>
              {place.tags.map((tag) => <ThemedText key={tag} style={styles.tag}>#{tag}</ThemedText>)}
            </View>
          </View>
        )}

        {place.notes && (
          <View style={styles.section}>
            <ThemedText type="subtitle">Il ricordo</ThemedText>
            <ThemedText style={styles.notes}>{place.notes}</ThemedText>
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
  heroEmoji: { fontSize: 60 },
  title: { textAlign: 'center' },
  country: { fontSize: 17, opacity: 0.72 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  badge: { color: '#0a7ea4', backgroundColor: 'rgba(10,126,164,0.1)', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 14, fontSize: 13, fontWeight: '700' },
  favoriteBadge: { color: '#d44855', backgroundColor: 'rgba(212,72,85,0.1)', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 14, fontSize: 13, fontWeight: '700' },
  card: { borderWidth: 1, borderColor: 'rgba(104,112,118,0.18)', borderRadius: 16, paddingHorizontal: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(104,112,118,0.22)' },
  detailLabel: { opacity: 0.58, fontSize: 14 },
  detailValue: { flex: 1, textAlign: 'right', fontSize: 14, fontWeight: '600' },
  section: { gap: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { color: '#0a7ea4', backgroundColor: 'rgba(10,126,164,0.08)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, fontSize: 13 },
  notes: { lineHeight: 25, opacity: 0.78 },
  photoPlaceholder: { alignItems: 'center', gap: 5, padding: 24, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(104,112,118,0.3)' },
  photoEmoji: { fontSize: 30 },
  photoText: { fontSize: 13, opacity: 0.55 },
});
