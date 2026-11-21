import { readCases, readRequest } from "./cybersecurity-1-4";

export const layerNames = ["Interfaccia pubblica", "Funzioni web", "Servizi interni"] as const;
export type Finding = readonly [layer: 0 | 1 | 2, name: string];
type Evidence = {
  question: string;
  hypotheses: readonly [string, string];
  correct: 0 | 1;
  proof: string;
  evidence: string;
  findings: readonly Finding[];
};
const cases = {
  home: {
    evidence: "Route / → pagina HTML",
    question: "Che cosa ha ricevuto il browser?",
    hypotheses: ["La pagina iniziale del portale.", "I byte di tutti i file elencati nel sito."],
    correct: 0,
    proof:
      "Il gestore di / invia HTML con i comandi del portale. La traccia termina qui: per leggere il PDF occorre un’altra richiesta.",
    findings: [[0, "Pagina iniziale"]],
  },
  catalog: {
    evidence: "Scheda pubblica #42 → collegamento /api/documents/42",
    question: "Vedere 42.pdf nell’elenco dimostra che puoi scaricarlo?",
    hypotheses: [
      "Sì, il PDF è già nella pagina.",
      "Il catalogo contiene una scheda pubblica. La lettura ha un ingresso proprio.",
    ],
    correct: 1,
    proof:
      "Il template del catalogo contiene nome e ID del file e un collegamento alla risorsa 42. Il corpo della risposta è HTML. Prova «Apri 42.pdf» per osservare la decisione sulla lettura.",
    findings: [[0, "Catalogo HTML"]],
  },
  language: {
    evidence: "Lingue ammesse: it → it.json · en → en.json",
    question: "Come sceglie la traduzione questo portale?",
    hypotheses: [
      "Una tabella associa le lingue disponibili a risorse predefinite.",
      "Il backend apre un percorso arbitrario scelto dal visitatore.",
    ],
    correct: 0,
    proof:
      "La configurazione del frontend contiene due voci: it ed en. La scelta seleziona una risorsa JSON pubblica. Il browser legge il dizionario e aggiorna le etichette della pagina.",
    findings: [[0, "Dizionari di lingua"]],
  },
  loginError: {
    evidence: "Account assente → 401 · password errata → 401 · stesso corpo",
    question: "L’errore permette di capire se l’account esiste?",
    hypotheses: [
      "Il messaggio conferma che l’account esiste.",
      "I due tipi di errore possono produrre lo stesso messaggio.",
    ],
    correct: 1,
    proof:
      "Nel ramo «account sconosciuto» e nel ramo «password errata» il gestore restituisce lo stesso stato e lo stesso testo. Puoi confrontare i due casi con il selettore. Un singolo errore non mostra quale limite ai tentativi sia configurato.",
    findings: [[1, "Login"]],
  },
  limited: {
    evidence: "Contatore del client: 3 errori → attesa 60 s → verifica credenziali sospesa",
    question: "Il server ha valutato queste credenziali?",
    hypotheses: [
      "Ha verificato la password e l’ha rifiutata.",
      "Ha applicato prima il limite temporaneo.",
    ],
    correct: 1,
    proof:
      "Nel modello, dopo tre errori consecutivi dallo stesso client, il gestore sospende per 60 secondi la valutazione di nuovi tentativi. Retry-After indica l’attesa residua. Puoi far avanzare l’orologio simulato.",
    findings: [[1, "Limite ai tentativi"]],
  },
  signed: {
    evidence: "Sessione demo → identità Giulia · permesso sul file ancora da valutare",
    question: "Che cosa dimostra il login riuscito?",
    hypotheses: [
      "Il backend può associare le richieste successive a Giulia.",
      "Giulia può leggere ogni file del portale.",
    ],
    correct: 0,
    proof:
      "Il server crea una sessione e restituisce il cookie al browser. Il gestore della lettura dovrà ancora verificare il permesso su 42.pdf.",
    findings: [
      [1, "Login"],
      [1, "Sessione"],
    ],
  },
  logout: {
    evidence: "Sessione demo invalidata → risposta senza corpo",
    question: "Cosa cambia per la prossima richiesta del PDF?",
    hypotheses: [
      "Il server considererà ancora Giulia autenticata.",
      "Il browser dovrà presentare una nuova sessione valida.",
    ],
    correct: 1,
    proof:
      "Il server invalida la sessione del portale e fa scadere il cookie. La scheda pubblica del file resta consultabile.",
    findings: [[1, "Sessione"]],
  },
  visitor: {
    evidence: "Sessione assente → 401 · storage non chiamato",
    question: "Chi ha fermato la lettura?",
    hypotheses: [
      "Lo storage ha già ricevuto la richiesta.",
      "Il backend richiede una sessione prima di cercare i permessi.",
    ],
    correct: 1,
    proof: readCases.visitor.why,
    findings: [
      [0, "Ingresso HTTPS"],
      [1, "Lettura del file"],
      [1, "Sessione"],
    ],
  },
  denied: {
    evidence: "Giulia → scheda 42 → lettura negata · storage non chiamato",
    question: "Perché questa volta la risposta è 403?",
    hypotheses: [
      "Giulia è riconosciuta, ma manca il permesso sul file 42.",
      "Il PDF è stato cancellato.",
    ],
    correct: 0,
    proof: readCases.denied.why,
    findings: [
      [1, "Lettura del file"],
      [1, "Autorizzazione"],
      [2, "Database dei metadati"],
    ],
  },
  allowed: {
    evidence: "Giulia → permesso di lettura → identità del backend → files/42.pdf",
    question: "Quale identità presenta la lettura allo storage?",
    hypotheses: [
      "Lo storage riceve il cookie del browser.",
      "Il backend usa le proprie credenziali dopo aver autorizzato Giulia.",
    ],
    correct: 1,
    proof: readCases.allowed.why,
    findings: [
      [1, "Autorizzazione"],
      [1, "Lettura del file"],
      [2, "Database dei metadati"],
      [2, "Storage privato"],
    ],
  },
  search: {
    evidence:
      "Backend: parametro di ricerca → database dei metadati\nBrowser: termine ricevuto → nodo di testo",
    question: "Il termine ricompare nei risultati. Come viene trattato?",
    hypotheses: [
      "Vedere il termine basta a dimostrare che viene eseguito come codice.",
      "Può essere un valore nella query e semplice testo nella pagina.",
    ],
    correct: 1,
    proof:
      "Nel modello il backend passa il termine come parametro a una query predefinita sui metadati pubblici. Il browser inserisce il termine in un nodo di testo. La ricerca e la riflessione del termine, da sole, non dimostrano SQL injection o XSS.",
    findings: [
      [0, "Pagina dei risultati"],
      [1, "Ricerca"],
      [2, "Database dei metadati"],
    ],
  },
  upload: {
    evidence: "Giulia → permesso di scrittura → controlli sul PDF → versione in archivio",
    question: "Quale nuovo dato ha attraversato il confine verso il backend?",
    hypotheses: ["Solo il numero 42.", "Il nome e i byte scelti da Giulia."],
    correct: 1,
    proof:
      "Il gestore controlla il permesso di aggiornamento, il formato e la dimensione del PDF dimostrativo. Scrive la nuova versione nello storage. La stessa porta HTTPS ora riceve contenuti da elaborare.",
    findings: [
      [1, "Upload"],
      [2, "Storage privato"],
    ],
  },
  preview: {
    evidence: "File 42 → generatore di miniature → immagine PNG",
    question: "Chi deve interpretare il PDF per mostrare la miniatura?",
    hypotheses: [
      "Il generatore interno legge la prima pagina.",
      "Il browser riceve di nuovo tutto il PDF.",
    ],
    correct: 0,
    proof:
      "Il backend controlla il permesso di lettura e incarica il generatore. Con un’identità tecnica limitata, il generatore legge il PDF e crea la miniatura. Al browser torna un’immagine.",
    findings: [
      [1, "Anteprima"],
      [2, "Generatore di miniature"],
    ],
  },
  share: {
    evidence: "Giulia → concessione di sola lettura → link per il file 42",
    question: "Come viene autorizzato il destinatario del link in questo esempio?",
    hypotheses: [
      "Con la sessione di Giulia.",
      "Il servizio verifica un token di sola lettura legato al file.",
    ],
    correct: 1,
    proof:
      "Giulia ha il permesso di condividere. Il servizio crea un token revocabile per il file 42. Chi apre il link presenta quel token al gestore, che verifica la concessione prima della lettura.",
    findings: [[1, "Condivisione"]],
  },
  revoke: {
    evidence: "Giulia → revoca della concessione → token inattivo",
    question: "Che cosa può ottenere il destinatario riprovando lo stesso link?",
    hypotheses: [
      "Il servizio ferma la nuova lettura.",
      "La revoca rimuove anche le copie già scaricate.",
    ],
    correct: 0,
    proof:
      "La concessione è revocata. Se il collega riapre il link, la nuova richiesta si fermerà al gestore. Le copie già consegnate al destinatario rimangono sul suo dispositivo.",
    findings: [[1, "Condivisione"]],
  },
  sharedRead: {
    evidence: "Token attivo → gestore della condivisione → storage → browser del collega",
    question: "Da dove deriva il permesso del collega?",
    hypotheses: [
      "Dal token valido presentato al gestore del link.",
      "Dal cookie di Giulia, copiato nel suo browser.",
    ],
    correct: 0,
    proof:
      "Il gestore trova la concessione di sola lettura associata al token e al file 42. Chiede i byte con l’identità del servizio e li restituisce al browser del collega.",
    findings: [
      [1, "Lettura da link"],
      [2, "Storage privato"],
    ],
  },
  sharedGone: {
    evidence: "Token revocato → 410 · storage non chiamato",
    question: "Dove si è fermata questa nuova richiesta?",
    hypotheses: ["Nello storage durante la lettura dei byte.", "Al controllo del token revocato."],
    correct: 1,
    proof:
      "Il gestore rifiuta il token prima di chiamare lo storage. Il browser del collega riceve la risposta 410. Le copie scaricate prima della revoca restano sul dispositivo.",
    findings: [[1, "Lettura da link"]],
  },
  restore: {
    evidence: "Operatore demo → permesso di ripristino → copia v1 → storage",
    question: "Quale identità può sostituire la versione corrente?",
    hypotheses: [
      "Ogni visitatore del catalogo.",
      "Un operatore autorizzato tramite il servizio di ripristino.",
    ],
    correct: 1,
    proof:
      "La console amministrativa verifica l’operatore demo. Il servizio di ripristino legge la versione iniziale dal backup e la scrive nello storage. Questo ingresso privilegiato è indipendente dalla sessione web di Giulia.",
    findings: [
      [1, "Console di ripristino"],
      [2, "Backup"],
      [2, "Storage privato"],
    ],
  },
} as const satisfies Record<string, Evidence>;

type Case = keyof typeof cases;
export function exchange(kind: Case, request: string, response: string) {
  return { kind, request, response, ...cases[kind] };
}
export type Exchange = ReturnType<typeof exchange>;
export const home = () => exchange("home", "GET /", "200 OK · text/html\nPortale documenti");
export const catalog = () =>
  exchange("catalog", "GET /documenti", "200 OK · text/html\n42.pdf · Bilancio annuale");
export function readFile(signed: boolean, allowed: boolean, version: number) {
  const kind = !signed ? "visitor" : allowed ? "allowed" : "denied";
  return exchange(
    kind,
    readRequest + (signed ? "\nCookie: session=demo" : ""),
    readCases[kind].status +
      (kind === "allowed"
        ? "\nContent-Type: application/pdf\n42.pdf · versione " + version
        : "\nNessun byte del PDF"),
  );
}
