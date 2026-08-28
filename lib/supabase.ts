import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

let client: SupabaseClient | undefined;

function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const supabaseUrl =
    Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Variabili di ambiente Supabase mancanti. Controlla la configurazione in .env o app.json.'
    );
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return client;
}

// La modalita attuale e interamente locale: niente persistenza o refresh auth.
// Expo Router indicizza anche le route online future, quindi il proxy evita di
// creare il client finche una funzione Supabase non viene usata davvero.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const activeClient = getSupabaseClient();
    const value = Reflect.get(activeClient, property, activeClient);

    return typeof value === 'function' ? value.bind(activeClient) : value;
  },
});
