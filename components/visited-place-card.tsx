import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORY_EMOJI, CATEGORY_LABELS, VisitedPlace } from '@/domain/visited-place';
import { countryCodeToFlag } from '@/utils/country';

interface VisitedPlaceCardProps {
  place: VisitedPlace;
  onPress: () => void;
}

function formatVisitedAt(place: VisitedPlace): string {
  if (!place.visitedAt || place.datePrecision === 'unknown') {
    return 'Data non ricordata';
  }

  if (place.datePrecision === 'year') {
    return place.visitedAt.slice(0, 4);
  }

  if (place.datePrecision === 'month') {
    const [year, month] = place.visitedAt.split('-').map(Number);
    return new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(
      new Date(year, month - 1, 1)
    );
  }

  const [year, month, day] = place.visitedAt.split('-').map(Number);
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

export function VisitedPlaceCard({ place, onPress }: VisitedPlaceCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.72}>
      <ThemedView style={styles.card}>
        <View style={styles.emojiContainer}>
          <ThemedText style={styles.emoji}>{CATEGORY_EMOJI[place.category]}</ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={1}>
              {place.title}
            </ThemedText>
            {place.favorite && <ThemedText style={styles.favorite}>♥</ThemedText>}
          </View>
          <ThemedText style={styles.location} numberOfLines={1}>
            {countryCodeToFlag(place.countryCode)} {place.locality ? `${place.locality}, ` : ''}
            {place.countryName}
          </ThemedText>
          <View style={styles.metaRow}>
            <ThemedText style={styles.category}>{CATEGORY_LABELS[place.category]}</ThemedText>
            <ThemedText style={styles.date}>{formatVisitedAt(place)}</ThemedText>
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(104, 112, 118, 0.18)',
  },
  emojiContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  emoji: {
    fontSize: 25,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 17,
  },
  favorite: {
    color: '#e05263',
    fontSize: 17,
  },
  location: {
    fontSize: 14,
    opacity: 0.75,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  category: {
    color: '#0a7ea4',
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
});
