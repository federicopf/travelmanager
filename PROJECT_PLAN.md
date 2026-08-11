# Travel Manager - Piano Tracker dei Viaggi Passati

## Focus Del Prodotto

La prima versione di Travel Manager e' un tracker personale delle esperienze di viaggio gia' vissute.

Non e' un semplice contatore di nazioni o capitali. Deve permettere di ricordare e collezionare qualsiasi tipo di luogo o esperienza geografica:

- citta', capitali e borghi
- quartieri e punti di interesse
- trekking, cammini e sentieri
- montagne, passi, vette e rifugi
- parchi nazionali e riserve
- laghi, fiumi, cascate e spiagge
- isole e arcipelaghi
- foreste, deserti e altri paesaggi naturali
- siti archeologici, culturali e religiosi
- strade panoramiche e itinerari
- esperienze definite liberamente dall'utente

Il cuore del prodotto e' questo ciclo:

1. L'utente inserisce un viaggio passato o un singolo luogo visitato.
2. Il luogo compare sulla mappa e nel diario.
3. Il paese viene scoperto e la sua bandiera viene sbloccata.
4. La visita alimenta collezioni, statistiche e traguardi coerenti con il tipo di esperienza.
5. Foto e note trasformano il dato geografico in un ricordo personale.

Pianificazione futura, funzionalita' social, voli, hotel, budget, viaggio live e IA non fanno parte del primo MVP, ma restano pilastri strategici del prodotto. Il tracker dei passati viene costruito per primo e deve produrre il profilo di interessi, la cronologia e il grafo di luoghi necessari alle fasi successive.

## Promessa Principale

Aprendo l'app devo poter vedere immediatamente il mondo che ho esplorato, aggiungere facilmente cio' che manca e riscoprire i ricordi collegati a ogni posto.

La motivazione non deve provenire da una classifica artificiale, ma dalla soddisfazione di:

- colorare progressivamente la propria mappa
- sbloccare bandiere
- riempire collezioni di esperienze diverse
- vedere crescere il proprio passaporto personale
- ritrovare foto, storie e tappe di un viaggio

## Principi Di Prodotto

- Tutti i tipi di esplorazione hanno dignita': una capitale non vale automaticamente piu' di un trekking.
- La mappa e' l'esperienza centrale, non una schermata accessoria.
- L'inserimento retroattivo deve funzionare anche con ricordi e date imprecise.
- Un luogo puo' esistere da solo oppure essere una tappa di un viaggio.
- Le categorie aiutano a raccontare e organizzare, non devono diventare un vincolo.
- La gamification deve premiare varieta', continuita' e scoperta, non turismo compulsivo.
- Non servono foto, GPS live o prove per dichiarare una visita: il tracker si basa sulla memoria dell'utente.
- Le foto restano locali sul dispositivo nell'MVP.
- I dati gia' salvati devono essere consultabili offline.
- I dati personali devono poter essere esportati e non devono dipendere per sempre da un servizio esterno.
- L'MVP deve essere sviluppabile e utilizzabile senza costi ricorrenti di backend o infrastruttura.
- SQLite locale e' la source of truth della prima versione.
- Privato per default: ogni viaggio, luogo, foto e collezione deve avere una visibilita' esplicita prima di qualsiasi funzione social.
- L'IA futura deve poter proporre, spiegare e modificare piani, ma ogni azione sui dati deve essere confermata dall'utente.
- Il social deve aiutare a scoprire luoghi ed esperienze autentiche, non trasformare l'app in una gara a chi viaggia di piu'.

## Modello Concettuale

### `PastTrip`

Raggruppa piu' visite appartenenti allo stesso viaggio.

- id
- userId
- title
- description opzionale
- startDate opzionale
- endDate opzionale
- datePrecision: exact | month | year | unknown
- coverPhotoUri opzionale
- notes opzionale
- createdAt
- updatedAt

Un viaggio non e' obbligatorio: deve essere possibile salvare un singolo luogo senza ricostruire tutto il contesto.

### `VisitedPlace`

Rappresenta una visita o esperienza realmente vissuta.

- id
- userId
- tripId opzionale
- title
- description opzionale
- category
- customCategory opzionale
- countryCode ISO 3166-1 alpha-2
- countryName
- region opzionale
- locality opzionale
- addressLabel opzionale
- latitude
- longitude
- geometryType: point | route | area
- visitedAt opzionale
- visitEndDate opzionale
- datePrecision: exact | month | year | unknown
- rating opzionale
- favorite
- wouldReturn opzionale
- tags
- notes opzionale
- coverPhotoUri opzionale
- createdAt
- updatedAt

