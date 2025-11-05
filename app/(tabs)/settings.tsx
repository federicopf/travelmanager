import { useLayoutEffect } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { router, useNavigation } from 'expo-router';

export default function SettingsScreen() {
  const { user, profile, signOut } = useAuth();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Impostazioni',
    });
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert(
      'Esci',
      'Sei sicuro di voler uscire?',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/login');
            } catch (error: any) {
              Alert.alert('Errore', error.message || 'Errore durante il logout');
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        {user && (
          <ThemedView style={styles.section}>
            {profile && (
              <>
                <ThemedText style={styles.label}>Username</ThemedText>
                <ThemedText style={styles.value}>{profile.username}</ThemedText>
              </>
            )}
            <ThemedText style={styles.label}>Email</ThemedText>
            <ThemedText style={styles.value}>{user.email}</ThemedText>
          </ThemedView>
        )}
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutText}>Esci</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    opacity: 0.6,
  },
  value: {
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 'auto',
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    opacity: 0.8,
  },
});

