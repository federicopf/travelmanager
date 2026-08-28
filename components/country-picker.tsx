import { useMemo, useState } from 'react';
import { FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { COUNTRIES, CountryOption } from '@/constants/countries';
import { countryCodeToFlag } from '@/utils/country';

interface CountryPickerProps {
  value?: CountryOption;
  onChange: (country: CountryOption) => void;
}

export function CountryPicker({ value, onChange }: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('it');
    if (!normalized) return COUNTRIES;
    return COUNTRIES.filter((country) => country.name.toLocaleLowerCase('it').includes(normalized));
  }, [query]);

  const select = (country: CountryOption) => {
    onChange(country);
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <ThemedText style={styles.flag}>{value ? countryCodeToFlag(value.code) : '🌍'}</ThemedText>
        <ThemedText style={[styles.triggerText, !value && styles.placeholder]}>
          {value?.name ?? 'Scegli una bandiera'}
        </ThemedText>
        <ThemedText style={styles.chevron}>⌄</ThemedText>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <ThemedView style={styles.modal}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <ThemedText type="subtitle">Scegli il paese</ThemedText>
              <TouchableOpacity onPress={() => setOpen(false)}><ThemedText style={styles.close}>Chiudi</ThemedText></TouchableOpacity>
            </View>
            <TextInput
              style={styles.search}
              value={query}
              onChangeText={setQuery}
              placeholder="Cerca paese"
              placeholderTextColor="#8a9196"
              autoFocus
            />
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.countryRow} onPress={() => select(item)}>
                  <ThemedText style={styles.rowFlag}>{countryCodeToFlag(item.code)}</ThemedText>
                  <ThemedText style={styles.countryName}>{item.name}</ThemedText>
                  {value?.code === item.code && <ThemedText style={styles.selected}>✓</ThemedText>}
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(104,112,118,0.25)', borderRadius: 14, paddingHorizontal: 14 },
  flag: { fontSize: 27 },
  triggerText: { flex: 1, fontSize: 16, fontWeight: '600' },
  placeholder: { opacity: 0.5, fontWeight: '400' },
  chevron: { fontSize: 20, opacity: 0.5 },
  modal: { flex: 1 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  close: { color: '#0a7ea4', fontWeight: '700' },
  search: { marginHorizontal: 18, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(104,112,118,0.25)', borderRadius: 13, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: '#687076' },
  countryRow: { flexDirection: 'row', alignItems: 'center', gap: 13, minHeight: 56, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(104,112,118,0.18)' },
  rowFlag: { fontSize: 27 },
  countryName: { flex: 1, fontSize: 16 },
  selected: { color: '#0a7ea4', fontSize: 18, fontWeight: '800' },
});