Categorie iniziali:

- city
- village
- culture
- archaeology
- religious_site
- trekking
- trail
- mountain
- viewpoint
- national_park
- nature_reserve
- forest
- lake
- river
- waterfall
- beach
- island
- desert
- scenic_route
- other

L'elenco deve essere estendibile e non deve impedire categorie personalizzate.

### `LocalPhoto`

- id
- visitedPlaceId
- localUri
- width opzionale
- height opzionale
- takenAt opzionale
- caption opzionale
- isCover
- createdAt

### `CountryProgress`

Dato derivato dalle visite, non compilato manualmente.

- countryCode
- countryName
- flagEmoji
- unlocked
- firstVisitedAt opzionale
- lastVisitedAt opzionale
- tripsCount
- placesCount
- categoriesCount
- photosCount
- regionsCount

La bandiera si sblocca alla prima visita registrata nel paese. Se l'ultima visita del paese viene eliminata, il paese torna non visitato dopo una conferma esplicita.

### `Achievement`

- id
- kind
- title
- description
- icon
- progressCurrent
- progressTarget
- unlockedAt opzionale
- relatedCountryCode opzionale
- relatedCategory opzionale

I traguardi devono essere calcolati dai dati reali e versionati, non salvati come contatori indipendenti fragili.

### `Collection`

- id
- title
- description opzionale
- type: automatic | custom
- rule opzionale
- visitedPlaceIds per collezioni manuali
- coverPhotoUri opzionale
- createdAt
- updatedAt

Esempi automatici:

- Paesi visitati
- Parchi e riserve
- Trekking e cammini
- Isole
- Laghi e cascate
- Borghi
- Siti archeologici
- Luoghi del cuore

Esempi personali:

- Estate 2024
- Dolomiti
- Posti in cui tornerei
- Viaggi con amici

### Campi Da Predisporre Per Le Evoluzioni

Anche se social e pianificazione IA arrivano dopo, gli identificatori e i confini del modello devono consentire in futuro:

- `visibility`: private | connections | public
- autore e proprietario separati per contenuti condivisi o collaborativi
- slug o identificatore condivisibile distinto dall'id interno
- categorie e tag normalizzati utili al profilo interessi
- luoghi salvabili in wishlist senza marcarli come visitati
- provenienza di un suggerimento: manual | friend | community | ai
- consenso separato per usare ricordi e preferenze come contesto IA
- versionamento degli itinerari generati o modificati

Questi campi non devono necessariamente apparire nell'interfaccia del primo MVP, ma le scelte tecniche non devono impedirne l'introduzione.

## Geografia E Ricerca Luoghi

Mapbox deve essere usato per ricerca, geocoding e mappa, ma il modello non deve dipendere solo dalle categorie restituite da Mapbox.

Ogni risultato va normalizzato in:

- nome
- paese e country code
- regione
- localita'
- coordinate
- tipo suggerito
- etichetta completa

L'utente puo' correggere nome e categoria. Se un trekking, una cascata o un luogo naturale non e' trovato, deve poter piazzare manualmente un punto sulla mappa.

Per l'MVP ogni esperienza viene rappresentata da un punto principale. Route GPS e aree/poligoni sono previste dal modello, ma rimandate a una fase successiva.

## Mappa Centrale

La tab Mappa e' la home emotiva dell'app.

### Vista Mondo

- paesi visitati colorati
- paesi non visitati neutri
- tap su un paese per vedere bandiera, prima visita e riepilogo
- contatore paesi e continenti esplorati
- accesso al passaporto delle bandiere

### Vista Esplorazione

- pin per tutti i luoghi visitati
- icona o colore del pin legato alla categoria
- clustering quando i pin sono numerosi
- preview con foto, nome, tipo, data e bandiera
- filtri per paese, anno, viaggio, categoria, tag e preferiti
- azione rapida "Sono stato qui"

### Evoluzioni Successive

- tracce dei trekking e dei cammini
- aree di parchi e riserve
- heatmap delle zone esplorate
- confronto della mappa tra anni
- import di tracce GPX

## Gamification

### Bandiere Collezionabili

- griglia completa dei paesi
- bandiere bloccate rese neutre o in silhouette
- bandiera sbloccata alla prima visita
- scheda paese con luoghi, categorie, viaggi, foto e cronologia
- ordinamento per continente, prima visita, ultima visita e numero di esperienze
- nessun obbligo di visitare una capitale per sbloccare il paese

