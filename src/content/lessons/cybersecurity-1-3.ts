import type {
  ArchitectureLevel,
  DataFlowConfig,
  DataFlowHighlight,
} from "@/components/data-flow/types";

export const lesson = {
  id: "cybersecurity-1-3",
  title: "1.3 — Il viaggio di un'informazione",
  subtitle: "Dove si trovano, come vengono elaborati e quali percorsi attraversano i dati.",
} as const;

export const moments = [
  { value: "domanda", label: "1 · La domanda" },
  { value: "essenziale", label: "2 · L'essenziale" },
  { value: "espansione", label: "3 · L'architettura" },
  { value: "richiesta", label: "4 · La richiesta" },
  { value: "stati", label: "5 · Gli stati del dato" },
  { value: "copie", label: "6 · Le copie" },
  { value: "confini", label: "7 · I confini di fiducia" },
  { value: "conclusione", label: "8 · La conclusione" },
] as const;

export type Moment = (typeof moments)[number]["value"];

export const contract = {
  title: "Contratto di fornitura — ID 42",
  customer: "Azienda Alfa S.r.l.",
  supplier: "Azienda Beta S.p.A.",
  amount: "€ 125.000",
  classification: "Riservato",
  fileReference: "files/42.pdf",
} as const;

export const levels: readonly {
  value: ArchitectureLevel;
  label: string;
  title: string;
  description: string;
}[] = [
  {
    value: 1,
    label: "Livello 1",
    title: "Architettura essenziale",
    description: "Browser, backend e database mostrano il percorso minimo tra interfaccia, logica e dati strutturati.",
  },
  {
    value: 2,
    label: "Livello 2",
    title: "Architettura web più realistica",
    description: "Reverse proxy, cache e object storage separano ingresso delle richieste, dati temporanei e contenuto dei file.",
  },
  {
    value: 3,
    label: "Livello 3",
    title: "Persistenza e servizi aggiuntivi",
    description: "Backup, file temporanei e log completano il quadro senza implicare collegamenti indiscriminati tra tutti i sistemi.",
  },
];

export const documentRequest =
  "GET /api/documents/42 HTTP/1.1\nHost: files.example\nCookie: session=demo-session-id";

export const documentResponse =
  "HTTP/1.1 200 OK\nCache-Control: no-store\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=42.pdf\n\n[byte simulati di 42.pdf]";

