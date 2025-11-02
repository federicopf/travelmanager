# Setup Autenticazione Supabase

## 🎯 Funzionalità Implementate

✅ Context di autenticazione con Supabase  
✅ Schermata di Login/Registrazione  
✅ Protezione delle route  
✅ Auto-redirect se non autenticato  

## 🔐 Come Testare

### 1. Crea un account di test

Quando avvii l'app, vedrai la schermata di login. Puoi:

**Registrazione:**
- Email: `test@example.com`
- Password: minimo 6 caratteri (es: `password123`)
- Clicca su "Registrati"

**Login:**
- Inserisci le stesse credenziali
- Clicca su "Accedi"

### 2. Verifica Email (Solo per Supabase Cloud)

⚠️ **IMPORTANTE**: Se usi Supabase cloud, la prima registrazione richiede verifica email.

Per disabilitare la verifica email in modalità sviluppo:
1. Vai su Supabase Dashboard
2. Settings → Authentication → Email Auth
3. Disabilita "Confirm email"

### 3. Utente di Base Personalizzato

Per creare un utente senza verificare email, puoi:

**Opzione A: Tramite Dashboard Supabase**
1. Vai su Authentication → Users
2. Clicca "Add user"
3. Inserisci email e password
4. Deseleziona "Auto Confirm User" se vuoi

**Opzione B: SQL Editor**
```sql
-- Inserisci direttamente nella tabella auth.users
-- NOTA: Questa è una funzionalità avanzata, meglio usare l'API
```

## 📱 Flusso dell'App

1. **All'avvio**: Controlla se c'è una sessione attiva
2. **Se NON autenticato**: Redirect a `/login`
3. **Dopo login**: Redirect a `/(tabs)/home`
4. **Tab protette**: Solo utenti autenticati possono accedere

## 🔒 Sicurezza

- Row Level Security (RLS) abilitata su tutti i viaggi
- Ogni utente vede solo i propri dati
- Session automaticamente sincronizzata tra dispositivi
- Password gestite da Supabase Auth (hash + salt)

## 🛠️ Funzioni Disponibili

```typescript
const { user, session, loading, signIn, signUp, signOut } = useAuth();

// Login
await signIn('email@example.com', 'password');

// Registrazione
await signUp('email@example.com', 'password');

// Logout
await signOut();
```

## 📝 Note

- Le password devono avere **minimo 6 caratteri**
- Email deve essere nel formato corretto
- La sessione viene mantenuta tra riavvii dell'app
- Logout cancella completamente la sessione

