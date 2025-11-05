import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { getMapboxToken } from '@/lib/mapbox';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface TravelMapProps {
  latitude?: number;
  longitude?: number;
  destination: string;
}

/**
 * Dynamic Mapbox Map using WebView with Mapbox GL JS
 * Shows an interactive map with the travel destination marked
 */
export function TravelMap({ latitude, longitude, destination }: TravelMapProps) {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await getMapboxToken();
        setMapboxToken(token);
      } catch (error) {
        console.error('Error loading Mapbox token:', error);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

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

  // Show loading while token is being fetched
  if (loading || !mapboxToken) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.placeholder}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Caricamento mappa...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  // Generate HTML for Mapbox GL JS map
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mapbox Map</title>
      <script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
      <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        mapboxgl.accessToken = '${mapboxToken}';
        
        const map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [${longitude}, ${latitude}],
          zoom: 12
        });

        map.on('load', () => {
          // Add marker
          new mapboxgl.Marker({ color: '#0a7ea4' })
            .setLngLat([${longitude}, ${latitude}])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setText('${destination.replace(/'/g, "\\'")}')
            )
            .addTo(map);
        });
      </script>
    </body>
    </html>
  `;

  return (
    <ThemedView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a7ea4" />
          </ThemedView>
        )}
      />
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
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.7,
  },
});