### Collezioni Per Tipo Di Esperienza

La progressione non deve ridursi ai confini politici. Ogni categoria crea una collezione trasversale:

- trekking completati
- parchi esplorati
- vette e passi
- isole visitate
- laghi e cascate
- citta' e borghi
- siti culturali e archeologici

Queste collezioni contano le esperienze personali. Le percentuali di completamento si mostrano solo quando esiste un catalogo affidabile e dichiarato; non inventiamo denominatori come "percentuale di natura visitata".

### Traguardi Non Competitivi

Primi esempi:

- Prima bandiera
- 5 paesi esplorati
- Primo luogo naturale
- Primo trekking
- 10 esperienze outdoor
- 5 tipi di paesaggio differenti
- 3 continenti
- Un viaggio ricostruito con almeno 5 tappe
- Un ricordo in 5 anni diversi
- 10 luoghi del cuore

I traguardi devono essere discreti, disattivabili e senza classifiche globali nell'MVP.

### Progressione Del Paese

La bandiera e' binaria: bloccata o sbloccata. La scheda paese puo' mostrare una profondita' di esplorazione, senza dichiarare che un paese sia stato "completato".

Indicatori utili:

- numero di regioni toccate
- varieta' delle categorie
- numero di viaggi distinti
- arco temporale tra prima e ultima visita
- luoghi preferiti

Eventuali livelli come `Scoperto`, `Esplorato`, `Vissuto` devono essere descrittivi e basati su regole trasparenti, mai presentati come verita' assolute.

## Visione Evolutiva: Social

Il tracker personale deve poter diventare una rete di esplorazione. Il valore social nasce dai luoghi e dalle esperienze salvate, non da un feed generico.

### Obiettivi

- scoprire luoghi attraverso persone con interessi simili
- condividere un viaggio, un trekking, una raccolta o una singola esperienza
- salvare nella propria wishlist un luogo visto nel profilo di un'altra persona
- chiedere consigli a chi ha realmente registrato un'esperienza
- costruire raccolte e itinerari collaborativi
- trovare compagni con affinita' di viaggio, senza esporre dati sensibili

### Funzioni Social Previste

- profilo pubblico o privato con bio e interessi
- connessioni/follow con controllo della privacy
- condivisione selettiva di viaggio, luogo, foto o collezione
- feed basato su persone seguite, categorie e territori scelti
- reazioni, commenti e salvataggi
- collezioni collaborative
- viaggio condiviso con ruoli e permessi
- link o card riepilogative condivisibili fuori dall'app
- segnalazione, blocco, moderazione e controllo anti-spam

### Gamification Sociale

La gamification personale rimane primaria. Le funzioni social possono includere:

- traguardi condivisi tra amici
- challenge tematiche non competitive, per esempio "un luogo naturale questo mese"
- confronto facoltativo di mappe o collezioni
- recap di gruppo dopo un viaggio

Non sono previste classifiche globali basate sul numero di paesi: favorirebbero quantita', disponibilita' economica e comportamenti poco autentici.

### Privacy

- contenuti privati per default
- visibilita' configurabile per ogni viaggio e luogo
- possibilita' di nascondere date precise e posizione esatta
- foto condivise solo su scelta esplicita
- nessuna posizione live pubblica per default
- rimozione dei metadati sensibili dalle immagini pubblicate

## Visione Evolutiva: Pianificazione IA

La cronologia del tracker diventa il contesto personale per pianificare meglio i viaggi futuri. L'IA non deve proporre lo stesso itinerario a tutti: deve capire che una persona preferisce, per esempio, trekking e laghi rispetto alle capitali, oppure borghi e archeologia rispetto alla vita notturna.

### Profilo Di Viaggio Derivato

Con consenso dell'utente, l'IA puo' ricavare segnali modificabili da:

- categorie visitate e preferite
- valutazioni e flag "ci tornerei"
- ritmo dei viaggi passati
- durata media delle tappe
- stagioni e territori scelti
- equilibrio tra natura, citta', cultura e attivita' outdoor
- note o vincoli dichiarati esplicitamente

L'utente deve poter vedere, correggere o disattivare queste preferenze inferite.

### Casi D'Uso IA

1. Scelta destinazione:
   - confrontare mete in base a interessi, periodo, budget e luoghi gia' visitati
