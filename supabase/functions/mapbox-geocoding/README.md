# Setup Mapbox Geocoding con Supabase Edge Function

## Segreti da configurare su Supabase

Devi aggiungere il seguente segreto nella dashboard di Supabase:

### Variabile d'ambiente:
- **Nome**: `MAPBOX_ACCESS_TOKEN`
- **Valore**: Il tuo Mapbox Public Access Token (puoi ottenerlo da https://account.mapbox.com/access-tokens/)

## Come configurare il segreto su Supabase

1. Vai sulla dashboard di Supabase: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **Settings** > **Edge Functions** > **Secrets**
4. Clicca su **Add new secret**
5. Nome: `MAPBOX_ACCESS_TOKEN`
6. Valore: incolla il tuo Mapbox Access Token
7. Salva

## Come deployare l'Edge Function

Dalla root del progetto, esegui:

```bash
# Assicurati di essere loggato a Supabase
supabase login

# Link il progetto (se non già fatto)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy la funzione
supabase functions deploy mapbox-geocoding
```

## Test della funzione

Puoi testare la funzione localmente:

```bash
supabase functions serve mapbox-geocoding
```

Poi testa con:
```bash
curl -X POST http://localhost:54321/functions/v1/mapbox-geocoding \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "Roma, Italia", "limit": 5}'
```

## Note

- L'Edge Function usa il runtime Deno
- Il token Mapbox viene letto dalla variabile d'ambiente `MAPBOX_ACCESS_TOKEN`
- La funzione restituisce risultati in formato italiano (`language=it`)
- Supporta CORS per chiamate dal frontend

