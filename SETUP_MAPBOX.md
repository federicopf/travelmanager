# Checklist Setup Mapbox Geocoding

## ✅ Passo 1: Ottieni il Mapbox Access Token

1. Vai su https://account.mapbox.com/
2. Accedi o crea un account
3. Vai su **Access tokens** (https://account.mapbox.com/access-tokens/)
4. Copia il **Default Public Token** (inizia con `pk.`)

## ✅ Passo 2: Configura il segreto su Supabase

1. Vai su https://supabase.com/dashboard
2. Seleziona il tuo progetto: `mhgufjdtipkmhouapsgb`
3. Nel menu laterale: **Settings** → **Edge Functions** → **Secrets**
4. Clicca **Add new secret**
5. Compila:
   - **Name**: `MAPBOX_ACCESS_TOKEN`
   - **Value**: incolla il token Mapbox (quello che inizia con `pk.`)
6. Clicca **Save**

## ✅ Passo 3: Deploy dell'Edge Function

**Opzione A: Usare npx (senza installare Supabase CLI)**

Dalla root del progetto (`/var/www/Open Source/travelmanager`):

```bash
# 1. Login (ti aprirà il browser)
npx supabase login

# 2. Linka il progetto (se non già fatto)
npx supabase link --project-ref mhgufjdtipkmhouapsgb

# 3. Deploy della funzione
npx supabase functions deploy mapbox-geocoding
```

**Opzione B: Installare Supabase CLI correttamente**

Su WSL/Linux, installa con uno di questi metodi:

```bash
# Metodo 1: Con npm (installazione locale nel progetto)
npm install supabase --save-dev

# Poi usa con npx:
npx supabase login
npx supabase link --project-ref mhgufjdtipkmhouapsgb
npx supabase functions deploy mapbox-geocoding

# Metodo 2: Con Homebrew (se installato)
brew install supabase/tap/supabase

# Metodo 3: Download diretto (Linux)
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/
```

**Opzione C: Deploy manuale tramite Dashboard Supabase**

Se preferisci non usare la CLI:

1. Vai su https://supabase.com/dashboard
2. Seleziona il progetto: `mhgufjdtipkmhouapsgb`
3. Vai su **Edge Functions**
4. Clicca **Create a new function**
5. Nome: `mapbox-geocoding`
6. Copia e incolla il contenuto di `supabase/functions/mapbox-geocoding/index.ts`
7. Clicca **Deploy**

## ✅ Passo 4: Verifica che funzioni

### Test rapido dal terminale:

```bash
# Sostituisci YOUR_ANON_KEY con la tua anon key
curl -X POST https://mhgufjdtipkmhouapsgb.supabase.co/functions/v1/mapbox-geocoding \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "Roma, Italia", "limit": 5}'
```

Dovresti ricevere una risposta JSON con i risultati.

### Test dall'app:

1. Avvia l'app Expo
2. Vai sulla schermata "Crea nuovo viaggio"
3. Digita nel campo "Destinazione" (es. "Roma")
4. Dopo 3+ caratteri dovresti vedere i risultati della ricerca

## 🔍 Troubleshooting

### La funzione non risponde?
- Verifica che il segreto `MAPBOX_ACCESS_TOKEN` sia configurato su Supabase
- Controlla i log della funzione su Supabase Dashboard → Edge Functions → mapbox-geocoding → Logs

### Errore "MAPBOX_ACCESS_TOKEN non configurato"?
- Il segreto non è stato configurato correttamente
- Verifica che il nome sia esattamente `MAPBOX_ACCESS_TOKEN` (case-sensitive)

### Errore CORS?
- La funzione ha già i CORS headers configurati
- Verifica che l'URL di Supabase sia corretto nel tuo client

### Nessun risultato nella ricerca?
- Verifica che il token Mapbox sia valido
- Controlla i log della funzione per vedere eventuali errori Mapbox

## 📝 Note Finali

- ✅ Il token Mapbox è ora sicuro nella Edge Function (non nel bundle)
- ✅ L'anon key di Supabase può essere nel bundle (è sicuro grazie a RLS)
- ✅ Tutto il codice è già pronto e funzionante

## 🎉 Quando hai completato tutto

Dovresti essere in grado di:
1. Digitare nel campo destinazione
2. Vedere i risultati della ricerca Mapbox
3. Selezionare un luogo
4. Creare il viaggio con le coordinate salvate automaticamente

