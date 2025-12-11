# **TrailSafe – Web App per la Sicurezza sui Sentieri Escursionistici**

TrailSafe è una **Web App interattiva** progettata per migliorare la sicurezza degli escursionisti, fornendo informazioni aggiornate in tempo reale sui sentieri, sulle condizioni ambientali e sui potenziali rischi.  
La piattaforma permette di consultare mappe, ricevere avvisi dinamici e gestire contenuti sia per gli utenti escursionisti sia per gli amministratori.

---

## 🚀 Obiettivi del Progetto
- Fornire uno strumento intuitivo e affidabile per la pianificazione delle escursioni.  
- Offrire una valutazione **dinamica della difficoltà dei percorsi**, basata su condizioni reali (meteo, visibilità, percorribilità).  
- Consentire la gestione completa dei sentieri e delle segnalazioni da parte degli amministratori.  
- Aumentare la sicurezza durante le attività outdoor.

---

## 🌍 Funzionalità Principali

### 🗺️ Mappa Interattiva
- Visualizzazione dei sentieri su una mappa esplorabile.  
- Visualizzazione di punti di interesse (rifugi, acqua, belvedere).  
- Evidenziazione di aree critiche (frane, terreno fangoso, neve, chiusure).

### ⛅ Informazioni Ambientali in Tempo Reale
- Aggiornamento automatico delle condizioni meteo.  
- Aggiornamento della percorribilità del terreno.  
- **Difficoltà dei sentieri variabile dinamicamente** in base ai fattori ambientali.

### 🔔 Notifiche Push
- Avvisi di maltempo improvviso.  
- Chiusura o modifica dello stato di un percorso.  
- Notifiche personalizzate sui percorsi salvati dall’utente.

### 👤 Gestione Utenti
#### Escursionista
- Registrazione e login.  
- Filtraggio dei percorsi in base all’esperienza.  
- Salvataggio dei sentieri preferiti.  
- Invio di segnalazioni (ostacoli, anomalie, frane).

#### Amministratore
- Creazione, modifica e rimozione dei sentieri.  
- Aggiornamento dello stato dei percorsi.  
- Moderazione delle segnalazioni degli utenti.  
- Pubblicazione di avvisi importanti.

---

## 🛠️ Tecnologie Consigliate

### Opzione A — Stack MEVN
- **MongoDB**  
- **Express.js**  
- **Vue.js**  
- **Node.js**

---

**Setup iniziale (scaffold)**

Ho aggiunto uno scaffolding minimale per cominciare subito a sviluppare:
- `server/` — Express API (es. `GET /api/status`, `GET /api/trails`, `POST /api/trails/report`)
- `client/` — Vue 3 + Vite minimal app che consuma le API

Comandi rapidi (PowerShell):

```powershell
# Server
cd server
npm install
npm run dev

# In un altro terminale: Client
cd client
npm install
npm run dev
```

Il client Vite è configurato per proxyare `/api` a `http://localhost:3000`.





