import type { ReviewCase } from "./web-module";

export const inputs: readonly ReviewCase[] = [
  {
    name: "Percorso e ID",
    route: ["Giulia", "Router", "Autorizzazione", "Repository file"],
    input: "GET /api/documents/42 · sessione di Giulia",
    decision:
      "Il router estrae 42 dal percorso. La sessione identifica Giulia. Il servizio cerca la scheda nel suo ambito e controlla il permesso di lettura.",
    variant: {
      label: "Giulia senza lettura",
      input: "GET /api/documents/42 · stessa sessione, permesso assente",
      route: ["Giulia", "Router", "Autorizzazione", "403 al browser"],
      decision: "L’identità è valida. La policy nega la lettura prima che il servizio apra il PDF.",
    },
    risk: "Accettare qualsiasi ID esistente può esporre un file di un altro tenant a una sessione valida.",
    control:
      "Applicare il vincolo di tenant nel repository e la policy sulla risorsa prima di leggere i byte. Riutilizzare la policy anche per l’anteprima.",
    implementation:
      "subject = sessions.require(request.cookie)\nfile = files.inTenant(subject.tenant).require(id)\npolicy.require(subject, 'read', file)\nreturn storage.stream(file.objectKey)",
    evidence:
      "Confrontare due identità di test sullo stesso file. Per il diniego verificare sia l’esito HTTP sia l’assenza di letture nello storage.",
  },
  {
    name: "Query di ricerca",
    route: ["Visitatore", "Ricerca pubblica", "Query metadati", "Risultati HTML"],
    input: "GET /api/search?q=bilancio",
    decision:
      "Il servizio usa il termine come valore in una query sui metadati pubblici. Il frontend inserisce nella pagina il testo dei risultati.",
    variant: {
      label: "Nessun risultato",
      input: "GET /api/search?q=verbale",
      route: ["Visitatore", "Ricerca pubblica", "Query metadati", "Elenco vuoto"],
      decision:
        "Nessuna scheda pubblica corrisponde al termine. La risposta è 200 con un elenco vuoto. Anche un file privato corrispondente deve restare escluso.",
    },
    risk: "Lo stesso input attraversa due interpreti. Comporre SQL come testo o inserire risultati come HTML cambia il significato dei dati.",
    control:
      "Associare i valori a parametri della query, restringere i record visibili e rendere i risultati come testo nel DOM.",
    implementation:
      "rows = catalog.searchPublic(term=boundParameter(q))\nfor row in rows: renderText(row.publicTitle)",
    evidence:
      "Ispezionare il binding nel repository e il punto di rendering nel frontend. Un termine visibile nella pagina da solo non prova una vulnerabilità.",
  },
  {
    name: "Cambio lingua",
    route: ["Browser", "Selettore lingua", "Risorse pubbliche", "Dizionario"],
    input: "Lingua English → GET /locales/en.json",
    decision:
      "Il portale associa le lingue supportate a dizionari pubblici precisi. Il server serve la risorsa statica corrispondente.",
    variant: {
      label: "Lingua italiana",
      input: "Lingua Italiano → GET /locales/it.json",
      route: ["Browser", "Selettore lingua", "Risorse pubbliche", "it.json"],
      decision:
        "Il browser seleziona il dizionario italiano fra le risorse pubblicate e aggiorna le etichette. Il cambio lingua non richiede la lettura dei file del portale.",
    },
    risk: "Un gestore che accettasse un percorso libero per caricare il dizionario allargherebbe l’insieme dei file selezionabili.",
    control:
      "Mappare gli identificatori ammessi a risorse note e separare la directory pubblica dai file applicativi.",
    implementation:
      "dictionary = publicLocales.get(selectedLanguage)\nif dictionary is absent: return unsupportedLanguage\nreturn dictionary",
    evidence:
      "La traccia del browser mostra quale JSON è stato richiesto. La mappa locale e la configurazione statica documentano quali file sono pubblicabili.",
  },
  {
    name: "Login e cookie",
    route: ["Visitatore", "Login", "Gestore sessione", "Browser"],
    input: "POST /login · credenziali nel corpo",
    decision:
      "Il servizio verifica le credenziali, crea la sessione e restituisce un cookie. Nelle richieste successive il backend risolve da quel cookie l’identità.",
    variant: {
      label: "Credenziali errate",
      input: "POST /login · credenziali di test non valide",
      route: ["Visitatore", "Login", "Verifica credenziali", "401 al browser"],
      decision:
        "Il portale restituisce un errore e non crea una sessione. Il medesimo messaggio si applica ad account sconosciuto e password errata.",
    },
    risk: "Messaggi distinti possono rivelare l’esistenza di un account. Tentativi senza limiti consumano risorse e aumentano le possibilità di abuso.",
    control:
      "Usare risposte coerenti per credenziali errate, limitare i tentativi, ruotare la sessione al login e invalidarla al logout.",
    implementation:
      "attempts.requireAvailable(client, account)\nsubject = accounts.verify(credentials)\nif subject is absent: return genericLoginError\nreturn sessions.startFresh(subject)",
    evidence:
      "Nel modello il login errato restituisce 401. Il limite produce 429. Una sessione valida richiede comunque un controllo distinto sul file.",
  },
  {
    name: "Upload e anteprima",
    route: ["Giulia", "Upload", "Storage privato", "Generatore anteprima"],
    input: "POST /api/documents · ID 42, nome dichiarato e byte",
    decision:
      "Il servizio verifica il permesso di aggiornamento e salva una nuova versione. Una successiva richiesta di anteprima autorizzata fa interpretare al generatore i byte della prima pagina.",
    variant: {
      label: "Scrittura negata",
      input: "POST /api/documents · sessione valida senza permesso di aggiornamento",
      route: ["Giulia", "Upload", "Policy scrittura", "403 al browser"],
      decision:
        "Il gestore nega l’aggiornamento. La versione corrente resta nella sua posizione e il generatore non riceve alcun nuovo lavoro.",
    },
    risk: "Il nome, il tipo dichiarato e il contenuto arrivano dal client. Un parser eseguito con privilegi ampi o senza limiti può compromettere l’isolamento e la disponibilità.",
    control:
      "Generare il riferimento di storage sul server, verificare formato e limiti di dimensione e isolare il generatore con budget di memoria e tempo.",
    implementation:
      "policy.require(subject, 'update', file)\npdf = validateLimitedUpload(request.body)\nstorage.writeNewVersion(file.objectKey, pdf)",
    evidence:
      "Controllare chi può scrivere l’oggetto, chi può richiedere il derivato e con quali permessi opera il processo di conversione.",
  },
  {
    name: "Intestazioni al proxy",
    route: ["Client", "Reverse proxy", "Server HTTP", "Applicazione"],
    input: "Host e intestazioni di inoltro",
    decision:
      "Il proxy sceglie il sito pubblicato. Se passa al backend informazioni sul client originario, l’applicazione deve sapere quale intermediario le ha prodotte.",
    variant: {
      label: "Host non pubblicato",
      input: "Host: archivio.example · host fuori configurazione",
      route: ["Client", "Reverse proxy", "Rifiuto in ingresso"],
      decision:
        "Nella configurazione simulata il proxy rifiuta il sito sconosciuto prima dell’inoltro. Il backend non riceve questa richiesta.",
    },
    risk: "Usare intestazioni provenienti direttamente dal client come prova della sua origine rende inaffidabili audit e decisioni basate sull’indirizzo.",
    control:
      "Definire gli host accettati, normalizzare le intestazioni al proxy e configurare sul backend gli intermediari fidati. Restringere l’ingresso diretto al backend.",
    implementation:
      "site = publishedHosts.require(request.host)\nforward(site.backend, normalizedHeaders(request, peer))",
    evidence:
      "Confrontare la configurazione del proxy con quella del framework e con le regole che stabiliscono chi può collegarsi al server HTTP interno.",
  },
  {
    name: "Operazione con sessione",
    route: ["Giulia", "Verifica richiesta", "Policy condivisione", "Registro dei link"],
    input: "POST /api/documents/42/links · sessione e token anti-CSRF validi",
    decision:
      "In questo confronto la UI usa una sessione basata su cookie. Il middleware verifica il token anti-CSRF, poi il servizio controlla il permesso di condividere il file.",
    variant: {
      label: "Token anti-CSRF assente",
      input: "Stessa POST · sessione valida, token anti-CSRF assente",
      route: ["Browser", "Verifica richiesta", "Rifiuto prima della scrittura"],
      decision:
        "Il browser può allegare automaticamente il cookie. Il middleware rifiuta il comando privo del token richiesto e il registro resta invariato.",
    },
    risk: "Per una funzione che modifica stato, ricevere il cookie di Giulia da solo non dimostra che l’azione provenga dal flusso previsto dall’applicazione.",
    control:
      "Applicare la protezione anti-CSRF del framework alle operazioni con effetti, verificare il permesso sulla risorsa e mantenere le GET prive di mutazioni applicative.",
    implementation:
      "csrf.requireValid(request, session)\npolicy.require(session.subject, 'share', file)\nreturn grants.create(file, 'read')",
    evidence:
      "Confrontare i due scambi nel modello e verificare nel registro che soltanto la richiesta accettata abbia creato una concessione.",
  },
];