2. Itinerario personalizzato:
   - combinare citta', natura, trekking e soste coerenti con ritmo e preferenze
3. Stima budget:
   - range separati per trasporti, alloggio, cibo, attivita' ed extra
4. Pianificazione flessibile:
   - tappe fisse, mobili e opzionali
5. Cambio piano durante il viaggio:
   - ricalcolo in base a meteo, ritardi, stanchezza, budget residuo o nuove idee
6. Ricostruzione del passato:
   - generare una bozza di viaggio da racconto, foto e date approssimative
7. Scoperta sociale assistita:
   - proporre luoghi pubblici salvati da persone con interessi affini

### Chat Contestuale

Ogni viaggio futuro o attivo puo' avere una chat che conosce il piano, i vincoli e le preferenze autorizzate.

Azioni proponibili:

- aggiungere, spostare, sostituire o rimuovere una tappa
- cambiare il ritmo di una giornata
- aggiungere un trekking o un'alternativa naturale
- aggiornare il budget
- creare una checklist
- salvare un luogo suggerito in wishlist
- trasformare un suggerimento social in una tappa

Ogni modifica strutturata deve mostrare impatto e motivazione e richiedere conferma prima del salvataggio.

### Prezzi E Informazioni Variabili

- ogni prezzo deve avere fonte, valuta e data/ora
- salvare snapshot invece di presentare prezzi come permanenti
- preferire API ufficiali per voli, hotel e attivita'
- non fondare il prodotto su scraping fragile
- distinguere chiaramente fatti aggiornati, stime e suggerimenti
- mostrare assunzioni e margine d'incertezza

### Confine Tra Social E IA

L'IA puo' usare contenuti pubblici o esplicitamente condivisi per suggerire esperienze, citandone l'origine. Non puo' usare ricordi privati di altri utenti, messaggi privati o posizione live come contesto implicito.

## Navigazione MVP

### Tab 1: Mappa

- apertura sulla mappa esplorata
- switch Mondo / Luoghi
- accesso rapido ai filtri
- pulsante aggiunta luogo
- anteprima dei progressi

### Tab 2: Diario

- timeline di viaggi e visite
- raggruppamento per anno e viaggio
- inserimento di un viaggio passato
- inserimento di un singolo luogo
- ricerca e filtri

### Tab 3: Collezioni

- passaporto con bandiere
- collezioni per categoria
- collezioni personali
- traguardi e progressi

### Tab 4: Ricordi

- galleria foto locale
- raggruppamento per luogo, viaggio, paese o anno
- preferiti e luoghi del cuore

### Tab 5: Profilo

- statistiche personali
- impostazioni
- gestione categorie e privacy
- export/import
- logout

## Flussi Principali

### Aggiungi Un Luogo Visitato

1. Cerca il luogo oppure tieni premuto sulla mappa.
2. Conferma nome, categoria e posizione.
3. Inserisci data precisa, mese, anno oppure "non ricordo".
4. Collega facoltativamente il luogo a un viaggio.
5. Aggiungi note, tag, preferito e foto.
6. Salva.
7. Mostra subito il pin, la bandiera eventualmente sbloccata e i progressi aggiornati.

### Inserisci Un Viaggio Passato

1. Inserisci titolo e periodo, anche approssimativo.
2. Aggiungi rapidamente piu' tappe.
3. Per ogni tappa scegli tipo, posizione e ricordi opzionali.
4. Riordina le tappe.
5. Scegli una copertina.
6. Salva e mostra il riepilogo di bandiere, categorie e traguardi sbloccati.

### Esplora Una Bandiera

1. Apri il passaporto.
2. Seleziona una bandiera sbloccata.
3. Visualizza mappa del paese, viaggi, luoghi, categorie e foto.
4. Filtra o apri un singolo ricordo.

## Roadmap

### Fase 0 - Fondamenta

1. Sistemare configurazione TypeScript e warning lint.
2. Ripulire i placeholder del vecchio prototipo.
3. Definire migrazioni senza distruggere i dati `travels` esistenti.
4. Integrare `expo-sqlite` e creare il database locale versionato.
5. Creare un repository layer che separi UI e storage.
6. Definire strategia di export prima di salvare foto e ricordi reali.
7. Rimuovere Supabase dal flusso obbligatorio dell'app, conservando il vecchio codice solo finche' serve alla migrazione dei dati esistenti.

### MVP 1 - Diario Dei Luoghi

