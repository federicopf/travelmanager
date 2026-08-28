import { router, useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  getVisitedPlaceStats,
  VisitedPlaceStats,
} from '@/repositories/visited-place-repository';

const EMPTY_STATS: VisitedPlaceStats = {
  placesCount: 0,
  countriesCount: 0,
  categoriesCount: 0,
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<VisitedPlaceStats>(EMPTY_STATS);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Travel Manager' });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      getVisitedPlaceStats().then(setStats).catch((error) => {
        console.error('Errore statistiche locali:', error);
        Alert.alert('Errore', 'Non riesco a leggere i progressi locali.');
      });
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.hero}>
          <ThemedText style={styles.eyebrow}>IL TUO MONDO</ThemedText>
          <ThemedText type="title" style={styles.title}>Ogni posto racconta qualcosa.</ThemedText>
          <ThemedText style={styles.subtitle}>
            Città, trekking e natura: ogni esperienza diventa un punto distinto.
          </ThemedText>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/create-visited-place')}>
            <ThemedText style={styles.primaryButtonText}>＋ Sono stato qui</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard value={stats.placesCount} label="Posti" emoji="📍" />
          <StatCard value={stats.countriesCount} label="Bandiere" emoji="🚩" />
          <StatCard value={stats.categoriesCount} label="Esperienze" emoji="🧭" />
        </View>

        <ThemedView style={styles.mapPreview}>
          <ThemedText style={styles.mapEmoji}>🗺️</ThemedText>
          <View style={styles.mapCopy}>
            <ThemedText type="defaultSemiBold">La tua mappa prende forma</ThemedText>
            <ThemedText style={styles.mapText}>
              Tutti i posti sono punti indipendenti. Apri la mappa per rivederli insieme.
            </ThemedText>
          </View>
        </ThemedView>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(tabs)/map')}>
          <ThemedText style={styles.secondaryButtonText}>Apri la mappa</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

function StatCard({ value, label, emoji }: { value: number; label: string; emoji: string }) {
  return (
    <ThemedView style={styles.statCard}>
      <ThemedText style={styles.statEmoji}>{emoji}</ThemedText>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 22 },
  hero: { backgroundColor: '#0b526b', borderRadius: 24, padding: 24, gap: 12 },
  eyebrow: { color: '#a9e5f4', fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: '#fff', fontSize: 32, lineHeight: 37 },
  subtitle: { color: 'rgba(255,255,255,0.78)', lineHeight: 23 },
  primaryButton: { alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 17, paddingVertical: 12, marginTop: 4 },
  primaryButtonText: { color: '#0b526b', fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', flexGrow: 1, borderWidth: 1, borderColor: 'rgba(104,112,118,0.16)', borderRadius: 18, padding: 16 },
  statEmoji: { fontSize: 21 },
  statValue: { fontSize: 28, lineHeight: 34, fontWeight: '800', marginTop: 5 },
  statLabel: { fontSize: 13, opacity: 0.58 },
  mapPreview: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 18, borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(10,126,164,0.35)' },
  mapEmoji: { fontSize: 36 },
  mapCopy: { flex: 1, gap: 4 },
  mapText: { fontSize: 13, lineHeight: 19, opacity: 0.6 },
  secondaryButton: { alignItems: 'center', padding: 14, borderRadius: 13, borderWidth: 1, borderColor: '#0a7ea4' },
  secondaryButtonText: { color: '#0a7ea4', fontWeight: '700' },
});
