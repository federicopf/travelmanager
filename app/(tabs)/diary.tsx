import { router, useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { VisitedPlaceCard } from '@/components/visited-place-card';
import { VisitedPlace } from '@/domain/visited-place';
import { getVisitedPlaces } from '@/repositories/visited-place-repository';

export default function DiaryScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [places, setPlaces] = useState<VisitedPlace[]>([]);
  const [loading, setLoading] = useState(true);

  const addPlace = useCallback(() => router.push('/create-visited-place'), []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'I miei posti',
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton} onPress={addPlace} activeOpacity={0.75}>
          <IconSymbol name="plus.circle.fill" size={22} color="#fff" />
          <ThemedText style={styles.headerButtonText}>Aggiungi</ThemedText>
        </TouchableOpacity>
      ),
    });
  }, [addPlace, navigation]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getVisitedPlaces()
        .then((results) => { if (active) setPlaces(results); })
        .catch((error) => {
          console.error('Errore caricamento posti:', error);
          Alert.alert('Errore', 'Non riesco ad aprire i posti salvati.');
        })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  if (loading) {
    return <ThemedView style={styles.centered}><ActivityIndicator size="large" color="#0a7ea4" /></ThemedView>;
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <VisitedPlaceCard place={item} onPress={() => router.push(`/place-detail?id=${item.id}`)} />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        ListHeaderComponent={places.length > 0 ? (
          <View style={styles.intro}>
            <ThemedText type="subtitle">{places.length} {places.length === 1 ? 'posto salvato' : 'posti salvati'}</ThemedText>
            <ThemedText style={styles.introText}>Ogni riga corrisponde a un punto distinto sulla mappa.</ThemedText>
          </View>
        ) : null}
        ListEmptyComponent={
          <ThemedView style={styles.emptyCard}>
            <ThemedText style={styles.emptyEmoji}>🗺️</ThemedText>
            <ThemedText type="subtitle">La mappa è ancora vuota</ThemedText>
            <ThemedText style={styles.emptyText}>Aggiungi una città, un trekking, una spiaggia o qualsiasi altro posto vissuto.</ThemedText>
            <TouchableOpacity style={styles.emptyButton} onPress={addPlace}>
              <ThemedText style={styles.emptyButtonText}>Aggiungi il primo posto</ThemedText>
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
  intro: { gap: 3, marginBottom: 18 },
  introText: { fontSize: 13, opacity: 0.58 },
  headerButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0a7ea4', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, marginRight: 8 },
  headerButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  emptyCard: { alignItems: 'center', padding: 28, gap: 12 },
  emptyEmoji: { fontSize: 52 },
  emptyText: { textAlign: 'center', opacity: 0.65 },
  emptyButton: { marginTop: 8, backgroundColor: '#0a7ea4', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 13 },
  emptyButtonText: { color: '#fff', fontWeight: '700' },
});
