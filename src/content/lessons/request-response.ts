export const requestLesson = {
  key: "web-request-response",
  title: "1.4 bis — Dal clic al file: request e response",
};
export const phases = [
  "Dal browser al proxy",
  "Dentro l’applicazione",
  "Ritorno al browser",
] as const;
export type Hop = {
  phase: number;
  from: string;
  to: string;
  channel: "rete" | "chiamata interna" | "elaborazione locale";
  title: string;
  input: string;
  output: string;
  why: string;
};
function hop(
  phase: number,
  from: string,
  to: string,
  channel: Hop["channel"],
  title: string,
  input: string,
  output: string,
  why: string,
): Hop {
  return { phase, from, to, channel, title, input, output, why };
}
const local = "elaborazione locale";
const call = "chiamata interna";
const net = "rete";
const start = hop(
  0,
  "Giulia",
  "Browser",
  local,
  "Il clic separa nome e percorso",
  "https://files.example/api/files/42",
  "host = files.example\npercorso = /api/files/42",
  "Il browser deve trovare il server a cui collegarsi. Conserva il percorso per la successiva richiesta HTTP.",
);
const lookup = hop(
  0,
  "Browser",
  "Resolver DNS",
  net,
  "Il resolver cerca un indirizzo",
  "files.example · record A",
  "Domanda DNS per files.example",
  "Il browser affida la risoluzione al sistema. Al resolver serve il nome del sito. Il percorso del file e il cookie restano sul dispositivo.",
);
const address = hop(
  0,
  "Resolver DNS",
  "Browser",
  net,
  "L’indirizzo torna al browser",
  "Risposta DNS · record A",
  "files.example → 192.0.2.10",
  "Il browser ha ora una destinazione IP. Il resolver ha concluso il suo compito per questa navigazione.",
);
const cached = hop(
  0,
  "Cache DNS",
  "Browser",
  local,
  "L’indirizzo è già disponibile",
  "Voce DNS ancora valida",
  "files.example → 192.0.2.10",
  "Il dispositivo riusa l’indirizzo finché la voce è valida. In questa esecuzione salta lo scambio con il resolver.",
);
const front = [
  hop(
    0,
    "Browser",
    "Reverse proxy",
    net,
    "Si apre la connessione TCP",
    "192.0.2.10 · porta 443",
    "Connessione TCP stabilita",
    "In questo esempio usiamo HTTP/1.1 su una nuova connessione. I due estremi stabiliscono il trasporto prima di inviare la richiesta.",
  ),
  hop(
    0,
    "Browser",
    "Reverse proxy",
    net,
    "Il browser verifica il sito",
    "Nome atteso: files.example",
    "Canale TLS stabilito con il proxy",
    "Il browser verifica il certificato per il nome richiesto. I due estremi concordano le chiavi che proteggeranno i messaggi su questo tratto.",
  ),
  hop(
    0,
    "Browser",
    "Reverse proxy",
    net,
    "Parte la richiesta HTTP",
    "GET /api/files/42 HTTP/1.1\nHost: files.example\nCookie: session=demo",
    "Metodo GET · file 42 · cookie di sessione",
    "Il metodo indica la lettura e il percorso identifica la risorsa. Il browser include il cookie valido per questo sito. Il proxy termina TLS e legge la richiesta.",
  ),
  hop(
    0,
    "Reverse proxy",
    "Router",
    net,
    "Il proxy sceglie l’applicazione",
    "Host: files.example\nPercorso: /api/files/42",
    "Richiesta inoltrata al backend file",
    "La configurazione del proxy associa questo sito e prefisso al backend. Sul collegamento interno parte una richiesta verso quel servizio.",
  ),
];
const application = [
  hop(
    1,
    "Router",
    "Sessione",
    call,
    "Il router abbina metodo e percorso",
    "GET /api/files/42",
    "Rotta GET /api/files/:id\nid = 42",
    "Il router trova il gestore della lettura. In questa applicazione la rotta richiede una sessione, quindi passa prima al modulo che identifica la persona.",
  ),
  hop(
    1,
    "Sessione",
    "Controller",
    call,
    "La sessione identifica Giulia",
    "Cookie: session=demo",
    "utente = Giulia\nid = 42",
    "Il modulo verifica la validità della sessione e associa la richiesta a Giulia. Il permesso sul file resta da valutare.",
  ),
  hop(
    1,
    "Controller",
    "Servizio file",
    call,
    "Il controller traduce la richiesta",
    "utente = Giulia · parametro = 42",
    "apriFile(Giulia, 42)",
    "Il controller controlla il formato dell’identificatore e consegna al servizio i valori applicativi. Da qui i moduli possono lavorare senza conoscere HTTP.",
  ),
  hop(
    1,
    "Servizio file",
    "Repository",
    call,
    "Il servizio cerca la scheda del file",
    "apriFile(Giulia, 42)",
    "cercaScheda(42)",
    "Per decidere se aprire il file servono i permessi e il riferimento all’oggetto. Il repository si occupa di recuperare questi dati.",
  ),
  hop(
    1,
    "Repository",
    "Database",
    net,
    "Il repository legge i metadati",
    "Identificatore del file = 42",
    "Ricerca per ID nella tabella dei file",
    "Il repository invia al database il valore 42 come parametro di lettura. Al servizio servono i metadati per la decisione successiva.",
  ),
  hop(
    1,
    "Database",
    "Repository",
    net,
    "Dal database torna una riga",
    "Ricerca per ID completata",
    "Scheda 42 · permessi · files/42.pdf",
    "La riga descrive il file e indica dove si trova. I byte del PDF sono ancora nello storage.",
  ),
  hop(
    1,
    "Repository",
    "Servizio file",
    call,
    "La scheda torna al servizio",
    "Riga restituita dal database",
    "SchedaFile(42)",
    "Il repository converte la riga in una scheda utilizzabile dal servizio. Ora il servizio può chiedere una decisione sul permesso.",
  ),
];
function decision(allowed: boolean) {
  return hop(
    1,
    "Servizio file",
    "Autorizzazione",
    call,
    "Chi può leggere il file 42?",
    "Giulia + azione lettura + permessi del file",
    allowed ? "Decisione: lettura consentita" : "Decisione: lettura negata",
    "Il modulo confronta l’identità con la regola per quel file e restituisce la decisione al servizio. Qui si separano i percorsi consentito e negato.",
  );
}
const readFile = [
  hop(
    1,
    "Servizio file",
    "Client storage",
    call,
    "Il servizio chiede i byte",
    "Permesso concesso · files/42.pdf",
    "apriOggetto(files/42.pdf)",
    "Il servizio passa la chiave dell’oggetto al client dedicato. Soltanto questo modulo deve conoscere il protocollo e le credenziali dello storage.",
  ),
  hop(
    1,
    "Client storage",
    "Storage",
    net,
    "Lo storage apre l’oggetto",
    "Identità tecnica del backend + files/42.pdf",
    "Flusso di byte del PDF",
    "Lo storage verifica il permesso del servizio e apre l’oggetto richiesto.",
  ),
  hop(
    1,
    "Storage",
    "Client storage",
    net,
    "Inizia la lettura del PDF",
    "Oggetto aperto: files/42.pdf",
    "Flusso leggibile sul collegamento interno",
    "Lo storage consegna i byte al client a blocchi. Il backend può prepararne l’inoltro senza caricare tutto il file in memoria.",
  ),
  hop(
    1,
    "Client storage",
    "Servizio file",
    call,
    "Il client restituisce un flusso",
    "Flusso proveniente dallo storage",
    "Lettore dei byte del PDF",
    "Il servizio riceve un oggetto da cui leggere. I dettagli della connessione restano nel client storage.",
  ),
  hop(
    1,
    "Servizio file",
    "Controller",
    call,
    "Il risultato torna al controller",
    "Lettore del PDF e tipo del file",
    "Esito: file disponibile",
    "Il lavoro applicativo è concluso. Il controller usa il risultato per costruire la risposta HTTP.",
  ),
];
const denied = hop(
  1,
  "Servizio file",
  "Controller",
  call,
  "Il servizio interrompe la lettura",
  "Decisione: lettura negata",
  "Esito applicativo: accesso negato",
  "Il servizio restituisce il diniego al controller. Il client storage non viene chiamato e il PDF resta nell’archivio.",
);
function response(allowed: boolean) {
  const headers = allowed
    ? "HTTP/1.1 200 OK\nContent-Type: application/pdf"
    : "HTTP/1.1 403 Forbidden\nContent-Type: text/plain; charset=utf-8";
  return [
    hop(
      2,
      "Controller",
      "Reverse proxy",
      net,
      "L’applicazione prepara la risposta",
      allowed ? "Flusso aperto sul PDF" : "Accesso negato",
      headers,
      "Il controller rappresenta l’esito con uno stato HTTP e indica il tipo del corpo. Il server invia la risposta al proxy.",
    ),
    hop(
      2,
      "Reverse proxy",
      "Browser",
      net,
      "Arrivano le intestazioni",
      headers,
      allowed
        ? "Il browser prepara il visualizzatore PDF"
        : "Il browser prepara una risposta testuale",
      "Il proxy inoltra la risposta sul canale con il browser. Stato e tipo di contenuto sono disponibili prima del completamento del corpo.",
    ),
    hop(
      2,
      "Reverse proxy",
      "Browser",
      net,
      "Arrivano i byte del corpo",
      allowed ? "Corpo della risposta dal backend" : "Messaggio di errore dal backend",
      allowed ? "%PDF-… · dati della prima pagina" : "Accesso al file negato",
      "Il proxy inoltra il corpo. Il browser può iniziare a elaborare i dati ricevuti mentre il trasferimento prosegue.",
    ),
    hop(
      2,
      "Browser",
      "Schermo",
      local,
      allowed ? "Appare la prima pagina" : "Appare il messaggio",
      allowed ? "Dati necessari alla visualizzazione" : "Testo della risposta 403",
      allowed ? "File 42.pdf · pagina 1" : "403 · Accesso al file negato",
      allowed
        ? "Quando dispone dei dati sufficienti, il visualizzatore interpreta il PDF e disegna la pagina sullo schermo di Giulia."
        : "Il browser mostra il testo restituito dal backend. Nessun byte del file è stato letto dallo storage o consegnato al browser.",
    ),
  ];
}
export function buildRequestTrace(dnsCached: boolean, allowed: boolean): [Hop, ...Hop[]] {
  return [
    start,
    ...(dnsCached ? [cached] : [lookup, address]),
    ...front,
    ...application,
    decision(allowed),
    ...(allowed ? readFile : [denied]),
    ...response(allowed),
  ];
}
