import type {
  ArchitectureLevel,
  DataFlowConfig,
  DataFlowHighlight,
} from "@/components/data-flow/types";

export const lesson = {
  id: "cybersecurity-1-3",
  title: "1.3 — Il viaggio di un'informazione",
  subtitle: "Dove si trovano, come vengono elaborati e quali percorsi attraversano i dati.",
  duration: "12–15 minuti",
  openingQuestion:
    "Quando apriamo un documento riservato in un'applicazione web, dove si trova quel documento e quali componenti attraversa prima di arrivare sul nostro schermo?",
  openingText:
    "Non serve indovinare subito l'intera architettura. Partiamo dal contratto e costruiamo il suo percorso un livello alla volta.",
  scenario:
    "Il gestionale SaaS multi-tenant consente a utenti di aziende diverse di consultare soltanto i documenti per cui possiedono un'autorizzazione. Tutti i dati di questa simulazione sono fittizi.",
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
  fileReference: "tenant-alfa/contracts/42.pdf",
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
  "GET /api/documents/42 HTTP/1.1\nHost: gestionale.example\nCookie: session=demo-session-id";

export const documentResponse =
  "HTTP/1.1 200 OK\nCache-Control: no-store\nContent-Type: application/pdf\nContent-Disposition: inline; filename=contratto-42.pdf\n\n[contenuto simulato del documento]";

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
      description: "Il dispositivo dell'utente presenta l'interfaccia e carica il documento per visualizzarlo.",
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
      description: "La cache può velocizzare letture frequenti. Nel nostro scenario non conserva il contenuto del contratto.",
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
      description: "L'utente seleziona «Visualizza documento». Il browser prepara la richiesta HTTP per il contratto 42.",
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
      id: "backend-authorize",
      title: "Backend · identifica e autorizza",
      description: "Il backend associa la sessione a un utente e verifica che l’utente sia autorizzato ad accedere al documento 42 nel suo tenant prima di recuperare il file.",
      nodes: ["backend"],
      transfers: [],
      payloadLabel: "Verifica applicativa simulata",
      payload: "session=demo-session-id → utente demo\ntenant: Azienda Alfa S.r.l.\ndocumento 42: accesso autorizzato",
    },
    {
      id: "database-metadata",
      title: "Database · restituisce i metadati",
      description: "Il backend interroga il database e recupera classificazione, tenant e riferimento al file nello storage.",
      nodes: ["backend", "database"],
      transfers: [{ connection: "backend-database", direction: "reverse" }],
      payloadLabel: "Metadati del documento",
      payload: "id: 42\ntenant: Azienda Alfa S.r.l.\ntitolo: Contratto di fornitura\nclassificazione: Riservato\nfile: tenant-alfa/contracts/42.pdf",
    },
    {
      id: "storage-content",
      title: "Object storage · restituisce il file",
      description: "Con il riferimento ottenuto dal database, il backend recupera il contenuto del documento dall'object storage.",
      nodes: ["backend", "storage"],
      transfers: [{ connection: "backend-storage", direction: "reverse" }],
      payloadLabel: "Contenuto recuperato",
      payload: "tenant-alfa/contracts/42.pdf\n→ contenuto del contratto disponibile nella memoria del backend",
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
      id: "browser-render",
      title: "Browser · visualizza il documento",
      description: "Il browser riceve i dati e carica il contratto per la visualizzazione. Ora il contenuto è anche in uso sul dispositivo.",
      nodes: ["browser"],
      transfers: [],
      payloadLabel: "Documento visualizzato",
      payload: "Contratto di fornitura — ID 42\nCliente: Azienda Alfa S.r.l.\nFornitore: Azienda Beta S.p.A.\nImporto: € 125.000\nClassificazione: Riservato",
    },
  ],
};

export const stateDefinitions = {
  transit: {
    label: "Data in transit",
    title: "Dati in transito",
    description: "Informazioni trasmesse tra componenti. I collegamenti evidenziati rappresentano i percorsi possibili del documento e dei suoi metadati.",
    examples: ["Browser → Reverse proxy", "Reverse proxy → Backend", "Backend → Database", "Backend → Object storage"],
  },
  rest: {
    label: "Data at rest",
    title: "Dati a riposo",
    description: "Informazioni conservate su supporti di memorizzazione. Nel nostro scenario il file è nello storage e nel backup; il database contiene i suoi metadati.",
    examples: ["Record e metadati nel database", "Documento nell'object storage", "Copie di backup", "Eventuali file persistenti o temporanei su disco"],
  },
  use: {
    label: "Data in use",
    title: "Dati in uso",
    description: "Informazioni durante l'elaborazione. Essere presenti in memoria non significa essere necessariamente salvati in modo persistente.",
    examples: ["Documento nella memoria del backend durante la richiesta", "Dati elaborati dal runtime applicativo", "Contenuto caricato dal browser per la visualizzazione"],
  },
} as const;

export type DataState = keyof typeof stateDefinitions;

export const stateHighlights: Record<DataState, DataFlowHighlight> = {
  transit: {
    connections: ["browser-proxy", "proxy-backend", "backend-database", "backend-storage"],
  },
  rest: {
    nodes: ["database", "storage", "backup"],
    secondaryNodes: ["temp"],
  },
  use: {
    nodes: ["backend", "browser"],
  },
};

export const stateMessage =
  "Un'informazione può attraversare diversi stati durante il proprio ciclo di vita. Le misure di protezione devono essere valutate in relazione al contesto e alle modalità con cui il dato viene trattato.";

export const copyLocations = [
  { place: "Object storage", status: "presente", detail: "Contiene il file originale 42.pdf nello scenario." },
  { place: "Backup", status: "presente", detail: "Contiene una copia di ripristino del file e dei metadati." },
  { place: "Database", status: "derivata", detail: "Contiene metadati e riferimento al file: non è una copia del PDF." },
  { place: "Cache", status: "possibile", detail: "Potrebbe contenerne il contenuto soltanto se configurata per conservarlo; qui non lo fa." },
  { place: "File temporanei", status: "possibile", detail: "Potrebbero essere creati da specifiche elaborazioni, ma non sono necessari in ogni richiesta." },
  { place: "Dispositivo dell'utente", status: "possibile", detail: "Una copia persistente nasce se il documento viene scaricato." },
  { place: "Log", status: "possibile", detail: "Una registrazione impropria potrebbe includere dati sensibili; i log non contengono necessariamente l'intero file." },
] as const;

export const copiesHighlight: DataFlowHighlight = {
  nodes: ["storage", "backup", "database"],
  secondaryNodes: ["cache", "temp", "browser", "logs"],
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
