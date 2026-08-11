import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  CATEGORY_EMOJI,
  CATEGORY_LABELS,
  DatePrecision,
  VISITED_PLACE_CATEGORIES,
  VisitedPlaceCategory,
} from '@/domain/visited-place';
import { PastTrip } from '@/domain/past-trip';
import { getPastTrips } from '@/repositories/past-trip-repository';
import {
  createVisitedPlace,
  getVisitedPlace,
  updateVisitedPlace,
} from '@/repositories/visited-place-repository';
import { countryCodeToFlag, normalizeCountryCode } from '@/utils/country';

const DATE_PRECISIONS: { value: DatePrecision; label: string }[] = [
  { value: 'exact', label: 'Giorno' },
  { value: 'month', label: 'Mese' },
  { value: 'year', label: 'Anno' },
  { value: 'unknown', label: 'Non ricordo' },
];

function todayAsIsoDate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidApproximateDate(value: string, precision: DatePrecision): boolean {
  if (precision === 'unknown') return true;
  if (precision === 'year') return /^\d{4}$/.test(value);
  if (precision === 'month') return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
  if (!/^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function datePlaceholder(precision: DatePrecision): string {
  if (precision === 'year') return 'Es. 2022';
  if (precision === 'month') return 'Es. 2022-08';
  return 'AAAA-MM-GG';
}

export default function CreateVisitedPlaceScreen() {
  const { id, tripId: initialTripId } = useLocalSearchParams<{ id?: string; tripId?: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [tripId, setTripId] = useState<string | undefined>(initialTripId);
  const [trips, setTrips] = useState<PastTrip[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VisitedPlaceCategory>('city');
  const [customCategory, setCustomCategory] = useState('');
  const [countryName, setCountryName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [locality, setLocality] = useState('');
  const [region, setRegion] = useState('');
  const [datePrecision, setDatePrecision] = useState<DatePrecision>('exact');
  const [visitedAt, setVisitedAt] = useState(todayAsIsoDate());
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [wouldReturn, setWouldReturn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));

  const normalizedCode = useMemo(() => normalizeCountryCode(countryCode), [countryCode]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: id ? 'Modifica luogo' : 'Aggiungi luogo' });
  }, [id, navigation]);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        setTrips(await getPastTrips());
      } catch (error) {
        console.error('Errore caricamento viaggi:', error);
      }
    };
    void loadTrips();
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadPlace = async () => {
      try {
        const place = await getVisitedPlace(id);
        if (!place) {
          Alert.alert('Luogo non trovato', 'Questo ricordo non e piu disponibile.');
          router.back();
          return;
        }

        setTripId(place.tripId);
        setTitle(place.title);
        setCategory(place.category);
        setCustomCategory(place.customCategory ?? '');
        setCountryName(place.countryName);
        setCountryCode(place.countryCode);
        setLocality(place.locality ?? '');
        setRegion(place.region ?? '');
        setDatePrecision(place.datePrecision);
        setVisitedAt(place.visitedAt ?? '');
        setLatitude(place.latitude?.toString() ?? '');
        setLongitude(place.longitude?.toString() ?? '');
        setTags(place.tags.join(', '));
        setNotes(place.notes ?? '');
        setFavorite(place.favorite);
        setWouldReturn(place.wouldReturn ?? false);
      } catch (error) {
        console.error('Errore caricamento luogo:', error);
        Alert.alert('Errore', 'Non riesco a caricare il ricordo da modificare.');
      } finally {
        setLoading(false);
      }
    };

    void loadPlace();
  }, [id]);

  const handlePrecisionChange = (precision: DatePrecision) => {
    setDatePrecision(precision);
    const today = todayAsIsoDate();
    if (precision === 'exact') setVisitedAt(today);
    if (precision === 'month') setVisitedAt(today.slice(0, 7));
    if (precision === 'year') setVisitedAt(today.slice(0, 4));
    if (precision === 'unknown') setVisitedAt('');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Titolo mancante', 'Dai un nome al luogo o all’esperienza.');
      return;
    }

    if (!countryName.trim() || !/^[A-Z]{2}$/.test(normalizedCode)) {
      Alert.alert('Paese non valido', 'Inserisci il nome e il codice ISO di due lettere, per esempio IT.');
      return;
    }

    if (category === 'other' && !customCategory.trim()) {
      Alert.alert('Categoria mancante', 'Descrivi il tipo di esperienza.');
      return;
    }

    if (!isValidApproximateDate(visitedAt.trim(), datePrecision)) {
      Alert.alert('Data non valida', `Usa il formato indicato: ${datePlaceholder(datePrecision)}.`);
      return;
    }

    const parsedLatitude = latitude.trim() ? Number(latitude.replace(',', '.')) : undefined;
    const parsedLongitude = longitude.trim() ? Number(longitude.replace(',', '.')) : undefined;
    const hasOnlyOneCoordinate = (parsedLatitude === undefined) !== (parsedLongitude === undefined);
    const invalidCoordinates =
      (parsedLatitude !== undefined && (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90)) ||
      (parsedLongitude !== undefined && (!Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180));

    if (hasOnlyOneCoordinate || invalidCoordinates) {
      Alert.alert('Coordinate non valide', 'Inserisci latitudine e longitudine insieme, nei rispettivi intervalli.');
      return;
    }

    try {
      setSaving(true);
      const input = {
        tripId,
        title,
        category,
        customCategory: category === 'other' ? customCategory : undefined,
        countryName,
        countryCode: normalizedCode,
        locality,
        region,
        visitedAt: datePrecision === 'unknown' ? undefined : visitedAt.trim(),
        datePrecision,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        favorite,
        wouldReturn,
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        notes,
      };
      if (id) {
        await updateVisitedPlace(id, input);
        router.back();
      } else {
        const place = await createVisitedPlace(input);
        router.replace(`/place-detail?id=${place.id}`);
      }
    } catch (error) {
      console.error('Errore salvataggio luogo:', error);
      Alert.alert('Errore', 'Non sono riuscito a salvare il luogo sul dispositivo.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <ThemedText style={styles.heroEmoji}>{CATEGORY_EMOJI[category]}</ThemedText>
            <View style={styles.heroText}>
              <ThemedText type="title">{id ? 'Modifica ricordo' : 'Nuovo ricordo'}</ThemedText>
              <ThemedText style={styles.muted}>Citta, natura, trekking o qualsiasi posto vissuto.</ThemedText>
            </View>
          </View>

          <Field label="Nome del luogo o esperienza *">
            <TextInput
              style={styles.input}
              placeholder="Es. Sentiero degli Dei"
              placeholderTextColor="#8a9196"
              value={title}
              onChangeText={setTitle}
            />
          </Field>

          <Field label="Categoria *">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {VISITED_PLACE_CATEGORIES.map((item) => {
                const selected = item === category;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                    onPress={() => setCategory(item)}>
                    <ThemedText style={styles.chipEmoji}>{CATEGORY_EMOJI[item]}</ThemedText>
                    <ThemedText style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>
                      {CATEGORY_LABELS[item]}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Field>

          {category === 'other' && (
            <Field label="Categoria personalizzata *">
              <TextInput
                style={styles.input}
                placeholder="Es. Via ferrata"
                placeholderTextColor="#8a9196"
                value={customCategory}
                onChangeText={setCustomCategory}
              />
            </Field>
          )}

          <View style={styles.twoColumns}>
            <Field label="Paese *" style={styles.flexField}>
              <TextInput
                style={styles.input}
                placeholder="Italia"
                placeholderTextColor="#8a9196"
                value={countryName}
                onChangeText={setCountryName}
              />
            </Field>
            <Field label="Codice *" style={styles.codeField}>
              <View style={styles.codeInputWrap}>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="IT"
                  placeholderTextColor="#8a9196"
                  autoCapitalize="characters"
                  maxLength={2}
                  value={countryCode}
                  onChangeText={setCountryCode}
                />
                <ThemedText style={styles.flag}>{countryCodeToFlag(normalizedCode)}</ThemedText>
              </View>
            </Field>
          </View>

          <View style={styles.twoColumns}>
            <Field label="Localita" style={styles.flexField}>
              <TextInput style={styles.input} value={locality} onChangeText={setLocality} placeholder="Positano" placeholderTextColor="#8a9196" />
            </Field>
            <Field label="Regione" style={styles.flexField}>
              <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="Campania" placeholderTextColor="#8a9196" />
            </Field>
          </View>

          {trips.length > 0 && (
            <Field label="Viaggio collegato">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                <TouchableOpacity
                  style={[styles.categoryChip, !tripId && styles.categoryChipSelected]}
                  onPress={() => setTripId(undefined)}>
                  <ThemedText style={[styles.categoryChipText, !tripId && styles.categoryChipTextSelected]}>Nessun viaggio</ThemedText>
                </TouchableOpacity>
                {trips.map((trip) => (
                  <TouchableOpacity
                    key={trip.id}
                    style={[styles.categoryChip, tripId === trip.id && styles.categoryChipSelected]}
                    onPress={() => setTripId(trip.id)}>
                    <ThemedText style={styles.chipEmoji}>🧳</ThemedText>
                    <ThemedText style={[styles.categoryChipText, tripId === trip.id && styles.categoryChipTextSelected]}>
                      {trip.title}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Field>
          )}

          <Field label="Quanto ricordi della data?">
            <View style={styles.precisionRow}>
              {DATE_PRECISIONS.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.precisionChip, datePrecision === item.value && styles.precisionChipSelected]}
                  onPress={() => handlePrecisionChange(item.value)}>
                  <ThemedText style={[styles.precisionText, datePrecision === item.value && styles.precisionTextSelected]}>
                    {item.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          {datePrecision !== 'unknown' && (
            <Field label="Data della visita *">
              <TextInput
                style={styles.input}
                placeholder={datePlaceholder(datePrecision)}
                placeholderTextColor="#8a9196"
                value={visitedAt}
                onChangeText={setVisitedAt}
                keyboardType="numbers-and-punctuation"
              />
            </Field>
          )}

          <Field label="Coordinate (opzionali)">
            <View style={styles.twoColumns}>
              <TextInput
                style={[styles.input, styles.flexField]}
                placeholder="Latitudine"
                placeholderTextColor="#8a9196"
                keyboardType="numbers-and-punctuation"
                value={latitude}
                onChangeText={setLatitude}
              />
              <TextInput
                style={[styles.input, styles.flexField]}
                placeholder="Longitudine"
                placeholderTextColor="#8a9196"
                keyboardType="numbers-and-punctuation"
                value={longitude}
                onChangeText={setLongitude}
              />
            </View>
          </Field>

          <Field label="Tag">
            <TextInput
              style={styles.input}
              placeholder="mare, amici, tramonto"
              placeholderTextColor="#8a9196"
              value={tags}
              onChangeText={setTags}
            />
          </Field>

          <Field label="Note">
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Cosa vuoi ricordare?"
              placeholderTextColor="#8a9196"
              multiline
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />
          </Field>

          <View style={styles.toggleCard}>
            <View style={styles.toggleText}>
              <ThemedText type="defaultSemiBold">Luogo del cuore</ThemedText>
              <ThemedText style={styles.muted}>Aggiungilo ai preferiti.</ThemedText>
            </View>
            <Switch value={favorite} onValueChange={setFavorite} trackColor={{ true: '#0a7ea4' }} />
          </View>

          <View style={styles.toggleCard}>
            <View style={styles.toggleText}>
              <ThemedText type="defaultSemiBold">Ci tornerei</ThemedText>
              <ThemedText style={styles.muted}>Un segnale utile per le collezioni future.</ThemedText>
            </View>
            <Switch value={wouldReturn} onValueChange={setWouldReturn} trackColor={{ true: '#0a7ea4' }} />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={saving}>
            <ThemedText style={styles.saveButtonText}>
              {saving ? 'Salvataggio...' : id ? 'Salva modifiche' : 'Salva nel diario'}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: object }) {
  return (
    <View style={[styles.field, style]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 20 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  heroEmoji: { fontSize: 42 },
  heroText: { flex: 1, gap: 4 },
  muted: { opacity: 0.62, fontSize: 14 },
  field: { gap: 8 },
  flexField: { flex: 1 },
  codeField: { width: 112 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.65 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(104, 112, 118, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: '#687076',
  },
  textArea: { minHeight: 110, paddingTop: 13 },
  chips: { gap: 8, paddingRight: 12 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9,
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(104, 112, 118, 0.22)',
  },
  categoryChipSelected: { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' },
  chipEmoji: { fontSize: 16 },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  categoryChipTextSelected: { color: '#fff' },
  twoColumns: { flexDirection: 'row', gap: 12 },
  codeInputWrap: { position: 'relative' },
  codeInput: { paddingRight: 40 },
  flag: { position: 'absolute', right: 10, top: 13, fontSize: 20 },
  precisionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  precisionChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 16, backgroundColor: 'rgba(104, 112, 118, 0.1)' },
  precisionChipSelected: { backgroundColor: '#0a7ea4' },
  precisionText: { fontSize: 13, fontWeight: '600' },
  precisionTextSelected: { color: '#fff' },
  toggleCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    padding: 15, borderWidth: 1, borderColor: 'rgba(104, 112, 118, 0.18)', borderRadius: 14,
  },
  toggleText: { flex: 1, gap: 2 },
  saveButton: { backgroundColor: '#0a7ea4', padding: 17, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabledButton: { opacity: 0.55 },
});
