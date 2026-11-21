export const readRequest = "GET /api/documents/42";

export const readCases = {
  visitor: {
    status: "401 Unauthorized",
    stage: "Sessione assente",
    title: "Il gestore di sessione ferma la richiesta",
    why: "Il proxy ha inoltrato la richiesta al backend. Senza una sessione valida il backend non sa chi sta chiedendo il file. Risponde al browser prima di consultare i permessi o chiamare lo storage.",
    storage: "Nessuna chiamata",
  },
  denied: {
    status: "403 Forbidden",
    stage: "Lettura negata",
    title: "Il modulo di autorizzazione ferma la richiesta",
    why: "Il backend ha riconosciuto Giulia dalla sessione e ha consultato la scheda 42 nel database. Giulia non ha il permesso di lettura su questo file. Il browser riceve il diniego e nessun byte del PDF.",
    storage: "Nessuna chiamata",
  },
  allowed: {
    status: "200 OK",
    stage: "Lettura consentita",
    title: "Il browser riceve 42.pdf",
    why: "Il backend ha riconosciuto Giulia e verificato il suo permesso sulla scheda 42. Poi ha chiesto il file con la propria identità tecnica. Lo storage ha verificato che il servizio possa leggere l’oggetto e ha restituito i byte, che tornano al browser tramite il proxy.",
    storage: "Byte restituiti",
  },
} as const;

export const layers = ["Ingresso HTTPS", "Lettura del file", "Storage privato"] as const;
export type ReadCase = keyof typeof readCases;
export function describeLayer(layer: (typeof layers)[number], result: ReadCase) {
  if (layer === "Ingresso HTTPS") {
    return "Il browser sceglie l’ID 42 e invia la richiesta a files.example sulla porta 443. Il reverse proxy riceve connessioni da Internet e inoltra la richiesta al backend. Anche un visitatore può arrivare a questo ingresso.";
  }
  if (layer === "Lettura del file") {
    if (result === "visitor")
      return "L’endpoint riceve un ID scelto dal browser. Il gestore di sessione richiede un’identità verificata. Senza di essa la richiesta si ferma qui.";
    if (result === "denied")
      return "La sessione identifica Giulia. Il modulo di autorizzazione confronta la sua identità con i permessi della scheda 42 e nega la lettura. Conoscere l’ID del file permette di chiederlo.";
    return "La sessione identifica Giulia. Il modulo di autorizzazione trova sulla scheda 42 il suo permesso di lettura e il backend può chiedere il PDF allo storage.";
  }
  return result === "allowed"
    ? "Il chiamante qui è il backend. Lo storage verifica le credenziali del servizio e il suo permesso su files/42.pdf. Solo dopo apre l’oggetto."
    : "Il browser può raggiungere l’ingresso HTTPS. L’API dello storage è privata e richiede le credenziali del servizio. In questo caso il backend si è fermato prima di chiamarla.";
}

export const features = [
  {
    id: "upload",
    question: "Chi riceverà il nome e i byte se Giulia carica una nuova versione?",
    label: "Caricamento",
    activate: "Attiva caricamento",
    undo: "Disattiva caricamento",
    route: "Browser di Giulia → Backend → Storage",
    payload: "Nome e byte del PDF · HTTPS · 443",
    flow: "Giulia sceglie una nuova versione di 42.pdf. Con POST /api/documents il browser invia nome e byte al backend. Il servizio verifica il permesso di scrittura, il tipo e la dimensione del file prima di archiviarlo.",
    growth:
      "Sulla stessa porta 443 il backend accetta ora contenuto scelto da Giulia e può modificare ciò che resta nell’archivio.",
  },
  {
    id: "preview",
    question: "Se Giulia vuole vedere una miniatura, quale altro servizio dovrà aprire il PDF?",
    label: "Anteprima",
    activate: "Genera anteprima",
    undo: "Disattiva anteprima",
    route: "Storage → Generatore → Browser",
    payload: "PDF al generatore · miniatura al browser",
    flow: "Dopo il caricamento il backend affida al generatore l’ID 42. Il generatore usa la propria identità di servizio per leggere il PDF, interpreta la prima pagina e produce una miniatura. Il browser di Giulia la riceve tramite la webapp.",
    growth:
      "Gli stessi byte forniti da Giulia raggiungono un interprete di PDF. Questo processo interno deve gestire anche file malformati e lavorare con limiti di memoria, tempo e accesso allo storage.",
  },
  {
    id: "share",
    question: "Chi potrà ricevere il PDF aprendo un link condiviso?",
    label: "Link condiviso",
    activate: "Attiva link condiviso",
    undo: "Disattiva condivisione",
    route: "Gestore del link → Destinatario",
    payload: "Token al gestore · PDF al destinatario",
    flow: "Giulia crea un link di sola lettura per 42.pdf e lo invia a un collega. Il collega apre il link senza la sessione di Giulia. Il gestore controlla che il token sia valido per quel file e ancora attivo, poi consegna il PDF.",
    growth:
      "Si aggiunge una via di uscita per il file. Chi possiede il link può usarla finché il token è valido. La revoca blocca le letture future. Le copie già scaricate restano sui dispositivi.",
  },
  {
    id: "restore",
    question: "Chi può cambiare la versione corrente del file senza passare dal browser di Giulia?",
    label: "Ripristino",
    activate: "Attiva ripristino",
    undo: "Disattiva ripristino",
    route: "Backup → Servizio di ripristino → Storage",
    payload: "Comando dalla console · byte dal backup",
    flow: "Un operatore sceglie nella console la versione precedente di 42.pdf. La console verifica il suo permesso di ripristino. Il servizio legge i byte dal backup con la propria identità e li scrive nello storage come versione corrente.",
    growth:
      "La console accetta un comando privilegiato che cambia il file anche mentre Giulia è scollegata. Occorre verificare operatore, versione e destinazione prima della scrittura.",
  },
] as const;