1. Introdurre `PastTrip`, `VisitedPlace` e categorie.
2. Migrare i viaggi esistenti come viaggi passati dove possibile.
3. Implementare aggiunta, modifica ed eliminazione di un luogo.
4. Supportare date esatte e approssimative.
5. Collegare piu' luoghi a un viaggio passato.
6. Creare timeline e dettaglio luogo.
7. Consentire posizione manuale se la ricerca non trova il luogo.

### MVP 2 - Mappa E Bandiere

1. Creare mappa globale con pin categorizzati.
2. Implementare clustering e filtri.
3. Colorare i paesi visitati.
4. Derivare bandiere da country code.
5. Creare passaporto con bandiere bloccate e sbloccate.
6. Creare dettaglio paese.
7. Aggiungere l'azione rapida "Sono stato qui".

### MVP 3 - Foto E Ricordi Locali

1. Integrare selezione e scatto foto.
2. Copiare le foto in una directory gestita dall'app.
3. Salvare URI e metadati.
4. Gestire foto copertina e didascalie.
5. Creare galleria locale.
6. Gestire foto mancanti o spostate senza perdere il luogo.

### MVP 4 - Gamification

1. Calcolare `CountryProgress` dalle visite.
2. Creare collezioni automatiche per categoria.
3. Implementare i primi traguardi versionati.
4. Mostrare progressi e sblocchi dopo il salvataggio.
5. Creare statistiche per paese, categoria, anno e continente.
6. Permettere di disattivare animazioni e traguardi.

### MVP 5 - Affidabilita' E Portabilita'

1. Rendere consultabili offline mappa gia' caricata e dati salvati, nei limiti delle licenze cartografiche.
2. Export JSON dei metadati.
3. Export archivio delle foto locali.
4. Import e ripristino backup.
5. Gestione duplicati e merge dei luoghi.
6. Test dei calcoli di bandiere, statistiche e achievement.

### Fase 6 - Social Di Base

1. Introdurre visibilita' e profili.
2. Condividere singoli luoghi, viaggi e collezioni.
3. Implementare connessioni, salvataggi e feed controllabile.
4. Aggiungere strumenti di blocco, segnalazione e moderazione.
5. Creare collezioni collaborative.

### Fase 7 - Wishlist E Viaggi Futuri

1. Distinguere chiaramente visitato e da visitare.
2. Creare wishlist da ricerca, social e suggerimenti.
3. Introdurre viaggio futuro, tappe candidate e vincoli.
4. Aggiungere budget manuale, checklist e partecipanti.
5. Trasformare un viaggio futuro in viaggio attivo e poi in ricordo.

### Fase 8 - Pianificazione IA

1. Creare profilo interessi controllabile dall'utente.
2. Aggiungere chat contestuale al viaggio.
3. Generare confronti, budget e itinerari modificabili.
4. Convertire proposte IA in azioni confermabili.
5. Salvare assunzioni, fonti e versioni del piano.
6. Integrare suggerimenti social autorizzati.

### Fase 9 - Viaggio Live E Dati Esterni

1. Rendere rapida l'aggiunta di luoghi, note, foto e spese.
2. Gestire cambi di piano senza perdere lo storico.
3. Aggiungere informazioni aggiornate e snapshot prezzi tramite fonti affidabili.
4. Importare EXIF e tracce GPX con consenso.
5. Generare recap personale o condiviso alla fine del viaggio.

## Decisioni Tecniche

### Database

Decisione per l'MVP:

- SQLite locale tramite `expo-sqlite`
- nessun backend obbligatorio
- nessun account obbligatorio
- nessun costo ricorrente di database, storage o autenticazione
- foto archiviate nel filesystem locale dell'app
- repository layer per non legare componenti e logica di dominio a SQLite
- migrazioni locali numerate e applicate automaticamente
- export/import come prima forma di backup e trasferimento

### Preparazione Alla Migrazione Online

La versione locale non deve essere un vicolo cieco. Fin dall'inizio:

- usare UUID generati localmente, non id autoincrementali esposti come identita' di dominio
- salvare `createdAt`, `updatedAt` e, dove utile, `deletedAt`
- separare record di dominio e record derivati come statistiche e achievement
- evitare query SQLite direttamente dentro schermate e componenti
- mantenere schema e mapping documentati
- rendere export e import idempotenti per quanto possibile
- prevedere una futura tabella di stato sync senza implementarla nell'MVP
- prevedere `version` o un equivalente per rilevare conflitti tra dispositivo e cloud
- distinguere eliminazione locale e cancellazione sincronizzata tramite `deletedAt`

