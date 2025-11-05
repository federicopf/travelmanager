import { Travel } from '@/constants/types';
import { FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { TravelCard } from './travel-card';

interface TravelListProps {
  travels: Travel[];
  onTravelPress?: (travel: Travel) => void;
}

export function TravelList({ travels, onTravelPress }: TravelListProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + 100;

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
      contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
    fontWeight: '500',
  },
});

