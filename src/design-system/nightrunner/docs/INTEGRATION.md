# Integrazione Agent Time Weaver

- Sorgenti React web e core importati localmente, con percorsi originali; nessuna dipendenza npm Nightrunner, React Native o Expo.
- CSS e font Rajdhani locali caricati una volta da `src/styles.css`; licenza OFL mantenuta.
- `ThemeProvider` applica `HudTheme gradientIntensity={65}`. Il tema HUD scuro è il default; il controllo giorno/notte esistente resta disponibile.
- Gli adattatori condivisi mantengono i contratti precedenti: pulsanti e badge usano componenti HUD, campi usano gli stili forniti, selezioni/switch/tabs/dialog mantengono i comportamenti accessibili Radix.
- Token semantici definiti globalmente anche per contenuti in portal; timeline con superfici neutre e colori cliente come bordi, per preservare la leggibilità.
- Nessuna modifica a dati, autorizzazioni, timer, servizi AI o strumenti MCP. Nessuna pubblicazione.

## Verifiche eseguite

- Ultimo segnale automatico: build OK.
- Test `task-work-log.test.tsx` e `work-entries.test.ts`: 7/7 superati.
- Playwright sulla pagina accesso reale: desktop 1280×1800 e mobile 390×844, font Rajdhani caricato, gradiente con stop di intensità 65, focus ciano, email non valida respinta, nessun overflow orizzontale, nessun errore JavaScript.
- Playwright su montaggio isolato in memoria dei controlli effettivi dell’app: switch, checkbox, select, tab da tastiera, messaggio errore, disabilitazione, apertura e chiusura dialog via Escape/pulsante, ritorno del focus, finestra mobile senza overflow. Nessun salvataggio né dato sintetico persistente.
- Screenshot esaminati per pagina accesso e controlli/dialog.
- Tutte le pagine di contenuto hanno metadati specifici (title, description, Open Graph e Twitter).

## Limite

Le pagine autenticate con i dati reali non sono state verificate: la sessione dell’anteprima è assente e la richiesta di sessione per l’utente non ha trovato una corrispondenza. Occorre accesso dell’utente nell’anteprima per completare questo controllo. La prova isolata dei controlli non sostituisce una verifica completa di Team, Report e Timeline autenticati.