export const architecture: DataFlowConfig = {
  id: "saas-document-architecture-1-3",
  label: "Mappa dell'architettura del gestionale SaaS",
  width: 1000,
  height: 500,
  nodes: [
    {
      id: "browser",
      label: "Browser",
      kind: "client",
      level: 1,
      x: 95,
      y: 250,
      description: "Il browser mostra la pagina a Giulia e riceve i file che lei chiede di scaricare.",
      responsibilities: ["Presenta l'interfaccia utente", "Genera richieste", "Visualizza le risposte"],
      dataRole: "process",
    },
    {
      id: "proxy",
      label: "Reverse proxy",
      kind: "gateway",
      level: 2,
      x: 280,
      y: 250,
      description: "Il reverse proxy, o web server, è il punto di ingresso delle richieste verso i servizi applicativi.",
      responsibilities: [
        "Riceve le richieste dal browser",
        "Termina TLS quando il collegamento dal browser usa HTTPS",
        "Inoltra il traffico al backend",
      ],
      dataRole: "transmit",
    },
    {
      id: "backend",
      label: "Backend",
      kind: "compute",
      level: 1,
      x: 480,
      y: 250,
      description: "Il backend esegue la logica applicativa e media l'accesso ai sistemi di persistenza.",
      responsibilities: [
        "Riceve le richieste ed esegue la logica applicativa",
        "Verifica autenticazione e autorizzazioni sul tenant",
        "Interroga database, cache e object storage",
      ],
      dataRole: "process",
    },
    {
      id: "database",
      label: "Database",
      kind: "database",
      level: 1,
      x: 725,
      y: 100,
      description: "Il database conserva informazioni strutturate e persistenti, inclusi i metadati del documento.",
      responsibilities: [
        "Conserva utenti, documenti e organizzazioni",
        "Permette interrogazioni e aggiornamenti",
        "Nel nostro scenario conserva i metadati e il riferimento al file, non il suo contenuto",
      ],
      dataRole: "store",
    },
    {
      id: "cache",
      label: "Cache Redis",
      kind: "cache",
      level: 2,
      x: 725,
      y: 250,
      description: "Redis conserva per un tempo limitato le schede dei file consultati di frequente.",
      responsibilities: ["Ospita dati temporanei ad accesso rapido", "Può ridurre interrogazioni ripetute", "Il contenuto effettivamente salvato dipende dalla configurazione"],
      dataRole: "store",
    },
    {
      id: "storage",
      label: "Object storage",
      kind: "storage",
      level: 2,
      x: 725,
      y: 400,
      description: "L'object storage conserva il contenuto binario dei documenti, separato dai metadati nel database.",
      responsibilities: ["Conserva il file 42.pdf", "Fornisce il contenuto al backend autorizzato", "Mantiene il file oltre la singola richiesta"],
      dataRole: "store",
    },
    {
      id: "backup",
      label: "Backup",
      kind: "backup",
      level: 3,
      x: 905,
      y: 100,
      description: "Il backup conserva copie di ripristino secondo politiche e tempi di conservazione definiti.",
      responsibilities: ["Riceve copie dal database e dallo storage", "Consente il ripristino", "Può conservare informazioni anche dopo l'eliminazione operativa"],
      dataRole: "store",
    },
    {
      id: "temp",
      label: "File temporanei",
      kind: "temporary",
      level: 3,
      x: 480,
      y: 425,
      description: "Il backend può creare file temporanei per alcune elaborazioni. Non sono necessari in ogni richiesta.",
      responsibilities: ["Supportano elaborazioni specifiche", "Possono finire su disco", "Richiedono cancellazione e tempi di conservazione controllati"],
      dataRole: "store",
    },
    {
      id: "logs",
      label: "Sistemi di logging",
      kind: "logging",
      level: 3,
      x: 480,
      y: 75,
      description: "I log registrano eventi operativi. In questo scenario contengono ID e metadati tecnici, non l'intero documento.",
      responsibilities: ["Registrano eventi e diagnostica", "Conservano informazioni derivate", "Non devono registrare impropriamente dati sensibili"],
      dataRole: "store",
    },
  ],
  connections: [
    { id: "browser-backend", from: "browser", to: "backend", label: "HTTPS", level: 1, maxLevel: 1, protection: "TLS sul collegamento mostrato" },
    { id: "browser-proxy", from: "browser", to: "proxy", label: "HTTPS · TLS", level: 2, protection: "TLS attivo; termina sul reverse proxy" },
    { id: "proxy-backend", from: "proxy", to: "backend", label: "HTTP / HTTPS", level: 2, protection: "Da valutare: dipende dalla configurazione interna" },
    { id: "backend-database", from: "backend", to: "database", label: "Query e metadati", level: 1, protection: "Protezione da verificare sul collegamento specifico" },
    { id: "backend-cache", from: "backend", to: "cache", label: "Letture e scritture", level: 2, protection: "Protezione da verificare sul collegamento specifico" },
    { id: "backend-storage", from: "backend", to: "storage", label: "File 42.pdf", level: 2, protection: "Protezione da verificare sul collegamento specifico" },
    { id: "database-backup", from: "database", to: "backup", label: "Copia metadati", level: 3 },
    { id: "storage-backup", from: "storage", to: "backup", label: "Copia file", level: 3 },
    { id: "backend-temp", from: "backend", to: "temp", label: "Elaborazioni temporanee", level: 3 },
    { id: "backend-logs", from: "backend", to: "logs", label: "Eventi tecnici", level: 3 },
  ],
  boundaries: [
    {
      id: "client-service",
      label: "Utente ↔ servizio",
      description: "Separa il dispositivo e il browser dell'utente dall'infrastruttura del servizio.",
      level: 1,
      x: 190,
    },
    {
      id: "gateway-application",
      label: "Ingresso ↔ applicazione",
      description: "Separa il punto di ingresso dal backend. La terminazione TLS sul proxy non copre automaticamente il tratto successivo.",
      level: 2,
      x: 380,
    },
    {
      id: "application-data",
      label: "Applicazione ↔ dati",
      description: "Separa la logica applicativa dai sistemi che conservano dati e dalle loro credenziali.",
      level: 1,
      x: 610,
    },
  ],
  events: [
    {
      id: "browser-request",
      title: "Browser · genera la richiesta",
      description: "Giulia seleziona «Scarica PDF». Il browser chiede il file con ID 42.",
      nodes: ["browser"],
      transfers: [],
      payloadLabel: "Richiesta HTTP simulata",
      payload: documentRequest,
    },
    {
      id: "proxy-forward",
      title: "Reverse proxy · riceve e inoltra",
      description: "Il reverse proxy riceve la richiesta HTTPS, termina TLS nello scenario e la inoltra al backend.",
      nodes: ["proxy"],
      transfers: [
        { connection: "browser-proxy", direction: "forward" },
        { connection: "proxy-backend", direction: "forward" },
      ],
      payloadLabel: "Richiesta inoltrata",
      payload: "GET /api/documents/42\nCookie: session=demo-session-id\n→ destinazione: backend",
    },
    {
      id: "backend-identify",
      title: "Backend · identifica Giulia",
      description: "Il backend riconosce Giulia dalla sessione. Per decidere se può leggere il file deve ora consultarne la scheda.",
      nodes: ["backend"],
      transfers: [],
      payloadLabel: "Verifica applicativa simulata",
      payload: "session=demo-session-id → Giulia\ntenant: Azienda Alfa S.r.l.\nfile 42: permesso da verificare",
    },
    {
      id: "database-metadata",
      title: "Database · restituisce i metadati",
      description: "Il backend interroga il database e recupera classificazione, tenant e riferimento al file nello storage.",
      nodes: ["backend", "database"],
      transfers: [{ connection: "backend-database", direction: "reverse" }],
      payloadLabel: "Metadati del documento",
      payload: "id: 42\ntenant: Azienda Alfa S.r.l.\nnome: 42.pdf\nclassificazione: Riservato\npermesso di lettura: Giulia\nfile: files/42.pdf",
    },
    {
      id: "storage-content",
      title: "Object storage · restituisce il file",
      description: "Il backend verifica sulla scheda che Giulia possa leggere il file. Ottenuto il permesso, usa il riferimento per chiedere i byte allo storage.",
      nodes: ["backend", "storage"],
      transfers: [{ connection: "backend-storage", direction: "reverse" }],
      payloadLabel: "Contenuto recuperato",
      payload: "files/42.pdf\n→ blocchi di 42.pdf nella memoria del backend",
    },
    {
      id: "response-return",
      title: "Risposta · torna verso il browser",
      description: "Il backend costruisce la risposta. Il documento attraversa di nuovo il reverse proxy diretto al browser.",
      nodes: ["backend", "proxy", "browser"],
      transfers: [
        { connection: "proxy-backend", direction: "reverse" },
        { connection: "browser-proxy", direction: "reverse" },
      ],
      payloadLabel: "Risposta HTTP simulata",
      payload: documentResponse,
    },
    {
      id: "browser-save",
      title: "Browser · salva il file",
      description: "Il browser scrive in Download i blocchi ricevuti. A trasferimento concluso Giulia ha una copia locale e lo storage conserva l’originale.",
      nodes: ["browser"],
      transfers: [],
      payloadLabel: "Download completato",
      payload: "Download/42.pdf · copia locale\nfiles/42.pdf · originale nello storage",
    },
  ],
};

