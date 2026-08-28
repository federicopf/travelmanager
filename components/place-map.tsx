import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PlaceMapProps } from '@/components/place-map.types';

export function PlaceMap({ latitude, longitude, onChange, readOnly }: PlaceMapProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.message}>La mappa interattiva è disponibile nell’app mobile.</ThemedText>
      {!readOnly && <View style={styles.row}>
        <TextInput style={styles.input} value={latitude?.toString() ?? ''} onChangeText={(value) => onChange(Number(value), longitude ?? 0)} placeholder="Latitudine" />
        <TextInput style={styles.input} value={longitude?.toString() ?? ''} onChangeText={(value) => onChange(latitude ?? 0, Number(value))} placeholder="Longitudine" />
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(104,112,118,0.22)' },
  message: { opacity: 0.65 },
  row: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: 'rgba(104,112,118,0.22)', borderRadius: 10, padding: 10 },
});
