# Travel Manager

Travel Manager e' un'app React Native/Expo local-first per ricostruire i viaggi passati e collezionare i luoghi vissuti.

Il primo prodotto e' un diario geografico gamificato: citta', borghi, trekking, parchi, montagne, spiagge, siti culturali e categorie personali alimentano mappa, bandiere, collezioni e statistiche. Social e pianificazione IA restano nella roadmap successiva.

## Stato Attuale

Primo incremento locale gia' presente:

- Expo SDK 57, React Native 0.86 e React 19.2
- Expo Router 57 con tab principali
- avvio senza account obbligatorio
- SQLite locale versionato tramite `expo-sqlite`
- repository separato dalla UI
- modello `VisitedPlace` con categorie urbane, culturali e naturali
- inserimento manuale di un luogo visitato
- date precise, mese, anno o data sconosciuta
- paese e bandiera derivata dal codice ISO
- coordinate, tag, note, preferiti e flag "ci tornerei"
- diario locale e dettaglio del ricordo
- creazione e modifica dei luoghi visitati
- creazione, modifica ed eliminazione dei viaggi passati
- tappe collegabili a un viaggio oppure indipendenti
- eliminazione di un viaggio senza perdita delle tappe
- statistiche locali per luoghi, paesi, categorie e preferiti
- eliminazione soft predisposta per una futura sincronizzazione

Prossimi incrementi:

- ricerca geografica e selezione manuale sulla mappa
- mappa globale e passaporto delle bandiere
- foto nel filesystem locale
- collezioni e achievement
- export/import e backup

## Avvio

```bash
npm install
npm run start
```

Script disponibili:

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
```

## Direzione Prodotto

La priorita' e' completare il tracker locale dei passati. In seguito il prodotto evolvera' con profili e condivisione social, wishlist, pianificazione dei viaggi futuri e assistenza IA personalizzata usando solo il contesto autorizzato dall'utente.

## Piano

Vedi `PROJECT_PLAN.md`.
