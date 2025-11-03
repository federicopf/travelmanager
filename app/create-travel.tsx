import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth-context';
import { NominatimPlace, searchPlaces } from '@/lib/nominatim';
import { createTravel } from '@/lib/travels';

export default function CreateTravelScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<NominatimPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<NominatimPlace | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (destinationSearch.trim().length > 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(async () => {
        setSearching(true);
        try {
          const results = await searchPlaces(destinationSearch, 5);
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          console.error('Error searching places:', error);
          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      }, 500); // Debounce di 500ms
    } else {
      setSearchResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [destinationSearch]);

  const handleSelectPlace = (place: NominatimPlace) => {
    setSelectedPlace(place);
    setDestination(place.display_name);
    setDestinationSearch(place.display_name);
    setShowResults(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Errore', 'Devi essere autenticato per creare un viaggio');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Errore', 'Inserisci un titolo per il viaggio');
      return;
    }

    if (!destination.trim()) {
      Alert.alert('Errore', 'Inserisci una destinazione');
      return;
    }

    if (!startDate || !endDate) {
      Alert.alert('Errore', 'Inserisci le date di inizio e fine');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      Alert.alert('Errore', 'La data di inizio deve essere precedente alla data di fine');
      return;
    }

    setLoading(true);
    try {
      await createTravel({
        userId: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        destination: destination.trim(),
        startDate,
        endDate,
        status: 'planned',
        latitude: selectedPlace ? parseFloat(selectedPlace.lat) : undefined,
        longitude: selectedPlace ? parseFloat(selectedPlace.lon) : undefined,
      });

      Alert.alert('Successo', 'Viaggio creato con successo!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore durante la creazione del viaggio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.form}>
          <ThemedText type="title" style={styles.title}>
            Crea nuovo viaggio
          </ThemedText>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Titolo *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Es. Vacanza a Parigi"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Destinazione *</ThemedText>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Cerca un luogo (es. Roma, Italia)"
                placeholderTextColor="#999"
                value={destinationSearch}
                onChangeText={setDestinationSearch}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true);
                  }
                }}
              />
              {searching && (
                <ActivityIndicator size="small" color="#0a7ea4" style={styles.searchLoader} />
              )}
            </View>
            {showResults && searchResults.length > 0 && (
              <View style={styles.resultsContainer}>
                {searchResults.map((item) => (
                  <TouchableOpacity
                    key={item.place_id.toString()}
                    style={styles.resultItem}
                    onPress={() => handleSelectPlace(item)}>
                    <IconSymbol name="location.fill" size={16} color="#0a7ea4" />
                    <ThemedText style={styles.resultText} numberOfLines={2}>
                      {item.display_name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {selectedPlace && (
              <View style={styles.selectedPlace}>
                <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
                <ThemedText style={styles.selectedPlaceText}>
                  {selectedPlace.display_name}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Descrizione</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Aggiungi una descrizione (opzionale)"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateInput}>
              <ThemedText style={styles.label}>Data inizio *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
            <View style={styles.dateInput}>
              <ThemedText style={styles.label}>Data fine *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            <ThemedText style={styles.buttonText}>
              {loading ? 'Creazione...' : 'Crea viaggio'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}>
            <ThemedText style={styles.cancelText}>Annulla</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  form: {
    gap: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  searchLoader: {
    position: 'absolute',
    right: 16,
  },
  resultsContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  resultText: {
    flex: 1,
    fontSize: 14,
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
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
    gap: 8,
  },
  button: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    opacity: 0.7,
  },
});

