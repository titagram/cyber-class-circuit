import type { DataFlowHighlight } from "@/components/data-flow/types";

export const attackSurfaceLesson = {
  title: "1.4 — Superfici di attacco e confini di fiducia",
  subtitle:
    "Esplora i punti in cui il sistema riceve dati, concede accesso o conserva il contratto.",
};

type Perspective = {
  label: string;
  highlight: DataFlowHighlight;
  focusNodeId: string;
  access: string;
  impact: string;
  control: string;
};

export const attackPerspectives = {
  device: {
    label: "Dispositivo utente",
    focusNodeId: "browser",
    highlight: { nodes: ["browser"] },
    access: "Il contratto è già aperto su un dispositivo a cui può accedere un'altra persona.",
    impact:
      "Il contenuto visibile a schermo e le eventuali copie scaricate possono essere esposti.",
    control:
      "Bloccare il dispositivo e controllare accesso, conservazione e download delle copie locali.",
  },
  network: {
    label: "Collegamento di rete",
    focusNodeId: "proxy",
    highlight: {
      connections: ["browser-proxy", "proxy-backend"],
      boundaries: ["client-service", "gateway-application"],
    },
    access:
      "Un osservatore può vedere il traffico su uno dei collegamenti. Il reverse proxy separa il collegamento esterno da quello interno.",
    impact:
      "Con HTTP in chiaro su un tratto, chi può osservare quel traffico può leggere il contenuto che lo attraversa.",
    control:
      "Verificare TLS su ciascun collegamento e l'identità del servizio remoto tramite i suoi certificati.",
  },
  application: {
    label: "Ingresso e API",
    focusNodeId: "backend",
    highlight: {
      nodes: ["proxy", "backend"],
      connections: ["proxy-backend"],
      boundaries: ["gateway-application"],
    },
    access: "L'API riceve una richiesta per il documento 42 da un utente autenticato.",
    impact:
      "Un controllo incompleto può esporre il contratto a un utente privo dell'autorizzazione, anche quando la richiesta viaggia su HTTPS.",
    control:
      "Verificare lato backend, a ogni richiesta, i permessi dell'utente sul singolo documento e sul relativo tenant.",
  },
  copies: {
    label: "Archivi e copie",
    focusNodeId: "storage",
    highlight: {
      nodes: ["database", "storage", "backup", "logs"],
      boundaries: ["application-data"],
    },
    access:
      "Un'identità di servizio ha accesso ai sistemi che custodiscono metadati, file, backup o log.",
    impact:
      "Permessi eccessivi possono esporre il PDF e i metadati. Privilegi di scrittura o cancellazione possono anche rendere il contratto alterato o indisponibile.",
    control:
      "Limitare i privilegi di ciascuna identità, separare l'accesso ai backup e registrare soltanto i dati necessari nei log.",
  },
} satisfies Record<string, Perspective>;

export type PerspectiveId = keyof typeof attackPerspectives;
