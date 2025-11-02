import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TravelList } from '@/components/travel-list';
import { Travel } from '@/constants/types';

export default function TravelsScreen() {
  const mockTravels: Travel[] = [
    {
      id: '1',
      userId: 'mock-user-1',
      title: 'Vacanza a Parigi',
      destination: 'Parigi, Francia',
      startDate: '15/06/2024',
      endDate: '22/06/2024',
      status: 'completed',
    },
    {
      id: '2',
      userId: 'mock-user-1',
      title: 'Weekend a Roma',
      destination: 'Roma, Italia',
      startDate: '10/07/2024',
      endDate: '12/07/2024',
      status: 'planned',
    },
  ];

  const handleTravelPress = (travel: Travel) => {
    console.log('Travel pressed:', travel);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">I miei viaggi</ThemedText>
      </ThemedView>
      <TravelList travels={mockTravels} onTravelPress={handleTravelPress} />
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
  },
});

