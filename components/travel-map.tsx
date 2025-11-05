import { StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface TravelMapProps {
  latitude?: number;
  longitude?: number;
  destination: string;
}

/**
 * Mapbox Static Images API
 * Generates a static map image using Mapbox Static Images API
 * Note: This requires a Mapbox access token. For production, consider using
 * a Supabase Edge Function to proxy the request and keep the token secure.
 */
export function TravelMap({ latitude, longitude, destination }: TravelMapProps) {
  // If we don't have coordinates, show a placeholder
  if (!latitude || !longitude) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.placeholder}>
          <ThemedText style={styles.placeholderText}>
            Mappa non disponibile{'\n'}
            <ThemedText style={styles.destinationText}>{destination}</ThemedText>
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  // For now, show a placeholder. In production, use the Mapbox Static Images API
  // through a Supabase Edge Function to keep the token secure
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.placeholder}>
        <ThemedText style={styles.placeholderText}>
          📍 {destination}{'\n'}
          <ThemedText style={styles.coordinatesText}>
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </ThemedText>
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  destinationText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    opacity: 1,
  },
  coordinatesText: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
});

