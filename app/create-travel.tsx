import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DatePickerInput } from '@/components/date-picker-input';
import { PlaceSearchInput } from '@/components/place-search-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { MapboxPlace, searchPlaces } from '@/lib/mapbox';
import { createTravel } from '@/lib/travels';

export default function CreateTravelScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date>(new Date());
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MapboxPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<MapboxPlace | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset results quando il testo è troppo corto
    if (destinationSearch.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Non fare la ricerca se il testo corrisponde al posto selezionato
    if (selectedPlace && destinationSearch.trim() === selectedPlace.address.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Cancella il timeout precedente se l'utente sta ancora scrivendo
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Imposta un nuovo timeout - aspetta che l'utente smetta di scrivere
    searchTimeoutRef.current = setTimeout(async () => {
      // Solo se il testo è ancora abbastanza lungo (potrebbe essere cambiato durante l'attesa)
      if (destinationSearch.trim().length < 3) {
        setSearchResults([]);
        setShowResults(false);
        setSearching(false);
        return;
      }

      // Non fare la ricerca se corrisponde al posto selezionato
      if (selectedPlace && destinationSearch.trim() === selectedPlace.address.trim()) {
        setSearchResults([]);
        setShowResults(false);
        setSearching(false);
        return;
      }

      setSearching(true);
      try {
        console.log('🔍 Starting search for:', destinationSearch);
        const results = await searchPlaces(destinationSearch, 5);
        console.log('✅ Search results:', results);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('❌ Error searching places:', error);
        Alert.alert('Errore', error instanceof Error ? error.message : 'Errore nella ricerca luoghi');
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 800); // Debounce di 800ms - aspetta che l'utente finisca di scrivere

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [destinationSearch, selectedPlace]);

  const handleSelectPlace = (place: MapboxPlace) => {
    // Cancella il timeout di ricerca se c'è uno in corso
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    setSelectedPlace(place);
    setDestination(place.address);
    setDestinationSearch(place.address);
    setShowResults(false);
    setSearchResults([]);
    setSearching(false);
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

    if (startDate > endDate) {
      Alert.alert('Errore', 'La data di inizio deve essere precedente alla data di fine');
      return;
    }

    // Formatta le date come YYYY-MM-DD
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setLoading(true);
    try {
      await createTravel({
        userId: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        destination: destination.trim(),
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        status: 'planned',
        latitude: selectedPlace ? selectedPlace.latitude : undefined,
        longitude: selectedPlace ? selectedPlace.longitude : undefined,
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
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
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
            <PlaceSearchInput
              value={destinationSearch}
              onChangeText={setDestinationSearch}
              onSelectPlace={handleSelectPlace}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowResults(true);
                }
              }}
              searching={searching}
              results={searchResults}
              showResults={showResults}
              selectedPlace={selectedPlace}
            />
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
            <DatePickerInput
              label="Data inizio *"
              value={startDate}
              onChange={setStartDate}
              minimumDate={new Date()}
              tempValue={tempStartDate}
              setTempValue={setTempStartDate}
              showPicker={showStartPicker}
              setShowPicker={setShowStartPicker}
            />
            <DatePickerInput
              label="Data fine *"
              value={endDate}
              onChange={setEndDate}
              minimumDate={startDate}
              tempValue={tempEndDate}
              setTempValue={setTempEndDate}
              showPicker={showEndPicker}
              setShowPicker={setShowEndPicker}
            />
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
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
  dateRow: {
    flexDirection: 'row',
    gap: 12,
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

