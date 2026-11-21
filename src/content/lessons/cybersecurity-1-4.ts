import type { DataFlowHighlight } from "@/components/data-flow/types";

export const attackSurfaceLesson = {
  title: "1.4 — Superfici di attacco e confini di fiducia",
  subtitle: "Da quale punto si può tentare di raggiungere il contratto 42?",
};

export const attackPerspectives = {
  device: { label: "Dispositivo utente", first: "browser" },
  network: { label: "Collegamento di rete", first: "network" },
  application: { label: "Ingresso e API", first: "backend" },
  copies: { label: "Archivi e copie", first: "cache" },
} as const;

export type PerspectiveId = keyof typeof attackPerspectives;

type Scenario = {
  perspective: PerspectiveId;
  label: string;
  start: string;
  focus: string;
  access: string;
  path: string;
  boundary: string;
  crossing: string;
  highlight: DataFlowHighlight;
  control: string;
  outcome: string;
  impact: string;
};

const browserProxy = { connection: "browser-proxy", direction: "forward" } as const;
const proxyBackend = { connection: "proxy-backend", direction: "forward" } as const;

export const surfaceScenarios = {
  browser: {
    perspective: "device",
    label: "Browser",
    start: "browser",
    focus: "browser",
    access:
      "Il contratto è già aperto su un portatile. Una persona davanti allo schermo cerca di leggerlo.",
    path: "Dispositivo condiviso → sessione locale",
    boundary: "Persona presente ↔ sessione del titolare",
    crossing:
      "Il contratto è già in chiaro nel browser. La persona davanti al portatile può vedere ciò che la sessione ha già scaricato se lo schermo rimane accessibile.",
    highlight: { nodes: ["browser"] },
    control:
      "Il blocco dello schermo richiede di sbloccare il dispositivo prima di tornare alla sessione.",
    outcome: "Sessione locale protetta",
    impact: "Uno schermo accessibile espone il testo aperto e può esporre le copie scaricate.",
  },
  network: {
    perspective: "network",
    label: "Tratto Browser → Proxy",
    start: "browser",
    focus: "proxy",
    access:
      "Il browser chiede il contratto. Una persona in grado di osservare il collegamento cerca di capire che cosa sta viaggiando.",
    path: "Browser → reverse proxy",
    boundary: "Utente ↔ servizio",
    crossing:
      "Richiesta e risposta attraversano la rete. TLS protegge il contenuto sul tratto fino al proxy, dove viene decifrato. Il collegamento successivo ha una protezione propria.",
    highlight: {
      nodes: ["browser", "proxy"],
      transfers: [browserProxy],
      boundaries: ["client-service"],
    },
    control:
      "HTTPS cifra il contenuto sul tratto osservato. Il browser verifica l’identità del servizio tramite il certificato. Sul tratto interno il controllo va ripetuto.",
    outcome: "Contenuto illeggibile sulla rete",
    impact:
      "Su un tratto HTTP in chiaro chi può osservare il traffico può leggere i dati che lo attraversano.",
  },
  proxy: {
    perspective: "application",
    label: "Reverse proxy",
    start: "browser",
    focus: "proxy",
    access:
      "Un client esterno prova a raggiungere un’interfaccia di amministrazione del gestionale dallo stesso ingresso pubblico usato per consultare il contratto.",
    path: "Browser → reverse proxy",
    boundary: "Utente ↔ servizio",
    crossing:
      "Il proxy riceve la richiesta prima del backend. Solo i percorsi destinati agli utenti devono essere inoltrati dall’ingresso pubblico.",
    highlight: {
      nodes: ["browser", "proxy"],
      transfers: [browserProxy],
      boundaries: ["client-service"],
    },
    control:
      "La configurazione dell’ingresso consente solo le rotte pubbliche. L’interfaccia amministrativa ha un ingresso separato e un controllo di autorizzazione.",
    outcome: "Richiesta fermata al proxy",
    impact: "Un’interfaccia interna resa pubblica diventa raggiungibile da una rete più ampia.",
  },
  backend: {
    perspective: "application",
    label: "Backend",
    start: "browser",
    focus: "backend",
    access:
      "Una persona entra con il proprio account di Beta e chiede il contratto 42, che appartiene ad Alfa.",
    path: "Browser → reverse proxy → backend",
    boundary: "Utente ↔ servizio · Ingresso ↔ applicazione",
    crossing:
      "Il proxy inoltra la richiesta. Il backend riconosce l’identità di Beta e controlla se quella persona può leggere proprio il contratto 42.",
    highlight: {
      nodes: ["browser", "proxy", "backend"],
      transfers: [browserProxy, proxyBackend],
      boundaries: ["client-service", "gateway-application"],
    },
    control:
      "Il backend verifica il permesso sul singolo documento e sulla relativa organizzazione prima di restituire il file.",
    outcome: "L’API rifiuta la richiesta",
    impact: "Un utente autenticato potrebbe vedere documenti di un’altra organizzazione.",
  },
  cache: {
    perspective: "copies",
    label: "Cache Redis",
    start: "backend",
    focus: "cache",
    access:
      "Una persona ha già accesso a un servizio interno di diagnostica. Cerca di leggere i metadati temporanei del contratto 42, ma usa un ruolo che non prevede la lettura della cache.",
    path: "Rete applicativa → Cache Redis",
    boundary: "Applicazione ↔ dati",
    crossing:
      "Il collegamento usato dai servizi applicativi arriva a Redis. Qui conta l’identità del servizio che chiede la lettura. La cache di questo esempio può tenere metadati temporanei e il PDF è nello storage.",
    highlight: {
      nodes: ["backend", "cache"],
      transfers: [{ connection: "backend-cache", direction: "forward" }],
      boundaries: ["application-data"],
    },
    control:
      "La rete limita quali servizi possono connettersi. Quando la richiesta arriva, Redis verifica le operazioni e le voci consentite a quell’identità. Il ruolo di diagnostica non può leggere la voce.",
    outcome: "Accesso a Redis negato",
    impact:
      "Un’identità interna con permessi troppo ampi potrebbe leggere anche informazioni conservate per poco tempo.",
  },
  database: {
    perspective: "copies",
    label: "Database",
    start: "backend",
    focus: "database",
    access:
      "Un servizio che produce statistiche aggregate chiede la riga completa del contratto 42.",
    path: "Servizio applicativo → database",
    boundary: "Applicazione ↔ dati",
    crossing:
      "Il database riceve una richiesta con l’identità del servizio di reportistica. La riga contiene i metadati del contratto e il riferimento al PDF.",
    highlight: {
      nodes: ["backend", "database"],
      transfers: [{ connection: "backend-database", direction: "forward" }],
      boundaries: ["application-data"],
    },
    control: "Il ruolo di reportistica può leggere solo le viste aggregate che gli servono.",
    outcome: "Lettura della riga negata",
    impact: "Una lettura troppo ampia espone dati come l’organizzazione e il riferimento al file.",
  },
  storage: {
    perspective: "copies",
    label: "Object storage",
    start: "backend",
    focus: "storage",
    access: "Un servizio autorizzato a leggere gli allegati di Beta chiede il PDF di Alfa.",
    path: "Servizio applicativo → object storage",
    boundary: "Applicazione ↔ dati",
    crossing:
      "Il servizio presenta la propria identità allo storage. Qui si trova il contenuto del file 42.pdf e la decisione riguarda il permesso su quell’oggetto.",
    highlight: {
      nodes: ["backend", "storage"],
      transfers: [{ connection: "backend-storage", direction: "forward" }],
      boundaries: ["application-data"],
    },
    control: "La policy dello storage consente a quell’identità solo gli oggetti di Beta.",
    outcome: "Download del PDF negato",
    impact: "Un permesso più ampio potrebbe esporre il documento completo.",
  },
  backup: {
    perspective: "copies",
    label: "Backup",
    start: "storage",
    focus: "backup",
    access:
      "Un operatore dello storage corrente vuole leggere una versione precedente del contratto dall’archivio di ripristino.",
    path: "Storage e database → copie di ripristino",
    boundary: "Archivi operativi ↔ ambiente di ripristino",
    crossing:
      "La mappa mostra come file e metadati finiscono nel backup. Per leggere quella nuova copia serve poi l’accesso all’ambiente di ripristino.",
    highlight: {
      nodes: ["database", "storage", "backup"],
      transfers: [
        { connection: "database-backup", direction: "forward" },
        { connection: "storage-backup", direction: "forward" },
      ],
    },
    control: "L’accesso al backup è riservato a un ruolo di ripristino con permessi propri.",
    outcome: "Accesso al backup negato",
    impact: "Una copia storica può conservare dati anche dopo la rimozione dagli archivi correnti.",
  },
  logs: {
    perspective: "copies",
    label: "Sistemi di logging",
    start: "backend",
    focus: "logs",
    access:
      "Una persona autorizzata alla diagnostica cerca un evento relativo al contratto 42 e vorrebbe leggere anche il suo contenuto.",
    path: "Backend → sistemi di logging",
    boundary: "Elaborazione del contratto ↔ consultazione dei log",
    crossing:
      "Il backend registra un evento tecnico consultabile da un ruolo diverso da quello che accede al contratto.",
    highlight: {
      nodes: ["backend", "logs"],
      transfers: [{ connection: "backend-logs", direction: "forward" }],
    },
    control: "L’applicazione registra solo l’ID e i dati tecnici necessari alla diagnosi.",
    outcome: "Il log contiene solo l’evento tecnico",
    impact:
      "Se il contenuto finisse nei log, sarebbe visibile a chi può fare diagnostica e resterebbe disponibile secondo i tempi di conservazione dei log.",
  },
  temp: {
    perspective: "copies",
    label: "File temporanei",
    start: "backend",
    focus: "temp",
    access:
      "Un processo che condivide lo stesso ambiente cerca il file di lavoro usato per generare un’anteprima.",
    path: "Backend → spazio di lavoro temporaneo",
    boundary: "Processo che genera l’anteprima ↔ altri processi",
    crossing:
      "La generazione di un’anteprima può creare una copia temporanea. La copia resta sotto i permessi del processo che l’ha creata.",
    highlight: {
      nodes: ["backend", "temp"],
      transfers: [{ connection: "backend-temp", direction: "forward" }],
    },
    control:
      "Lo spazio di lavoro è privato al processo autorizzato. La copia viene rimossa a fine elaborazione.",
    outcome: "Copia temporanea inaccessibile",
    impact:
      "Una cartella condivisa senza limiti può esporre copie che l’utente crede esistano solo nell’archivio principale.",
  },
} as const satisfies Record<string, Scenario>;

export type ScenarioId = keyof typeof surfaceScenarios;
