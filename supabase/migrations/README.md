# Supabase Migrations

Questa cartella contiene le migrazioni del database per il Travel Manager.

## Come usare le migrazioni

### Setup iniziale

1. Installa Supabase CLI:
```bash
npm install -g supabase
```

2. Login a Supabase:
```bash
supabase login
```

3. Link il progetto locale al progetto Supabase:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Applicare le migrazioni

Per applicare tutte le migrazioni al database remoto:
```bash
supabase db push
```

Per fare il reset completo (ATTENZIONE: cancella tutti i dati):
```bash
supabase db reset
```

### Creare una nuova migrazione

```bash
supabase migration new nome_descrittivo
```

Questo creerà un nuovo file nella cartella `supabase/migrations/` con timestamp.

## Struttura del database

### Tabella `travels`

Contiene le informazioni sui viaggi:
- `id`: UUID primario
- `user_id`: UUID riferimento a `auth.users` (obbligatorio)
- `title`: Nome del viaggio
- `description`: Descrizione opzionale
- `destination`: Destinazione del viaggio
- `start_date`: Data di inizio
- `end_date`: Data di fine
- `status`: Stato (planned, ongoing, completed)
- `latitude`: Coordinate opzionali
- `longitude`: Coordinate opzionali
- `created_at`: Timestamp di creazione
- `updated_at`: Timestamp di ultimo aggiornamento

**Sicurezza**: Row Level Security (RLS) abilitato. Ogni utente può vedere/modificare solo i propri viaggi.

## Geocoding

Per ottenere le coordinate senza usare Google Maps, consigliamo:
- **Nominatim** (OpenStreetMap): Gratis e open source
- **Mapbox Geocoding API**: Generoso free tier
- **OpenCage**: Buon free tier

Questi servizi possono convertirà un indirizzo/destinazione in coordinate lat/lng.

