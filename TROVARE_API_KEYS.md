# Come Trovare URL e API Keys su Supabase

## 📍 Passo 1: Vai alla Dashboard
- Apri https://supabase.com/dashboard
- Accedi e seleziona il tuo progetto

## 🔑 Passo 2: Trova le API Keys

Nella sidebar a sinistra, scorri fino a trovare:
```
Settings (icona ingranaggio ⚙️)
├── Project Settings
├── ...altre voci...
└── API  <-- CLICCA QUI!
```

**IMPORTANTE**: Clicca sulla voce **"API"** nella sezione Settings (è nella sidebar sinistra).

## 📋 Passo 3: Copia i valori

Nella pagina **API** vedrai diversi box:

### Box 1: "Project URL"
```
URL: https://mhgufjdtipkmhouapsgb.supabase.co
```
👆 Questo è il tuo `EXPO_PUBLIC_SUPABASE_URL`

### Box 2: "Project API keys"

In questo box trovi diverse chiavi. Ti serve questa:

```
anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZ3VmamR0aXBrbWhvdWFwc2di...
```

👆 Questa è il tuo `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Non usare** la chiave "service_role" - quella è per il backend!

## 📝 Passo 4: Crea il file .env

Nella root del progetto, crea un file chiamato `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://mhgufjdtipkmhouapsgb.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZ3VmamR0aXBrbWhvdWFwc2di...
```

## ⚠️ Se ancora non trovi API

1. Verifica di aver selezionato il progetto giusto in alto a sinistra
2. Controlla di avere i permessi sul progetto
3. Prova a ricaricare la pagina (F5)
4. La voce "API" è nella sidebar SINISTRA sotto Settings

## ✅ Verifica

Dopo aver creato il file `.env`, prova:

```bash
npx expo start --clear
```

Se vedi la schermata di login, funziona! 🎉

