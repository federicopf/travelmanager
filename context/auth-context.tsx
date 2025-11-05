import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

export interface Profile {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      setProfile(data);
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Translate Supabase auth errors to Italian
  const translateAuthError = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('invalid login credentials') || 
        lowerMessage.includes('invalid credentials') ||
        lowerMessage.includes('email not confirmed')) {
      return 'Email o password non corretti. Riprova.';
    }
    
    if (lowerMessage.includes('email already registered') ||
        lowerMessage.includes('user already registered')) {
      return 'Questa email è già registrata. Accedi con le tue credenziali.';
    }
    
    if (lowerMessage.includes('password')) {
      if (lowerMessage.includes('too short') || lowerMessage.includes('weak')) {
        return 'La password è troppo debole. Usa almeno 6 caratteri.';
      }
    }
    
    if (lowerMessage.includes('email')) {
      if (lowerMessage.includes('invalid') || lowerMessage.includes('format')) {
        return 'Formato email non valido.';
      }
    }
    
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return 'Errore di connessione. Controlla la tua connessione internet.';
    }
    
    // Return original message if no translation found
    return message;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      // Translate common Supabase auth errors to Italian
      const translatedMessage = translateAuthError(error.message);
      throw new Error(translatedMessage);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    // Validate username
    if (!username || username.trim().length < 3) {
      throw new Error('Username deve essere di almeno 3 caratteri');
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username può contenere solo lettere, numeri e underscore');
    }

    // Check if username already exists
    const normalizedUsername = username.trim().toLowerCase();
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', normalizedUsername)
      .maybeSingle();
    
    if (existingProfile) {
      throw new Error('Questo username è già in uso. Scegli un altro username.');
    }
    
    if (checkError && checkError.code !== 'PGRST116') {
      // There's an actual error (not just "not found")
      throw new Error('Errore durante la verifica dello username. Riprova.');
    }

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      const translatedMessage = translateAuthError(error.message);
      throw new Error(translatedMessage);
    }
    
    // Create profile after successful signup using RPC function (bypasses RLS)
    if (data.user) {
      const { error: profileError } = await supabase.rpc('create_profile', {
        user_id: data.user.id,
        username_value: normalizedUsername,
      });
      
      if (profileError) {
        // Handle username duplicate error with user-friendly message (fallback check)
        if (profileError.message?.includes('duplicate key') || 
            profileError.message?.includes('unique constraint') ||
            profileError.code === '23505') {
          throw new Error('Questo username è già in uso. Scegli un altro username.');
        }
        
        // If profile creation fails for other reasons, we still have the auth user
        // but should handle this case
        throw new Error(profileError.message || 'Errore nella creazione del profilo');
      }
      
      // Fetch the newly created profile
      await fetchProfile(data.user.id);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      const translatedMessage = translateAuthError(error.message);
      throw new Error(translatedMessage);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
}

