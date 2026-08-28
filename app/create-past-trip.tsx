import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PastTrip } from '@/domain/past-trip';
import { createPastTrip, getPastTrip, getPastTrips, updatePastTrip } from '@/repositories/past-trip-repository';

type DateMode = 'single' | 'range';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function validDate(value: string): boolean {
  if (!/^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export default function CreatePastTripScreen() {
  const { id, parentTripId: initialParentTripId } = useLocalSearchParams<{ id?: string; parentTripId?: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [parentTripId, setParentTripId] = useState<string | undefined>(initialParentTripId);
  const [trips, setTrips] = useState<PastTrip[]>([]);
  const [dateMode, setDateMode] = useState<DateMode>('range');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));

  const parentCandidates = useMemo(
    () => trips.filter((trip) => trip.id !== id && trip.parentTripId !== id && !trip.parentTripId),
    [id, trips]
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: id ? 'Modifica viaggio' : initialParentTripId ? 'Nuovo sottoviaggio' : 'Nuovo viaggio' });
  }, [id, initialParentTripId, navigation]);

  useEffect(() => {
    const load = async () => {
      try {
        setTrips(await getPastTrips());
        if (!id) return;
        const trip = await getPastTrip(id);
        if (!trip) {
          Alert.alert('Viaggio non trovato', 'Questo viaggio non è più disponibile.');
          router.back();
          return;
        }
        setTitle(trip.title);
        setParentTripId(trip.parentTripId);
        setStartDate(trip.startDate ?? today());
        setEndDate(trip.endDate ?? trip.startDate ?? today());
        setDateMode(trip.endDate && trip.endDate !== trip.startDate ? 'range' : 'single');
      } catch (error) {
        console.error('Errore caricamento viaggio:', error);
        Alert.alert('Errore', 'Non riesco a preparare il viaggio.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const save = async () => {
    if (!title.trim()) {
      Alert.alert('Titolo mancante', 'Dai un nome al viaggio.');
      return;
    }
    if (!validDate(startDate)) {
      Alert.alert('Data non valida', 'Usa il formato AAAA-MM-GG.');
      return;
    }
    if (dateMode === 'range' && (!validDate(endDate) || startDate > endDate)) {
      Alert.alert('Intervallo non valido', 'La data finale deve essere successiva a quella iniziale.');
      return;
    }

    try {
      setSaving(true);
      const input = {
        parentTripId,
        title,
        datePrecision: 'exact' as const,
        startDate,
        endDate: dateMode === 'range' ? endDate : undefined,
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
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <ThemedText style={styles.heroEmoji}>{parentTripId ? '↳' : '🧳'}</ThemedText>
          <View style={styles.heroCopy}>
            <ThemedText type="title">{id ? 'Modifica viaggio' : parentTripId ? 'Nuovo sottoviaggio' : 'Viaggio passato'}</ThemedText>
            <ThemedText style={styles.muted}>Un periodo che raccoglie tappe e ricordi.</ThemedText>
          </View>
        </View>

        <Field label="Titolo *">
          <TextInput style={styles.input} placeholder="Es. Islanda on the road" placeholderTextColor="#8a9196" value={title} onChangeText={setTitle} />
        </Field>

        <Field label="Durata">
          <View style={styles.chips}>
            {([['single', 'Un giorno'], ['range', 'Intervallo']] as const).map(([mode, label]) => (
              <TouchableOpacity key={mode} style={[styles.chip, dateMode === mode && styles.chipSelected]} onPress={() => setDateMode(mode)}>
                <ThemedText style={[styles.chipText, dateMode === mode && styles.chipTextSelected]}>{label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <View style={styles.dateRow}>
          <Field label={dateMode === 'range' ? 'Dal *' : 'Data *'} style={styles.flex}>
            <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="AAAA-MM-GG" keyboardType="numbers-and-punctuation" />
          </Field>
          {dateMode === 'range' && (
            <Field label="Al *" style={styles.flex}>
              <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="AAAA-MM-GG" keyboardType="numbers-and-punctuation" />
            </Field>
          )}
        </View>

        {parentCandidates.length > 0 && (
          <Field label="Dentro un altro viaggio?">
            <View style={styles.tripList}>
              <TouchableOpacity style={[styles.tripChip, !parentTripId && styles.tripChipSelected]} onPress={() => setParentTripId(undefined)}>
                <ThemedText style={!parentTripId ? styles.tripChipTextSelected : undefined}>Viaggio principale</ThemedText>
              </TouchableOpacity>
              {parentCandidates.map((trip) => (
                <TouchableOpacity key={trip.id} style={[styles.tripChip, parentTripId === trip.id && styles.tripChipSelected]} onPress={() => setParentTripId(trip.id)}>
                  <ThemedText style={parentTripId === trip.id ? styles.tripChipTextSelected : undefined}>↳ Sottoviaggio di {trip.title}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </Field>
        )}

        <TouchableOpacity style={[styles.save, saving && styles.disabled]} onPress={save} disabled={saving}>
          <ThemedText style={styles.saveText}>{saving ? 'Salvataggio…' : 'Salva viaggio'}</ThemedText>
        </TouchableOpacity>
      </ScrollView>
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
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroEmoji: { fontSize: 42 },
  heroCopy: { flex: 1, gap: 4 },
  muted: { fontSize: 14, opacity: 0.62 },
  field: { gap: 8 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.65 },
  input: { borderWidth: 1, borderColor: 'rgba(104,112,118,0.25)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: '#687076' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 16, backgroundColor: 'rgba(104,112,118,0.1)' },
  chipSelected: { backgroundColor: '#0a7ea4' },
  chipText: { fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: '#fff' },
  dateRow: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  tripList: { gap: 8 },
  tripChip: { borderWidth: 1, borderColor: 'rgba(104,112,118,0.2)', borderRadius: 13, padding: 12 },
  tripChipSelected: { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' },
  tripChipTextSelected: { color: '#fff', fontWeight: '700' },
  save: { backgroundColor: '#0a7ea4', padding: 17, borderRadius: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.55 },
});
