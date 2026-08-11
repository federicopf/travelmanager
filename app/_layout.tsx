import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="create-visited-place"
            options={{ title: 'Aggiungi luogo', presentation: 'modal' }}
          />
          <Stack.Screen name="place-detail" options={{ title: 'Ricordo' }} />
          <Stack.Screen name="create-past-trip" options={{ title: 'Nuovo viaggio', presentation: 'modal' }} />
          <Stack.Screen name="past-trip-detail" options={{ title: 'Viaggio passato' }} />
          <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="create-travel" options={{ title: 'Crea viaggio', presentation: 'modal' }} />
          <Stack.Screen name="travel-detail" options={{ title: 'Dettaglio viaggio' }} />
          <Stack.Screen name="travel-features" options={{ title: 'Risorse viaggio' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
