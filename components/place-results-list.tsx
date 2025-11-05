import { MapboxPlace } from '@/lib/mapbox';
import { ScrollView, StyleSheet, View } from 'react-native';
import { PlaceResultItem } from './place-result-item';

interface PlaceResultsListProps {
  results: MapboxPlace[];
  onSelectPlace: (place: MapboxPlace) => void;
}

export function PlaceResultsList({ results, onSelectPlace }: PlaceResultsListProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled">
        {results.map((item) => (
          <PlaceResultItem key={item.id} place={item} onPress={onSelectPlace} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  scrollView: {
    maxHeight: 200,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

