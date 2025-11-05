import { Travel } from '@/constants/types';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface TravelCardProps {
  travel: Travel;
  onPress?: () => void;
}

export function TravelCard({ travel, onPress }: TravelCardProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'ongoing':
        return '#FF9800';
      default:
        return '#2196F3';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completato';
      case 'ongoing':
        return 'In corso';
      default:
        return 'Pianificato';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <ThemedText type="defaultSemiBold" style={styles.title}>
              {travel.title}
            </ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(travel.status) + '20' }]}>
              <ThemedText style={[styles.statusText, { color: getStatusColor(travel.status) }]}>
                {getStatusLabel(travel.status)}
              </ThemedText>
            </View>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.destinationRow}>
            <IconSymbol name="location.fill" size={16} color="#0a7ea4" />
            <ThemedText style={styles.destination} numberOfLines={1}>
              {travel.destination}
            </ThemedText>
          </View>
          
          <View style={styles.dateRow}>
            <IconSymbol name="calendar" size={14} color="#687076" />
            <ThemedText style={styles.date}>
              {formatDate(travel.startDate)} - {formatDate(travel.endDate)}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    gap: 8,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  destination: {
    fontSize: 15,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 13,
    opacity: 0.7,
  },
});
