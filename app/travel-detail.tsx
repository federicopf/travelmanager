import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TravelMap } from '@/components/travel-map';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Travel } from '@/constants/types';
import { deleteTravel, getTravel } from '@/lib/travels';

export default function TravelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [travel, setTravel] = useState<Travel | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const loadTravel = useCallback(async () => {
    if (!id) {
      Alert.alert('Errore', 'ID viaggio non valido');
      router.back();
      return;
    }

    try {
      setLoading(true);
      const data = await getTravel(id);
      if (!data) {
        Alert.alert('Errore', 'Viaggio non trovato');
        router.back();
        return;
      }
      setTravel(data);
    } catch (error: any) {
      console.error('Error loading travel:', error);
      Alert.alert('Errore', error.message || 'Impossibile caricare il viaggio');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTravel();
  }, [loadTravel]);

  const handleEdit = useCallback(() => {
    if (!travel) return;
    // TODO: Navigate to edit screen or open edit modal
    Alert.alert('Modifica', 'Funzionalità di modifica in arrivo');
  }, [travel]);

  const handleDelete = useCallback(() => {
    if (!travel) return;

    Alert.alert(
      'Elimina viaggio',
      `Sei sicuro di voler eliminare "${travel.title}"? Questa azione non può essere annullata.`,
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteTravel(travel.id);
              Alert.alert('Successo', 'Viaggio eliminato con successo', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              console.error('Error deleting travel:', error);
              Alert.alert('Errore', error.message || 'Errore durante l\'eliminazione del viaggio');
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [travel]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: travel?.title || 'Dettaglio viaggio',
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleEdit}
            activeOpacity={0.7}>
            <IconSymbol name="edit" size={20} color="#0a7ea4" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleDelete}
            activeOpacity={0.7}
            disabled={deleting}>
            <IconSymbol name="trash.fill" size={20} color="#dc3545" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, travel, deleting, handleEdit, handleDelete]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
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

  if (loading || !travel) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Caricamento...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Map Section */}
        <ThemedView style={styles.section}>
          <TravelMap
            latitude={travel.latitude}
            longitude={travel.longitude}
            destination={travel.destination}
          />
        </ThemedView>

        {/* Details Section */}
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

        {/* Features Button */}
        <ThemedView style={styles.section}>
          <TouchableOpacity
            style={styles.featuresButton}
            onPress={() => router.push(`/travel-features?id=${travel.id}`)}
            activeOpacity={0.8}>
            <View style={styles.featuresButtonContent}>
              <View style={styles.featuresIconContainer}>
                <IconSymbol name="menu" size={28} color="#fff" />
              </View>
              <View style={styles.featuresButtonTextContainer}>
                <ThemedText style={styles.featuresButtonTitle}>Funzionalità</ThemedText>
                <ThemedText style={styles.featuresButtonSubtitle}>
                  Checklist, Documenti e Tricount
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
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
  statusContainer: {
    marginBottom: 20,
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

