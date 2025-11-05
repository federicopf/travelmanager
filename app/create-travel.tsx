import DateTimePicker from '@react-native-community/datetimepicker';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
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
  }, [destinationSearch]);

  const handleSelectPlace = (place: MapboxPlace) => {
    setSelectedPlace(place);
    setDestination(place.address);
    setDestinationSearch(place.address);
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
                    key={item.id}
                    style={styles.resultItem}
                    onPress={() => handleSelectPlace(item)}>
                    <IconSymbol name="location.fill" size={16} color="#0a7ea4" />
                    <View style={styles.resultContent}>
                      <ThemedText style={styles.resultText} numberOfLines={1}>
                        {item.name}
                      </ThemedText>
                      {item.context && (
                        <ThemedText style={styles.resultContext} numberOfLines={1}>
                          {item.context}
                        </ThemedText>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
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
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setTempStartDate(startDate);
                  setShowStartPicker(true);
                }}>
                <ThemedText style={styles.dateButtonText}>
                  {startDate.toLocaleDateString('it-IT', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </ThemedText>
                <IconSymbol name="calendar" size={20} color="#0a7ea4" />
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={tempStartDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') {
                      setShowStartPicker(false);
                      if (event.type === 'set' && selectedDate) {
                        setStartDate(selectedDate);
                      }
                    } else if (Platform.OS === 'ios' && selectedDate) {
                      // Su iOS, aggiorna la data temporanea mentre l'utente scrolla
                      setTempStartDate(selectedDate);
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}
              {Platform.OS === 'ios' && showStartPicker && (
                <View style={styles.pickerActions}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      setStartDate(tempStartDate);
                      setShowStartPicker(false);
                    }}>
                    <ThemedText style={styles.pickerButtonText}>Conferma</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.dateInput}>
              <ThemedText style={styles.label}>Data fine *</ThemedText>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setTempEndDate(endDate);
                  setShowEndPicker(true);
                }}>
                <ThemedText style={styles.dateButtonText}>
                  {endDate.toLocaleDateString('it-IT', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </ThemedText>
                <IconSymbol name="calendar" size={20} color="#0a7ea4" />
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={tempEndDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') {
                      setShowEndPicker(false);
                      if (event.type === 'set' && selectedDate) {
                        setEndDate(selectedDate);
                      }
                    } else if (Platform.OS === 'ios' && selectedDate) {
                      // Su iOS, aggiorna la data temporanea mentre l'utente scrolla
                      setTempEndDate(selectedDate);
                    }
                  }}
                  minimumDate={startDate}
                />
              )}
              {Platform.OS === 'ios' && showEndPicker && (
                <View style={styles.pickerActions}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      setEndDate(tempEndDate);
                      setShowEndPicker(false);
                    }}>
                    <ThemedText style={styles.pickerButtonText}>Conferma</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
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
  resultContent: {
    flex: 1,
    gap: 2,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultContext: {
    fontSize: 12,
    opacity: 0.6,
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  dateButtonText: {
    fontSize: 16,
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
  },
  pickerButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pickerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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

