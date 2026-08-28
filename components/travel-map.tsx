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

export function TravelMap({ latitude, longitude, destination }: TravelMapProps) {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        setMapboxToken(await getMapboxToken());
      } catch (error) {
        console.error('Error loading Mapbox token:', error);
      } finally {
        setLoading(false);
      }
    };
    void loadToken();
  }, []);

  if (!latitude || !longitude) {
    return <ThemedView style={styles.container}><ThemedView style={styles.placeholder}><ThemedText style={styles.placeholderText}>Mappa non disponibile{'\n'}<ThemedText style={styles.destinationText}>{destination}</ThemedText></ThemedText></ThemedView></ThemedView>;
  }

  if (loading || !mapboxToken) {
    return <ThemedView style={styles.container}><ThemedView style={styles.placeholder}><ActivityIndicator size="large" color="#0a7ea4" /><ThemedText style={styles.loadingText}>Caricamento mappa...</ThemedText></ThemedView></ThemedView>;
  }

  const mapHTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script><link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet"><style>body{margin:0}#map{width:100%;height:100vh}</style></head><body><div id="map"></div><script>mapboxgl.accessToken='${mapboxToken}';const map=new mapboxgl.Map({container:'map',style:'mapbox://styles/mapbox/streets-v12',center:[${longitude},${latitude}],zoom:12});map.on('load',()=>new mapboxgl.Marker({color:'#0a7ea4'}).setLngLat([${longitude},${latitude}]).setPopup(new mapboxgl.Popup({offset:25}).setText('${destination.replace(/'/g, "\\'")}')).addTo(map));</script></body></html>`;

  return <ThemedView style={styles.container}><WebView ref={webViewRef} source={{ html: mapHTML }} style={styles.webview} javaScriptEnabled domStorageEnabled /></ThemedView>;
}

const styles = StyleSheet.create({
  container: { height: 300, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  webview: { flex: 1, backgroundColor: 'transparent' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  placeholderText: { fontSize: 16, textAlign: 'center', opacity: 0.7 },
  destinationText: { fontSize: 18, fontWeight: '600', marginTop: 8, opacity: 1 },
  loadingText: { marginTop: 12, fontSize: 14, opacity: 0.7 },
});

