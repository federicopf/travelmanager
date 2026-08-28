import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { VisitedPlacesMapProps } from '@/components/visited-places-map.types';

export function VisitedPlacesMap({ places }: VisitedPlacesMapProps) {
  return <View style={styles.fallback}><ThemedText style={styles.emoji}>🗺️</ThemedText><ThemedText type="subtitle">Mappa disponibile su mobile</ThemedText><ThemedText style={styles.text}>{places.length} luoghi geolocalizzati.</ThemedText></View>;
}

const styles = StyleSheet.create({
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  emoji: { fontSize: 50 },
  text: { opacity: 0.6 },
});