export const stateDefinitions = {
  transit: {
    label: "Data in transit",
    title: "Dati in transito",
    description: "Informazioni trasmesse tra componenti. I collegamenti evidenziati rappresentano i percorsi possibili del documento e dei suoi metadati.",
  },
  rest: {
    label: "Data at rest",
    title: "Dati a riposo",
    description: "Dopo il download, Giulia può riaprire la copia sul disco. Seleziona un componente per scoprire dove restano il PDF, la sua scheda o una traccia della richiesta.",
  },
  use: {
    label: "Data in use",
    title: "Dati in uso",
    description: "Un dato è in uso mentre un componente lo legge o lo elabora. Seleziona un componente per seguire cosa fa con i byte o i metadati del file 42.",
  },
} as const;

export type DataState = keyof typeof stateDefinitions;

export const stateHighlights: Record<DataState, DataFlowHighlight> = {
  transit: {
    connections: ["browser-proxy", "proxy-backend", "backend-database", "backend-storage"],
  },
  rest: {
    nodes: ["browser", "database", "storage", "backup"],
    secondaryNodes: ["temp"],
  },
  use: {
    nodes: ["browser", "proxy", "backend", "database", "storage"],
  },
};

export const copyLocations = [
  { place: "Object storage", status: "presente", detail: "Contiene il file originale 42.pdf nello scenario." },
  { place: "Backup", status: "presente", detail: "Contiene una copia di ripristino del file e dei metadati." },
  { place: "Database", status: "derivata", detail: "Contiene metadati e riferimento al file: non è una copia del PDF." },
  { place: "Cache", status: "derivata", detail: "Se la scheda è in cache, Redis conserva temporaneamente i metadati del file 42." },
  { place: "File temporanei", status: "possibile", detail: "Potrebbero essere creati da specifiche elaborazioni, ma non sono necessari in ogni richiesta." },
  { place: "Dispositivo dell'utente", status: "presente", detail: "Giulia ha completato il download. Nella cartella Download resta una copia di 42.pdf." },
  { place: "Log", status: "derivata", detail: "Se il servizio registra il download, la voce contiene l’ID 42 e l’esito della richiesta." },
] as const;

