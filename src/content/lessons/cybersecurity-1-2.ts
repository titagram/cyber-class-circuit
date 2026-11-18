export const lesson = {
  id: "cybersecurity-1-2",
  title: "1.2 — Che cosa significa proteggere un'informazione?",
  subtitle:
    "Riservatezza, integrità, disponibilità e autenticità applicate a un documento del gestionale SaaS.",
  duration: "10–12 minuti",
  openingQuestion:
    "Se nessuno può leggere un documento riservato, significa necessariamente che quel documento è sicuro?",
  openingText:
    "Riprendiamo il gestionale SaaS multi-tenant e osserviamo un singolo documento. Per capire se è davvero protetto dobbiamo considerare proprietà diverse, non soltanto chi può leggerlo.",
  scenario:
    "Il contratto appartiene al tenant di Azienda Alfa S.r.l. ed è conservato nell'archivio documentale dello stesso gestionale SaaS visto nella slide precedente.",
} as const;

export const moments = [
  { value: "domanda", label: "1 · La domanda" },
  { value: "incidenti", label: "2 · Gli incidenti" },
  { value: "proprieta", label: "3 · Le contromisure" },
  { value: "confronto", label: "4 · Il confronto" },
] as const;

export type Moment = (typeof moments)[number]["value"];

export const contract = {
  title: "Contratto di fornitura",
  customer: "Azienda Alfa S.r.l.",
  supplier: "Azienda Beta S.p.A.",
  amount: "€ 125.000",
  alteredAmount: "€ 925.000",
  status: "Approvato",
  signer: "Mario Rossi",
  classification: "Riservato",
  fictionalNotice: "Documento simulato · Tutti i dati sono fittizi",
} as const;

export type PropertyId = "riservatezza" | "integrita" | "disponibilita" | "autenticita";
export type PropertyStatus = "compromessa" | "non-compromessa" | "non-determinabile";

export const statusLabels: Record<PropertyStatus, string> = {
  compromessa: "Compromessa",
  "non-compromessa": "Non compromessa",
  "non-determinabile": "Non determinabile",
};

export const properties: readonly {
  id: PropertyId;
  name: string;
  english: string;
  definition: string;
  inCiaTriad: boolean;
}[] = [
  {
    id: "riservatezza",
    name: "Riservatezza",
    english: "Confidentiality",
    definition: "Le informazioni devono essere accessibili soltanto ai soggetti autorizzati.",
    inCiaTriad: true,
  },
  {
    id: "integrita",
    name: "Integrità",
    english: "Integrity",
    definition:
      "I dati devono essere protetti da modifiche non autorizzate; quando necessario, tali modifiche devono poter essere rilevate.",
    inCiaTriad: true,
  },
  {
    id: "disponibilita",
    name: "Disponibilità",
    english: "Availability",
    definition:
      "Informazioni e servizi devono essere accessibili ai soggetti autorizzati quando necessario.",
    inCiaTriad: true,
  },
  {
    id: "autenticita",
    name: "Autenticità",
    english: "Authenticity",
    definition:
      "Capacità di verificare che un'entità, una comunicazione o un'informazione provengano realmente dalla fonte dichiarata.",
    inCiaTriad: false,
  },
];

export type PropertyState = {
  status: PropertyStatus;
  reason: string;
};

export type IncidentId = "A" | "B" | "C" | "D";
export type ScenarioId = "originale" | IncidentId;

export type Incident = {
  id: IncidentId;
  title: string;
  event: string;
  changed: string;
  consequence: string;
  controls: readonly string[];
  states: Record<PropertyId, PropertyState>;
};

export const originalStates: Record<PropertyId, PropertyState> = {
  riservatezza: {
    status: "non-compromessa",
    reason: "Il documento è accessibile soltanto ai soggetti autorizzati del tenant.",
  },
  integrita: {
    status: "non-compromessa",
    reason: "L'importo e gli altri contenuti corrispondono alla versione approvata.",
  },
  disponibilita: {
    status: "non-compromessa",
    reason: "Il documento è consultabile nell'archivio quando serve.",
  },
  autenticita: {
    status: "non-determinabile",
    reason: "Il documento riporta un firmatario dichiarato, ma senza una verifica non possiamo confermarne la provenienza.",
  },
};