Se il prodotto verra' pubblicato con social, collaborazione o accesso multi-dispositivo, si potra' aggiungere un backend e una sincronizzazione incrementale. SQLite continuera' a funzionare come database locale/offline, mentre il cloud diventera' un livello opzionale di account, condivisione e backup.

### Architettura Cloud Candidata Per La Pubblicazione

Se verra' realizzata una versione online, la prima opzione da valutare e' un backend serverless AWS:

- API Gateway o endpoint equivalenti come ingresso API
- Lambda per autenticazione applicativa, sync, social, feed e operazioni IA
- DynamoDB per metadati sincronizzati, profili, relazioni social e contenuti condivisi
- S3 per foto, backup ed eventuali media scelti dall'utente per la condivisione
- URL prefirmati per upload e download diretti dei media
- Cognito o provider equivalente per account e identita'
- CloudFront opzionale soltanto quando distribuzione e traffico media lo richiederanno
- code/eventi gestiti per elaborazioni asincrone solo quando emergera' un caso reale

Questa e' una direzione candidata, non una dipendenza dell'MVP. La scelta definitiva andra' confrontata con costi, complessita', traffico previsto e alternative disponibili al momento della pubblicazione.

Il confine applicativo previsto e':

1. SQLite resta la source of truth locale e permette uso offline.
2. Un modulo di sync legge e scrive attraverso i repository, senza coinvolgere direttamente la UI.
3. Lambda riceve modifiche versionate e restituisce aggiornamenti incrementali.
4. DynamoDB conserva i dati necessari a multi-dispositivo e social.
5. S3 riceve solo foto abilitate al backup o alla condivisione; le foto locali non vengono caricate automaticamente.

Il modello locale non deve imitare le chiavi di DynamoDB. Dominio, persistenza SQLite e persistenza cloud avranno mapping separati, cosi' una scelta futura di database non obblighera' a riscrivere l'app.

### Vincolo Costo Zero

Per lo sviluppo iniziale:

- usare librerie open source compatibili con Expo
- usare servizi esterni solo entro piani gratuiti e senza renderli indispensabili ai dati personali
- nessun server sempre acceso
- nessuno storage cloud per le foto
- nessuna API IA a pagamento nell'MVP tracker
- Mapbox resta utilizzabile entro il piano gratuito; ricerca manuale tramite pin deve garantire che il modello non dipenda completamente dal provider

Social, sincronizzazione cloud e IA potranno introdurre costi operativi in futuro. Prima di abilitarli andra' definito un modello sostenibile e dovranno rimanere separati dal funzionamento locale di base.

I free tier AWS possono aiutare durante prototipo e lancio, ma non vanno trattati come garanzia di costo zero: prima della pubblicazione serviranno budget, limiti, alert di spesa e protezioni contro traffico anomalo.

### Foto Locali

- `expo-image-picker` per selezione e scatto
- `expo-file-system` per copia in directory gestita
- miniature per non caricare immagini originali nella timeline
- backup esplicito per evitare che la perdita del dispositivo cancelli i ricordi

### Catalogo Dei Paesi

- country code ISO come identificatore stabile
- bandiera derivata dal country code
- continente e nome localizzato da un catalogo versionato
- decisione esplicita su territori e dipendenze, senza affidarsi casualmente al provider cartografico

### Trekking E Percorsi

Nell'MVP un trekking e' una visita con punto rappresentativo, distanza e dislivello opzionali in una futura estensione. Tracce GPX, segmenti e statistiche sportive non fanno parte del primo rilascio.

## Criterio Di Successo Del Tracker

Il prodotto e' valido quando un utente puo':

1. Ricostruire un viaggio passato con date anche approssimative.
2. Inserire citta', trekking, luoghi naturali e categorie personalizzate.
3. Salvare un luogo trovato tramite ricerca o scelto manualmente sulla mappa.
4. Vedere tutti i ricordi sulla mappa e nella timeline.
5. Sbloccare automaticamente le bandiere dei paesi visitati.
6. Sfogliare il passaporto e aprire il dettaglio di ogni paese.
7. Vedere collezioni e statistiche che valorizzano esperienze urbane, culturali e naturali.
8. Allegare foto locali senza obbligo di cloud.
9. Correggere o cancellare dati senza lasciare progressi incoerenti.
10. Esportare i propri ricordi in un formato recuperabile.
