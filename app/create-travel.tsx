import { router } from 'expo-router';
import { useState } from 'react';
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
import { usePlaceSearch } from '@/hooks/use-place-search';
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

  const {
    searching,
    searchResults,
    selectedPlace,
    showResults,
    performSearch,
    handleSelectPlace,
    setShowResults,
  } = usePlaceSearch();

  const handleDestinationChange = (text: string) => {
    setDestinationSearch(text);
    performSearch(text);
  };

  const handlePlaceSelect = (place: any) => {
    const address = handleSelectPlace(place);
    setDestination(address);
    setDestinationSearch(address);
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
      const newTravel = await createTravel({
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

      // Naviga direttamente al dettaglio del viaggio appena creato
      router.push(`/travel-detail?id=${newTravel.id}`);
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore durante la creazione del viaggio');
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
            Nuovo viaggio
          </ThemedText>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Titolo</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Es. Vacanza a Parigi"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Destinazione</ThemedText>
            <PlaceSearchInput
              value={destinationSearch}
              onChangeText={handleDestinationChange}
              onSelectPlace={handlePlaceSelect}
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
              label="Data inizio"
              value={startDate}
              onChange={setStartDate}
              minimumDate={new Date()}
              tempValue={tempStartDate}
              setTempValue={setTempStartDate}
              showPicker={showStartPicker}
              setShowPicker={setShowStartPicker}
            />
            <DatePickerInput
              label="Data fine"
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
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  inputContainer: {
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderColor: 'rgba(0, 0, 0, 0.1)',
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
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