export const copiesHighlight: DataFlowHighlight = {
  nodes: ["storage", "backup", "database", "browser"],
  secondaryNodes: ["cache", "temp", "logs"],
};

export const deletionQuestion =
  "Eliminare un record dal database significa necessariamente aver eliminato ogni copia dell'informazione?";

export const deletionAnswer =
  "No. Nel nostro scenario quel record contiene soprattutto metadati: il file può restare nell'object storage, nei backup, in eventuali copie temporanee o sul dispositivo se è stato scaricato. Una cancellazione completa richiede procedure coerenti con tutto il percorso e con i tempi di conservazione.";

export const trustBoundaryDefinition =
  "Un trust boundary, o confine di fiducia, separa componenti o ambienti con differenti livelli di fiducia, privilegi o responsabilità. Attraversarlo richiede una valutazione esplicita di identità, autorizzazioni e protezione dei dati.";

export const trustQuestion =
  "Se proteggo la comunicazione tra browser e reverse proxy, ho protetto automaticamente tutte le comunicazioni della mia applicazione?";

export const trustAnswer =
  "No. Nello scenario HTTPS termina sul reverse proxy: TLS protegge il tratto browser → proxy, ma non implica TLS tra proxy e backend. Ogni collegamento verso backend, database, cache o servizi esterni richiede una verifica specifica. I collegamenti interni non sono necessariamente insicuri: dipendono da configurazione e architettura.";

