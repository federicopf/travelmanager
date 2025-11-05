import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TravelList } from '@/components/travel-list';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Travel } from '@/constants/types';
import { useAuth } from '@/context/auth-context';
import { getTravels } from '@/lib/travels';

export default function TravelsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
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
        <ThemedView style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <ThemedText type="title" style={styles.title}>I miei viaggi</ThemedText>
        </ThemedView>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <ThemedText type="title" style={styles.title}>I miei viaggi</ThemedText>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateTravel}
          activeOpacity={0.7}>
          <IconSymbol name="plus.circle.fill" size={24} color="#fff" />
          <ThemedText style={styles.createButtonText}>Nuovo</ThemedText>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
