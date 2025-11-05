import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

interface PasswordInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

export function PasswordInput({ placeholder, value, onChangeText }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputTextColor = useThemeColor({}, 'text');

  return (
    <View style={styles.inputContainer}>
      <View style={[styles.inputWrapper, styles.passwordWrapper]}>
        <IconSymbol name="lock.fill" size={18} color="#687076" style={styles.inputIcon} />
        <TextInput
          style={[styles.passwordInput, { color: inputTextColor }]}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}>
          <IconSymbol
            name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
            size={20}
            color="#687076"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    gap: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  passwordWrapper: {
    paddingRight: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 8,
    borderRadius: 8,
  },
});

