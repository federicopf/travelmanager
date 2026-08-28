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

import { AddressSearch, AddressSearchSelection } from '@/components/address-search';
import { CountryPicker } from '@/components/country-picker';
import { PlaceMap } from '@/components/place-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CountryOption } from '@/constants/countries';
import {
  CATEGORY_EMOJI,
  CATEGORY_LABELS,
  VISITED_PLACE_CATEGORIES,
  VisitedPlaceCategory,
} from '@/domain/visited-place';
import {
  createVisitedPlace,
  getVisitedPlace,
  updateVisitedPlace,
} from '@/repositories/visited-place-repository';
import {
  CustomCategory,
  getCustomCategories,
  saveCustomCategory,
} from '@/repositories/custom-category-repository';

type DateMode = 'single' | 'range';

const EMOJI_OPTIONS = ['📍', '🏖️', '🏔️', '🌊', '🌲', '🏛️', '🎭', '🍜', '🎵', '🚲', '⛷️', '🤿', '✨', '❤️'];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function validDate(value: string): boolean {
  if (!/^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export default function CreateVisitedPlaceScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VisitedPlaceCategory>('city');
  const [customCategory, setCustomCategory] = useState('');
  const [customCategoryEmoji, setCustomCategoryEmoji] = useState('📍');
  const [savedCustomCategories, setSavedCustomCategories] = useState<CustomCategory[]>([]);
  const [country, setCountry] = useState<CountryOption>();
  const [addressSearch, setAddressSearch] = useState('');
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [dateMode, setDateMode] = useState<DateMode>('single');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));

  useLayoutEffect(() => {
    navigation.setOptions({ title: id ? 'Modifica luogo' : 'Aggiungi luogo' });
  }, [id, navigation]);

  useEffect(() => {
    void getCustomCategories().then(setSavedCustomCategories).catch((error) => {
      console.error('Errore categorie personalizzate:', error);
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;

        const place = await getVisitedPlace(id);
        if (!place) {
          Alert.alert('Luogo non trovato', 'Questo ricordo non è più disponibile.');
          router.back();
          return;
        }
        setTitle(place.title);
        setCategory(place.category);
        setCustomCategory(place.customCategory ?? '');
        setCustomCategoryEmoji(place.customCategoryEmoji ?? '📍');
        setCountry({ code: place.countryCode, name: place.countryName });
        setAddressSearch(place.addressLabel ?? '');
        setLatitude(place.latitude);
        setLongitude(place.longitude);
        setStartDate(place.visitedAt ?? today());
        setEndDate(place.visitEndDate ?? place.visitedAt ?? today());
        setDateMode(place.visitEndDate && place.visitEndDate !== place.visitedAt ? 'range' : 'single');
      } catch (error) {
        console.error('Errore caricamento form luogo:', error);
        Alert.alert('Errore', 'Non riesco a preparare il ricordo.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const save = async () => {
    if (!title.trim()) {
      Alert.alert('Nome mancante', 'Dai un nome al luogo o all’esperienza.');
      return;
    }
    if (!country) {
      Alert.alert('Bandiera mancante', 'Scegli il paese del luogo.');
      return;
    }
    if (latitude === undefined || longitude === undefined) {
      Alert.alert('Posizione mancante', 'Tocca la mappa per indicare dove si trova.');
      return;
    }
    if (category === 'other' && !customCategory.trim()) {
      Alert.alert('Categoria mancante', 'Scrivi che tipo di esperienza è.');
      return;
    }
    if (category === 'other' && !customCategoryEmoji.trim()) {
      Alert.alert('Emoji mancante', 'Scegli o inserisci un’emoji per la categoria.');
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
      if (category === 'other') {
        await saveCustomCategory(customCategory, customCategoryEmoji);
      }
      const input = {
        title,
        category,
        customCategory: category === 'other' ? customCategory : undefined,
        customCategoryEmoji: category === 'other' ? customCategoryEmoji : undefined,
        countryCode: country.code,
        countryName: country.name,
        addressLabel: addressSearch.trim() || undefined,
        latitude,
        longitude,
        visitedAt: startDate,
        visitEndDate: dateMode === 'range' ? endDate : undefined,
        datePrecision: 'exact' as const,
        favorite: false,
        tags: [],
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
    return <ThemedView style={[styles.container, styles.loading]}><ActivityIndicator size="large" color="#0a7ea4" /></ThemedView>;
  }

  const selectAddress = (selection: AddressSearchSelection) => {
    setLatitude(selection.latitude);
    setLongitude(selection.longitude);
    setAddressSearch(selection.addressLabel);
    if (!title.trim()) setTitle(selection.suggestedTitle);
    if (selection.countryCode && selection.countryName) {
      setCountry({ code: selection.countryCode, name: selection.countryName });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <ThemedText style={styles.heroEmoji}>📍</ThemedText>
            <View style={styles.heroCopy}>
              <ThemedText type="title">{id ? 'Modifica posto' : 'Aggiungi un posto'}</ThemedText>
              <ThemedText style={styles.muted}>Un punto distinto sulla tua mappa personale.</ThemedText>
            </View>
          </View>

          <Field label="Nome *">
            <TextInput style={styles.input} placeholder="Es. Tre Cime di Lavaredo" placeholderTextColor="#8a9196" value={title} onChangeText={setTitle} />
          </Field>

          <Field label="Che tipo di posto è?">
            <View style={styles.chips}>
              {VISITED_PLACE_CATEGORIES.map((item) => (
                <TouchableOpacity key={item} style={[styles.chip, category === item && styles.chipSelected]} onPress={() => setCategory(item)}>
                  <ThemedText style={styles.chipEmoji}>{CATEGORY_EMOJI[item]}</ThemedText>
                  <ThemedText style={[styles.chipText, category === item && styles.chipTextSelected]}>{CATEGORY_LABELS[item]}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </Field>
          {category === 'other' && (
            <View style={styles.customCategoryBox}>
              {savedCustomCategories.length > 0 && (
                <Field label="Le tue categorie">
                  <View style={styles.chips}>
                    {savedCustomCategories.map((saved) => {
                      const selected = customCategory.toLocaleLowerCase('it') === saved.name.toLocaleLowerCase('it');
                      return (
                        <TouchableOpacity
                          key={saved.name}
                          style={[styles.chip, selected && styles.chipSelected]}
                          onPress={() => {
                            setCustomCategory(saved.name);
                            setCustomCategoryEmoji(saved.emoji);
                          }}>
                          <ThemedText style={styles.chipEmoji}>{saved.emoji}</ThemedText>
                          <ThemedText style={[styles.chipText, selected && styles.chipTextSelected]}>{saved.name}</ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Field>
              )}
              <Field label="Nome nuova categoria *">
                <TextInput
                  style={styles.input}
                  placeholder="Es. Gastronomia"
                  placeholderTextColor="#8a9196"
                  value={customCategory}
                  onChangeText={setCustomCategory}
                />
              </Field>
              <Field label="Scegli un’emoji *">
                <View style={styles.emojiGrid}>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[styles.emojiButton, customCategoryEmoji === emoji && styles.emojiButtonSelected]}
                      onPress={() => setCustomCategoryEmoji(emoji)}>
                      <ThemedText style={styles.emojiOption}>{emoji}</ThemedText>
                    </TouchableOpacity>
                  ))}
                  <TextInput
                    style={[styles.emojiButton, styles.emojiInput]}
                    value={customCategoryEmoji}
                    onChangeText={setCustomCategoryEmoji}
                    placeholder="🙂"
                    maxLength={8}
                  />
                </View>
                <ThemedText style={styles.hint}>Puoi anche incollare la tua emoji nell’ultimo riquadro.</ThemedText>
              </Field>
            </View>
          )}

          <Field label="Cerca luogo o indirizzo">
            <AddressSearch value={addressSearch} onChangeText={setAddressSearch} onSelect={selectAddress} />
          </Field>

          <Field label="Bandiera *"><CountryPicker value={country} onChange={setCountry} /></Field>

          <Field label="Posizione sulla mappa *">
            <PlaceMap latitude={latitude} longitude={longitude} onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
          </Field>

          <Field label="Quando?">
            <View style={styles.chips}>
              {([
                ['single', 'Un giorno'],
                ['range', 'Più giorni'],
              ] as const).map(([mode, label]) => (
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

          <TouchableOpacity style={[styles.save, saving && styles.disabled]} onPress={save} disabled={saving}>
            <ThemedText style={styles.saveText}>{saving ? 'Salvataggio…' : 'Salva sulla mappa'}</ThemedText>
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
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroEmoji: { fontSize: 42, lineHeight: 54 },
  heroCopy: { flex: 1, gap: 4 },
  muted: { fontSize: 14, opacity: 0.62 },
  field: { gap: 8 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.65 },
  input: { borderWidth: 1, borderColor: 'rgba(104,112,118,0.25)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: '#687076' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(104,112,118,0.1)' },
  chipEmoji: { fontSize: 20, lineHeight: 28 },
  chipSelected: { backgroundColor: '#0a7ea4' },
  chipText: { fontSize: 13, lineHeight: 20, fontWeight: '600' },
  chipTextSelected: { color: '#fff' },
  customCategoryBox: { gap: 16, padding: 14, borderRadius: 16, backgroundColor: 'rgba(104,112,118,0.06)' },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(104,112,118,0.2)', backgroundColor: 'rgba(104,112,118,0.06)' },
  emojiButtonSelected: { borderWidth: 2, borderColor: '#0a7ea4', backgroundColor: 'rgba(10,126,164,0.12)' },
  emojiOption: { fontSize: 25, lineHeight: 34 },
  emojiInput: { padding: 0, textAlign: 'center', fontSize: 24, color: '#687076' },
  hint: { fontSize: 12, opacity: 0.56 },
  dateRow: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  save: { backgroundColor: '#0a7ea4', padding: 17, borderRadius: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.55 },
});
