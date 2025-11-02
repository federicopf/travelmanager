import { Travel } from '@/constants/types';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface TravelCardProps {
  travel: Travel;
  onPress?: () => void;
}

export function TravelCard({ travel, onPress }: TravelCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {travel.title}
        </ThemedText>
        <ThemedText style={styles.destination}>
          {travel.destination}
        </ThemedText>
        <ThemedText style={styles.date}>
          {travel.startDate} - {travel.endDate}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  destination: {
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    opacity: 0.6,
  },
});

