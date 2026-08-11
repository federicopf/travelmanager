import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PastTrip } from '@/domain/past-trip';

interface PastTripCardProps {
  trip: PastTrip;
  onPress?: () => void;
}

function formatPeriod(trip: PastTrip): string {
  if (!trip.startDate || trip.datePrecision === 'unknown') return 'Periodo non ricordato';
  if (trip.datePrecision === 'year') return trip.startDate.slice(0, 4);
  if (trip.datePrecision === 'month') return trip.startDate.slice(0, 7);
  return trip.endDate && trip.endDate !== trip.startDate
    ? `${trip.startDate} → ${trip.endDate}`
    : trip.startDate;
}

export function PastTripCard({ trip, onPress }: PastTripCardProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.72}>
      <ThemedView style={styles.card}>
        <View style={styles.icon}>
          <ThemedText style={styles.iconText}>🧳</ThemedText>
        </View>
        <View style={styles.content}>
          <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={1}>
            {trip.title}
          </ThemedText>
          <ThemedText style={styles.period}>{formatPeriod(trip)}</ThemedText>
          <ThemedText style={styles.stats}>
            {trip.placesCount} {trip.placesCount === 1 ? 'tappa' : 'tappe'} · {trip.countriesCount}{' '}
            {trip.countriesCount === 1 ? 'paese' : 'paesi'}
          </ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', gap: 13, padding: 15, marginBottom: 11, borderRadius: 16,
    backgroundColor: 'rgba(10,126,164,0.08)', borderWidth: 1, borderColor: 'rgba(10,126,164,0.18)',
  },
  icon: { width: 48, height: 48, borderRadius: 15, backgroundColor: 'rgba(10,126,164,0.13)', alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 24 },
  content: { flex: 1, gap: 2 },
  title: { fontSize: 17 },
  period: { fontSize: 13, opacity: 0.62 },
  stats: { fontSize: 12, color: '#0a7ea4', fontWeight: '600', marginTop: 2 },
});
