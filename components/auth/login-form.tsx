import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FormInput } from './form-input';
import { LoginHeader } from './login-header';
import { PasswordInput } from './password-input';

interface LoginFormProps {
  username: string;
  email: string;
  password: string;
  isSignUp: boolean;
  loading: boolean;
  onUsernameChange: (text: string) => void;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onToggleMode: () => void;
  onSubmit: () => void;
}

export function LoginForm({
  username,
  email,
  password,
  isSignUp,
  loading,
  onUsernameChange,
  onEmailChange,
  onPasswordChange,
  onToggleMode,
  onSubmit,
}: LoginFormProps) {
  return (
    <>
      <LoginHeader isSignUp={isSignUp} />

      <View style={styles.form}>
        {isSignUp && (
          <FormInput
            icon="person.fill"
            placeholder="Username"
            value={username}
            onChangeText={onUsernameChange}
          />
        )}

        <FormInput
          icon="envelope.fill"
          placeholder="Email"
          value={email}
          onChangeText={onEmailChange}
          keyboardType="email-address"
        />

        <PasswordInput placeholder="Password" value={password} onChangeText={onPasswordChange} />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>
              {isSignUp ? 'Registrati' : 'Accedi'}
            </ThemedText>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>oppure</ThemedText>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity onPress={onToggleMode} style={styles.switchButton}>
          <ThemedText style={styles.switchText}>
            {isSignUp ? 'Hai già un account? ' : 'Non hai un account? '}
            <ThemedText style={styles.switchLink}>
              {isSignUp ? 'Accedi' : 'Registrati'}
            </ThemedText>
          </ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  button: {
    backgroundColor: '#0a7ea4',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 56,
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    opacity: 0.5,
  },
  switchButton: {
    marginTop: 2,
  },
  switchText: {
    textAlign: 'center',
    fontSize: 15,
    opacity: 0.7,
  },
  switchLink: {
    color: '#0a7ea4',
    fontWeight: '600',
    opacity: 1,
  },
});