export const trustLegs = [
  {
    id: "browser-proxy",
    boundary: "client-service",
    question: "Fino a dove arriva la protezione HTTPS del browser?",
    answer:
      "Il browser verifica il certificato del servizio. TLS protegge richiesta e risposta su questo collegamento e termina al reverse proxy, che può leggere la richiesta per inoltrarla.",
  },
  {
    id: "proxy-backend",
    boundary: "gateway-application",
    question: "Chi protegge la richiesta dopo il proxy?",
    answer:
      "Il proxy apre o riusa un collegamento verso il backend. Verifica come il backend riconosce il proxy e se anche questo tratto usa TLS. Il lucchetto del browser riguarda la connessione esterna.",
  },
  {
    id: "backend-database",
    boundary: "application-data",
    question: "Quali record può leggere il backend?",
    answer:
      "Il database riceve una query con l’identità applicativa e restituisce i metadati del file. Verifica i privilegi di quell’identità, il filtro sul tenant e la protezione del collegamento.",
  },
  {
    id: "backend-cache",
    boundary: "application-data",
    question: "Chi può leggere le chiavi di Redis?",
    answer:
      "Il backend può memorizzare metadati temporanei nella cache. Verifica come Redis autentica il servizio, quali chiavi gli permette di leggere e come viene protetto il traffico.",
  },
  {
    id: "backend-storage",
    boundary: "application-data",
    question: "Chi può recuperare il PDF dallo storage?",
    answer:
      "Dopo aver autorizzato l’utente, il backend chiede allo storage i byte del file. Verifica la protezione del canale e quali oggetti può leggere l’identità tecnica del backend.",
  },
  {
    id: "database-backup",
    boundary: null,
    question: "Chi può copiare e ripristinare i metadati?",
    answer:
      "Il processo di backup copia i record del database. Verifica quali record può leggere, chi può accedere alla copia e chi è autorizzato al ripristino.",
  },
  {
    id: "storage-backup",
    boundary: null,
    question: "Quali permessi proteggono la copia del file?",
    answer:
      "Il backup può conservare il PDF anche dopo la cancellazione dell’originale. Verifica chi può leggere e ripristinare la copia e per quanto tempo viene conservata.",
  },
  {
    id: "backend-temp",
    boundary: null,
    question: "Chi può aprire un file temporaneo?",
    answer:
      "Se un’elaborazione scrive il file su disco, entra in gioco il controllo degli accessi alla directory. Verifica quali processi possono leggere quei byte e quando vengono rimossi.",
  },
  {
    id: "backend-logs",
    boundary: null,
    question: "Quali dati finiscono nei log e chi può vederli?",
    answer:
      "Il backend registra eventi e identificatori tecnici. Verifica i campi inviati, i permessi dei lettori e la conservazione dei log: anche un ID può rivelare quale file è stato aperto.",
  },
];

export const trustHighlight: DataFlowHighlight = {
  nodes: ["browser", "proxy", "backend"],
  connections: ["browser-proxy", "proxy-backend", "backend-database", "backend-cache"],
  boundaries: ["client-service", "gateway-application", "application-data"],
};

export const conclusionHighlight: DataFlowHighlight = {
  nodes: ["browser", "backend"],
  secondaryNodes: ["database", "cache", "storage", "backup", "temp", "logs"],
  connections: [
    "browser-proxy",
    "proxy-backend",
    "backend-database",
    "backend-cache",
    "backend-storage",
    "database-backup",
    "storage-backup",
    "backend-temp",
    "backend-logs",
  ],
  boundaries: ["client-service", "gateway-application", "application-data"],
};

export const conclusion =
  "Proteggere un'informazione significa considerare tutti i luoghi in cui viene conservata, elaborata e trasmessa.";

export const nextQuestion =
  "Ora sappiamo dove si trovano e dove viaggiano i dati. Ma in quali punti un attaccante potrebbe intercettarli, modificarli o sottrarli?";
