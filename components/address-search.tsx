import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  namedetails?: { name?: string };
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

export interface AddressSearchSelection {
  latitude: number;
  longitude: number;
  addressLabel: string;
  suggestedTitle: string;
  countryCode?: string;
  countryName?: string;
}

interface AddressSearchProps {
  value: string;
  onChangeText: (value: string) => void;
  onSelect: (selection: AddressSearchSelection) => void;
}

export function AddressSearch({ value, onChangeText, onSelect }: AddressSearchProps) {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');

  const search = async () => {
    const query = value.trim();
    if (query.length < 3) {
      setMessage('Scrivi almeno 3 caratteri.');
      setResults([]);
      return;
    }

    try {
      setSearching(true);
      setMessage('');
      setResults([]);
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&namedetails=1&limit=5&accept-language=it&q=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'TravelManager/1.0',
        },
      });
      if (!response.ok) throw new Error(`Geocoding HTTP ${response.status}`);
      const data = (await response.json()) as NominatimResult[];
      setResults(data);
      if (data.length === 0) setMessage('Nessun risultato. Prova ad aggiungere città o paese.');
    } catch (error) {
      console.error('Errore ricerca indirizzo:', error);
      setMessage('Ricerca non disponibile. Puoi comunque scegliere il punto sulla mappa.');
    } finally {
      setSearching(false);
    }
  };

  const selectResult = (result: NominatimResult) => {
    const address = result.address;
    const suggestedTitle = result.namedetails?.name
      || result.name
      || address?.city
      || address?.town
      || address?.village
      || address?.municipality
      || value.trim();

    onChangeText(result.display_name);
    setResults([]);
    setMessage('Posizione trovata e segnata sulla mappa.');
    onSelect({
      latitude: Number(result.lat),
      longitude: Number(result.lon),
      addressLabel: result.display_name,
      suggestedTitle,
      countryCode: address?.country_code?.toUpperCase(),
      countryName: address?.country,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            setMessage('');
            setResults([]);
          }}
          onSubmitEditing={search}
          placeholder="Es. Cova Tallada, Dénia o Calle Colón 25"
          placeholderTextColor="#8a9196"
          returnKeyType="search"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.searchButton} onPress={search} disabled={searching}>
          {searching
            ? <ActivityIndicator color="#fff" size="small" />
            : <ThemedText style={styles.searchButtonText}>Cerca</ThemedText>}
        </TouchableOpacity>
      </View>
      <ThemedText style={styles.hint}>Puoi cercare città, sentieri, spiagge, locali o un indirizzo completo.</ThemedText>
      {results.map((result) => (
        <TouchableOpacity key={result.place_id} style={styles.result} onPress={() => selectResult(result)}>
          <ThemedText style={styles.resultTitle} numberOfLines={2}>{result.display_name}</ThemedText>
          <ThemedText style={styles.choose}>Scegli</ThemedText>
        </TouchableOpacity>
      ))}
      {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}
      <ThemedText style={styles.attribution}>Ricerca © OpenStreetMap contributors</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  searchRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: 'rgba(104,112,118,0.25)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#687076' },
  searchButton: { minWidth: 70, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#0a7ea4' },
  searchButtonText: { color: '#fff', fontWeight: '700' },
  hint: { fontSize: 12, opacity: 0.58 },
  result: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, backgroundColor: 'rgba(10,126,164,0.08)' },
  resultTitle: { flex: 1, fontSize: 13 },
  choose: { color: '#0a7ea4', fontSize: 12, fontWeight: '700' },
  message: { fontSize: 12, color: '#0a7ea4' },
  attribution: { fontSize: 10, opacity: 0.42 },
});
