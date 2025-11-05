import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';

interface DatePickerInputProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  tempValue: Date;
  setTempValue: (date: Date) => void;
  showPicker: boolean;
  setShowPicker: (show: boolean) => void;
}

export function DatePickerInput({
  label,
  value,
  onChange,
  minimumDate,
  tempValue,
  setTempValue,
  showPicker,
  setShowPicker,
}: DatePickerInputProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setTempValue(value);
          setShowPicker(true);
        }}>
        <ThemedText style={styles.buttonText}>
          {value.toLocaleDateString('it-IT', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}
        </ThemedText>
        <IconSymbol name="calendar" size={20} color="#0a7ea4" />
      </TouchableOpacity>
      {showPicker && (
        <>
          <DateTimePicker
            value={tempValue}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android') {
                setShowPicker(false);
                if (event.type === 'set' && selectedDate) {
                  onChange(selectedDate);
                }
              } else if (Platform.OS === 'ios' && selectedDate) {
                setTempValue(selectedDate);
              }
            }}
            minimumDate={minimumDate}
          />
          {Platform.OS === 'ios' && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  onChange(tempValue);
                  setShowPicker(false);
                }}>
                <ThemedText style={styles.confirmButtonText}>Conferma</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
  },
  confirmButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