export const incidents: readonly Incident[] = [
  {
    id: "A",
    title: "Violazione della riservatezza",
    event: "Un soggetto non autorizzato ottiene una copia del documento.",
    changed:
      "Esiste una copia nelle mani di un soggetto esterno. Il documento originale può essere rimasto integro e disponibile.",
    consequence:
      "Un concorrente potrebbe conoscere dettagli economici e commerciali riservati.",
    controls: ["Crittografia", "Controllo degli accessi"],
    states: {
      riservatezza: {
        status: "compromessa",
        reason: "Un soggetto esterno non autorizzato possiede una copia del contratto.",
      },
      integrita: {
        status: "non-compromessa",
        reason: "La lettura e la copia non modificano il contenuto del documento originale.",
      },
      disponibilita: {
        status: "non-compromessa",
        reason: "Gli utenti autorizzati possono ancora consultare l'originale.",
      },
      autenticita: {
        status: "non-determinabile",
        reason: "La sottrazione di una copia non fornisce elementi sulla verifica della provenienza.",
      },
    },
  },
  {
    id: "B",
    title: "Violazione dell'integrità",
    event: "Un attaccante modifica senza autorizzazione il documento.",
    changed:
      "L'importo passa da € 125.000 a € 925.000: il contenuto è stato alterato, non semplicemente letto.",
    consequence:
      "Un documento alterato potrebbe determinare decisioni economiche scorrette.",
    controls: [
      "Meccanismi crittografici di verifica dell'integrità",
      "MAC e firme digitali",
      "Controlli applicativi",
    ],
    states: {
      riservatezza: {
        status: "non-determinabile",
        reason: "La modifica non dimostra che l'attaccante abbia anche letto o diffuso il documento.",
      },
      integrita: {
        status: "compromessa",
        reason: "L'importo approvato è stato modificato senza autorizzazione.",
      },
      disponibilita: {
        status: "non-compromessa",
        reason: "Il documento alterato resta accessibile agli utenti autorizzati.",
      },
      autenticita: {
        status: "non-determinabile",
        reason: "I fatti descritti non chiariscono se sia stata verificata la provenienza dichiarata.",
      },
    },
  },
  {
    id: "C",
    title: "Violazione della disponibilità",
    event: "Un attacco ransomware rende inaccessibile l'archivio documentale.",
    changed:
      "Il contratto non è più consultabile. Può essere ancora riservato e integro, ma risulta inutilizzabile.",
    consequence:
      "L'azienda non può consultare documenti indispensabili per la propria attività.",
    controls: [
      "Ridondanza",
      "Backup e procedure di ripristino",
      "Protezioni contro interruzioni e attacchi alla disponibilità",
    ],
    states: {
      riservatezza: {
        status: "non-compromessa",
        reason: "L'episodio descrive un blocco dell'accesso, non una diffusione a soggetti esterni.",
      },
      integrita: {
        status: "non-compromessa",
        reason: "Il contenuto del contratto non risulta alterato; è l'archivio a essere inaccessibile.",
      },
      disponibilita: {
        status: "compromessa",
        reason: "Gli utenti autorizzati non possono accedere al documento quando ne hanno bisogno.",
      },
      autenticita: {
        status: "non-determinabile",
        reason: "L'indisponibilità non fornisce elementi sulla provenienza del documento.",
      },
    },
  },
  {
    id: "D",
    title: "Violazione dell'autenticità",
    event:
      "Un soggetto produce un documento che sembra provenire da Mario Rossi senza essere stato effettivamente approvato da lui.",
    changed:
      "La provenienza dichiarata è Mario Rossi, ma la verifica mostra che il documento non è stato approvato da lui.",
    consequence:
      "Un'azienda potrebbe fidarsi di un documento o di una comunicazione attribuiti falsamente a un soggetto autorizzato.",
    controls: [
      "Autenticazione",
      "MAC quando è disponibile un segreto condiviso",
      "Firme digitali e certificati nei contesti appropriati",
    ],
    states: {
      riservatezza: {
        status: "non-determinabile",
        reason: "La falsificazione della provenienza non indica se il documento sia stato letto da estranei.",
      },
      integrita: {
        status: "non-determinabile",
        reason: "Non è descritta una modifica di un originale: il problema è la fonte falsamente attribuita.",
      },
      disponibilita: {
        status: "non-compromessa",
        reason: "Il documento falsamente attribuito resta consultabile.",
      },
      autenticita: {
        status: "compromessa",
        reason: "La provenienza effettivamente verificata non corrisponde a quella dichiarata.",
      },
    },
  },
];

export const simulatorNote =
  "Uno stesso attacco può compromettere più proprietà contemporaneamente. Segniamo come compromesse soltanto quelle supportate dai fatti; quando gli elementi non bastano, lo stato è «Non determinabile».";

export const countermeasures: Record<PropertyId, readonly string[]> = {
  riservatezza: ["Crittografia", "Controllo degli accessi"],
  integrita: [
    "Meccanismi crittografici di verifica dell'integrità",
    "MAC e firme digitali",
    "Controlli applicativi",
  ],
  disponibilita: [
    "Ridondanza",
    "Backup e procedure di ripristino",
    "Protezioni contro interruzioni e attacchi alla disponibilità",
  ],
  autenticita: [
    "Autenticazione",
    "MAC quando è disponibile un segreto condiviso",
    "Firme digitali e certificati nei contesti appropriati",
  ],
};

export const precautions = [
  "La cifratura non garantisce automaticamente l'integrità: dipende dallo schema crittografico utilizzato.",
  "Un hash non autenticato, da solo, non protegge contro un attaccante che può sostituire sia il documento sia il suo hash.",
  "La crittografia non garantisce la disponibilità del sistema.",
] as const;

export const authenticityNote =
  "Autenticità non significa autorizzazione: verificare l'identità di un soggetto non implica che possieda ogni permesso.";

export const countermeasuresNote =
  "Queste associazioni sono soltanto introduttive. Algoritmi crittografici, firme digitali e TLS saranno affrontati nelle lezioni successive.";

export const conclusion =
  "La sicurezza non coincide con la segretezza. Un'informazione deve essere protetta anche dalle alterazioni, dall'indisponibilità e dalla falsificazione della sua provenienza.";

export const nextQuestion =
  "Ora sappiamo quali proprietà proteggere. Ma dove si trovano realmente i dati e quali percorsi attraversano all'interno di un'applicazione?";
