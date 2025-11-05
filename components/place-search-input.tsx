import { MapboxPlace } from '@/lib/mapbox';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { PlaceResultsList } from './place-results-list';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';

interface PlaceSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectPlace: (place: MapboxPlace) => void;
  onFocus?: () => void;
  searching: boolean;
  results: MapboxPlace[];
  showResults: boolean;
  selectedPlace: MapboxPlace | null;
}

export function PlaceSearchInput({
  value,
  onChangeText,
  onSelectPlace,
  onFocus,
  searching,
  results,
  showResults,
  selectedPlace,
}: PlaceSearchInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Cerca un luogo (es. Roma, Italia)"
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
        />
        {searching && (
          <ActivityIndicator size="small" color="#0a7ea4" style={styles.loader} />
        )}
      </View>
      {showResults && (
        <PlaceResultsList results={results} onSelectPlace={onSelectPlace} />
      )}
      {selectedPlace && (
        <View style={styles.selectedPlace}>
          <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
          <ThemedText style={styles.selectedPlaceText}>
            {selectedPlace.address}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    position: 'relative',
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  loader: {
    position: 'absolute',
    right: 16,
  },
  selectedPlace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  selectedPlaceText: {
    flex: 1,
    fontSize: 14,
    color: '#4CAF50',
  },
});

