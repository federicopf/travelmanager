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
import { TravelDetailContent } from '@/components/travel/travel-detail-content';
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

  const handleFeaturesPress = useCallback(() => {
    if (!travel) return;
    router.push(`/travel-features?id=${travel.id}`);
  }, [travel]);

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
        <TravelDetailContent travel={travel} onFeaturesPress={handleFeaturesPress} />
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
});

