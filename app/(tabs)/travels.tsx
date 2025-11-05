import { router, useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
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
  const navigation = useNavigation();
  const [travels, setTravels] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCreateTravel = useCallback(() => {
    router.push('/create-travel');
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'I miei viaggi',
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCreateTravel}
          activeOpacity={0.7}>
          <IconSymbol name="plus.circle.fill" size={24} color="#fff" />
          <ThemedText style={styles.headerButtonText}>Nuovo</ThemedText>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleCreateTravel]);

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
    router.push(`/travel-detail?id=${travel.id}`);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <TravelList travels={travels} onTravelPress={handleTravelPress} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  headerButtonText: {
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
