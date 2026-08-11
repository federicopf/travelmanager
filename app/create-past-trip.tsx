import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DatePrecision } from '@/domain/visited-place';
import { createPastTrip, getPastTrip, updatePastTrip } from '@/repositories/past-trip-repository';

const PRECISIONS: { value: DatePrecision; label: string }[] = [
  { value: 'exact', label: 'Date esatte' },
  { value: 'month', label: 'Solo mese' },
  { value: 'year', label: 'Solo anno' },
  { value: 'unknown', label: 'Non ricordo' },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function validDate(value: string, precision: DatePrecision): boolean {
  if (precision === 'unknown') return true;
  if (precision === 'year') return /^\d{4}$/.test(value);
  if (precision === 'month') return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
  return /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(value);
}

function placeholder(precision: DatePrecision): string {
  if (precision === 'year') return 'AAAA';
  if (precision === 'month') return 'AAAA-MM';
  return 'AAAA-MM-GG';
}

export default function CreatePastTripScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [precision, setPrecision] = useState<DatePrecision>('exact');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));

  useLayoutEffect(() => {
    navigation.setOptions({ title: id ? 'Modifica viaggio' : 'Nuovo viaggio' });
  }, [id, navigation]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const trip = await getPastTrip(id);
        if (!trip) {
          Alert.alert('Viaggio non trovato', 'Questo viaggio non e piu disponibile.');
          router.back();
          return;
        }
        setTitle(trip.title);
        setDescription(trip.description ?? '');
        setPrecision(trip.datePrecision);
        setStartDate(trip.startDate ?? '');
        setEndDate(trip.endDate ?? '');
        setNotes(trip.notes ?? '');
      } catch (error) {
        console.error('Errore caricamento viaggio:', error);
        Alert.alert('Errore', 'Non riesco a caricare il viaggio da modificare.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const changePrecision = (next: DatePrecision) => {
    const current = today();
    setPrecision(next);
    setStartDate(next === 'unknown' ? '' : next === 'year' ? current.slice(0, 4) : next === 'month' ? current.slice(0, 7) : current);
    setEndDate(next === 'exact' ? current : '');
  };

  const save = async () => {
    if (!title.trim()) {
      Alert.alert('Titolo mancante', 'Dai un nome al viaggio.');
      return;
    }
    if (!validDate(startDate, precision) || (endDate && !validDate(endDate, precision))) {
      Alert.alert('Periodo non valido', `Usa il formato ${placeholder(precision)}.`);
      return;
    }
    if (precision === 'exact' && endDate && startDate > endDate) {
      Alert.alert('Periodo non valido', 'La fine del viaggio deve essere successiva alla partenza.');
      return;
    }

    try {
      setSaving(true);
      const input = {
        title,
        description,
        datePrecision: precision,
        startDate: precision === 'unknown' ? undefined : startDate,
        endDate: precision === 'unknown' || !endDate ? undefined : endDate,
        notes,
      };
      if (id) {
        await updatePastTrip(id, input);
        router.back();
      } else {
        const trip = await createPastTrip(input);
        router.replace(`/past-trip-detail?id=${trip.id}`);
      }
    } catch (error) {
      console.error('Errore salvataggio viaggio:', error);
      Alert.alert('Errore', 'Non sono riuscito a salvare il viaggio.');
      setSaving(false);
    }
  };

  if (loading) {
    return <ThemedView style={[styles.container, styles.loading]}><ActivityIndicator size="large" color="#0a7ea4" /></ThemedView>;
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <ThemedText style={styles.heroEmoji}>🧳</ThemedText>
            <View style={styles.heroCopy}>
              <ThemedText type="title">{id ? 'Modifica viaggio' : 'Viaggio passato'}</ThemedText>
              <ThemedText style={styles.muted}>Ricostruisci il viaggio una tappa alla volta.</ThemedText>
            </View>
          </View>

          <Field label="Titolo *">
            <TextInput style={styles.input} placeholder="Es. Islanda on the road" placeholderTextColor="#8a9196" value={title} onChangeText={setTitle} />
          </Field>
          <Field label="Descrizione">
            <TextInput style={styles.input} placeholder="Una breve descrizione" placeholderTextColor="#8a9196" value={description} onChangeText={setDescription} />
          </Field>

          <Field label="Precisione del periodo">
            <View style={styles.chips}>
              {PRECISIONS.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.chip, precision === item.value && styles.chipSelected]}
                  onPress={() => changePrecision(item.value)}>
                  <ThemedText style={[styles.chipText, precision === item.value && styles.chipTextSelected]}>{item.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          {precision !== 'unknown' && (
            <View style={styles.dateRow}>
              <Field label={precision === 'exact' ? 'Partenza *' : 'Periodo *'} style={styles.flex}>
                <TextInput style={styles.input} placeholder={placeholder(precision)} placeholderTextColor="#8a9196" value={startDate} onChangeText={setStartDate} keyboardType="numbers-and-punctuation" />
              </Field>
              {precision === 'exact' && (
                <Field label="Ritorno" style={styles.flex}>
                  <TextInput style={styles.input} placeholder={placeholder(precision)} placeholderTextColor="#8a9196" value={endDate} onChangeText={setEndDate} keyboardType="numbers-and-punctuation" />
                </Field>
              )}
            </View>
          )}

          <Field label="Note">
            <TextInput style={[styles.input, styles.textArea]} placeholder="Persone, ricordi, contesto..." placeholderTextColor="#8a9196" value={notes} onChangeText={setNotes} multiline textAlignVertical="top" />
          </Field>

          <TouchableOpacity style={[styles.save, saving && styles.disabled]} onPress={save} disabled={saving}>
            <ThemedText style={styles.saveText}>{saving ? 'Salvataggio...' : id ? 'Salva modifiche' : 'Crea viaggio'}</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: object }) {
  return <View style={[styles.field, style]}><ThemedText style={styles.label}>{label}</ThemedText>{children}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 20 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  heroEmoji: { fontSize: 42 },
  heroCopy: { flex: 1, gap: 4 },
  muted: { fontSize: 14, opacity: 0.62 },
  field: { gap: 8 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.65 },
  input: { borderWidth: 1, borderColor: 'rgba(104,112,118,0.25)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: '#687076' },
  textArea: { minHeight: 110, paddingTop: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 16, backgroundColor: 'rgba(104,112,118,0.1)' },
  chipSelected: { backgroundColor: '#0a7ea4' },
  chipText: { fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: '#fff' },
  dateRow: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  save: { backgroundColor: '#0a7ea4', padding: 17, borderRadius: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.55 },
});
