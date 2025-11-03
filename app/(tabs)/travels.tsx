import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TravelList } from '@/components/travel-list';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Travel } from '@/constants/types';
import { useAuth } from '@/context/auth-context';
import { getTravels } from '@/lib/travels';

export default function TravelsScreen() {
  const { user } = useAuth();
  const [travels, setTravels] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTravels = useCallback(async () => {
    if (!user) {
      setTravels([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getTravels(user.id);
      setTravels(data);
    } catch (error: any) {
      console.error('Error loading travels:', error);
      Alert.alert('Errore', 'Impossibile caricare i viaggi');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadTravels();
    }, [loadTravels])
  );

  const handleTravelPress = (travel: Travel) => {
    console.log('Travel pressed:', travel);
    // TODO: Navigate to travel detail screen
  };

  const handleCreateTravel = () => {
    router.push('/create-travel');
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">I miei viaggi</ThemedText>
        </ThemedView>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">I miei viaggi</ThemedText>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateTravel}
          activeOpacity={0.7}>
          <IconSymbol name="plus.circle.fill" size={28} color="#0a7ea4" />
          <ThemedText style={styles.createButtonText}>Nuovo viaggio</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <TravelList travels={travels} onTravelPress={handleTravelPress} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    gap: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

