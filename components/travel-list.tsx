import { Travel } from '@/constants/types';
import { FlatList, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { TravelCard } from './travel-card';

interface TravelListProps {
  travels: Travel[];
  onTravelPress?: (travel: Travel) => void;
}

export function TravelList({ travels, onTravelPress }: TravelListProps) {
  if (travels.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>
          Nessun viaggio presente
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={travels}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TravelCard 
          travel={item} 
          onPress={() => onTravelPress?.(item)}
        />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
});

