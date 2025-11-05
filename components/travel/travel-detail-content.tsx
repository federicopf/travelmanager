import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Travel } from '@/constants/types';
import { formatDate } from '@/utils/date-formatter';
import { getStatusColor, getStatusLabel } from '@/utils/travel-status';

interface TravelDetailContentProps {
  travel: Travel;
  onFeaturesPress: () => void;
}

export function TravelDetailContent({ travel, onFeaturesPress }: TravelDetailContentProps) {
  return (
    <>
      <ThemedView style={styles.section}>
        <View style={styles.titleRow}>
          <ThemedText type="title" style={styles.title}>
            {travel.title}
          </ThemedText>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(travel.status) + '20' },
            ]}>
            <ThemedText
              style={[styles.statusText, { color: getStatusColor(travel.status) }]}>
              {getStatusLabel(travel.status)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.detailRow}>
          <IconSymbol name="location.fill" size={20} color="#0a7ea4" />
          <ThemedText style={styles.detailText}>{travel.destination}</ThemedText>
        </View>

        <View style={styles.detailRow}>
          <IconSymbol name="calendar" size={20} color="#687076" />
          <ThemedText style={styles.detailText}>
            {formatDate(travel.startDate)} - {formatDate(travel.endDate)}
          </ThemedText>
        </View>

        {travel.description && (
          <ThemedView style={styles.descriptionContainer}>
            <ThemedText style={styles.descriptionLabel}>Descrizione</ThemedText>
            <ThemedText style={styles.description}>{travel.description}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <TouchableOpacity
          style={styles.featuresButton}
          onPress={onFeaturesPress}
          activeOpacity={0.8}>
          <View style={styles.featuresButtonContent}>
            <View style={styles.featuresIconContainer}>
              <IconSymbol name="menu" size={28} color="#fff" />
            </View>
            <View style={styles.featuresButtonTextContainer}>
              <ThemedText style={styles.featuresButtonTitle}>Gestisci viaggio</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  featuresButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  featuresButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featuresIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuresButtonTextContainer: {
    flex: 1,
    gap: 4,
  },
  featuresButtonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  featuresButtonSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
});

