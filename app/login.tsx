import { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginForm } from '@/components/auth/login-form';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { signIn, signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleAuth = async () => {
    if (isSignUp) {
      if (!username || !email || !password) {
        Alert.alert('Errore', 'Inserisci username, email e password');
        return;
      }
    } else {
      if (!email || !password) {
        Alert.alert('Errore', 'Inserisci email e password');
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, username);
        // Login automatico dopo la registrazione
        await signIn(email, password);
        router.replace('/(tabs)/home');
      } else {
        await signIn(email, password);
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Qualcosa è andato storto');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setUsername('');
    setEmail('');
    setPassword('');
  };

  const renderContent = () => (
    <View style={[styles.card, { backgroundColor, shadowColor: textColor }]}>
      <LoginForm
        username={username}
        email={email}
        password={password}
        isSignUp={isSignUp}
        loading={loading}
        onUsernameChange={setUsername}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onToggleMode={handleToggleMode}
        onSubmit={handleAuth}
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardView}
          keyboardVerticalOffset={0}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.scrollContent, 
              { 
                paddingBottom: insets.bottom + 20,
              }
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}>
            {renderContent()}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent, 
            { 
              paddingBottom: insets.bottom + 20,
            }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {renderContent()}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
});

