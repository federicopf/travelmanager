import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Impostazioni' });
  }, [navigation]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.header}>
          <ThemedText style={styles.emoji}>📱</ThemedText>
          <View style={styles.headerText}>
            <ThemedText type="subtitle">Modalita locale</ThemedText>
            <ThemedText style={styles.muted}>Nessun account e nessun backend richiesto.</ThemedText>
          </View>
        </View>

        <ThemedView style={styles.card}>
          <SettingRow label="Database" value="SQLite sul dispositivo" />
          <SettingRow label="Foto" value="Solo locali (in arrivo)" />
          <SettingRow label="Sincronizzazione" value="Disattivata" />
          <SettingRow label="Costo infrastruttura" value="0" />
        </ThemedView>

        <ThemedView style={styles.infoCard}>
          <ThemedText type="defaultSemiBold">I tuoi dati restano tuoi</ThemedText>
          <ThemedText style={styles.infoText}>
            Il diario viene salvato soltanto su questo dispositivo. Export, import e backup saranno aggiunti prima di usarlo per archivi importanti.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      <ThemedText style={styles.rowValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emoji: { fontSize: 38 },
  headerText: { flex: 1, gap: 3 },
  muted: { opacity: 0.58, fontSize: 14 },
  card: { borderWidth: 1, borderColor: 'rgba(104,112,118,0.18)', borderRadius: 16, paddingHorizontal: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingVertical: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(104,112,118,0.2)' },
  rowLabel: { opacity: 0.62, fontSize: 14 },
  rowValue: { flex: 1, textAlign: 'right', fontSize: 14, fontWeight: '600' },
  infoCard: { backgroundColor: 'rgba(10,126,164,0.08)', borderRadius: 16, padding: 18, gap: 6 },
  infoText: { fontSize: 14, lineHeight: 21, opacity: 0.68 },
});
