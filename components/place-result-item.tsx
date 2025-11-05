import { MapboxPlace } from '@/lib/mapbox';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';

interface PlaceResultItemProps {
  place: MapboxPlace;
  onPress: (place: MapboxPlace) => void;
}

export function PlaceResultItem({ place, onPress }: PlaceResultItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(place)}
      activeOpacity={0.7}>
      <IconSymbol name="location.fill" size={16} color="#0a7ea4" />
      <View style={styles.content}>
        <ThemedText style={styles.name} numberOfLines={1}>
          {place.name}
        </ThemedText>
        {place.context && (
          <ThemedText style={styles.context} numberOfLines={1}>
            {place.context}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
  },
  context: {
    fontSize: 12,
    opacity: 0.6,
  },
});

