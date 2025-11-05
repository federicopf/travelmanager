import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface LoginHeaderProps {
  isSignUp: boolean;
}

export function LoginHeader({ isSignUp }: LoginHeaderProps) {
  return (
    <>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <IconSymbol name="airplane" size={48} color="#0a7ea4" />
        </View>
      </View>

      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Travel Manager
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {isSignUp ? 'Crea il tuo account' : 'Benvenuto! Accedi al tuo account'}
        </ThemedText>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E6F4FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 22,
  },
});

