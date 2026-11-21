export const viewpoints = {
  visitor: "Visitatore",
  user: "Giulia con sessione",
  service: "Servizio backend",
} as const;
export type Viewpoint = keyof typeof viewpoints;
export const layers = ["Rete pubblica", "Funzioni web", "Servizi interni"] as const;

type Surface = {
  label: string;
  layer: number;
  input: string;
  receiver: string;
  boundary: string;
  observation: Record<Viewpoint, string>;
};

export const surfaces = {
  edge: {
    label: "Ingresso HTTPS",
    layer: 0,
    input: "Connessione a files.example:443",
    receiver: "Reverse proxy",
    boundary: "Internet → ingresso pubblico",
    observation: {
      visitor:
        "Dal browser puoi aprire una connessione al proxy. Una volta stabilita la connessione TLS sulla porta 443, puoi inviare la richiesta HTTP.",
      user: "Giulia usa la stessa porta del visitatore. Il proxy accetta la connessione prima che l’applicazione esamini la sessione.",
      service:
        "Il backend riceve le richieste già inoltrate dal proxy. Per recuperare un file usa la rete interna.",
    },
  },
  login: {
    label: "Login",
    layer: 1,
    input: "POST /login · credenziali",
    receiver: "Gestore del login",
    boundary: "Input del client → verifica dell’identità",
    observation: {
      visitor:
        "Chiunque può presentare credenziali. Il gestore apre una sessione soltanto dopo averne verificato la validità.",
      user: "Giulia ha già una sessione. La funzione di login resta pubblica anche quando lei è collegata.",
      service:
        "Il servizio riceve un’identità tecnica dalla configurazione dell’applicazione. Il login web serve agli utenti.",
    },
  },
  read: {
    label: "Apri file",
    layer: 1,
    input: "GET /api/documents/42 · ID del file",
    receiver: "Endpoint di lettura",
    boundary: "Richiesta dell’utente → permesso sul file",
    observation: {
      visitor:
        "Puoi inviare il numero 42. In questo gestionale serve una sessione valida prima che il backend esamini il permesso di lettura.",
      user: "La sessione identifica Giulia. L’applicazione deve ancora verificare se Giulia può leggere proprio il file 42.",
      service:
        "Il backend esegue l’operazione per conto di Giulia. Il permesso della persona va verificato prima di usare le credenziali dello storage.",
    },
  },
  upload: {
    label: "Carica file",
    layer: 1,
    input: "POST /api/documents · nome e byte del file",
    receiver: "Endpoint di caricamento",
    boundary: "Contenuto inviato dal browser → archivio gestito",
    observation: {
      visitor:
        "Il nuovo ingresso accetta richieste sulla stessa porta 443. Questo gestionale richiede una sessione per caricare un file.",
      user: "Giulia presenta nome e contenuto. Il gestore verifica permesso di scrittura, dimensione e tipo ammesso prima di archiviare i byte.",
      service:
        "Il backend gestisce adesso dati forniti dall’esterno e può chiedere allo storage di creare un oggetto.",
    },
  },
  redis: {
    label: "Cache Redis",
    layer: 2,
    input: "Lettura della chiave file:42:meta",
    receiver: "Interfaccia privata della cache",
    boundary: "Processo applicativo → servizio dati",
    observation: {
      visitor:
        "Da Internet puoi interrogare la webapp. In questa architettura la rete privata della cache è raggiungibile solo dai servizi abilitati.",
      user: "Il cookie di Giulia è valido per la webapp. Anche quando apre il file, la chiamata a Redis parte dal backend con un’altra identità.",
      service:
        "Il servizio raggiunge Redis sulla rete privata. I permessi associati alla sua identità limitano le chiavi che può leggere. Qui la cache contiene metadati del file.",
    },
  },
  storage: {
    label: "Storage del file",
    layer: 2,
    input: "Lettura dell’oggetto files/42.pdf",
    receiver: "API privata dello storage",
    boundary: "Identità del backend → permesso sull’oggetto",
    observation: {
      visitor:
        "Il visitatore può raggiungere l’ingresso web. Lo storage dell’esempio accetta letture dalla rete privata.",
      user: "Giulia chiede il file alla webapp. È il backend che, dopo il controllo sul file, apre l’oggetto per lei.",
      service:
        "Lo storage riceve una richiesta firmata con l’identità del servizio, verifica il permesso sull’oggetto e restituisce i byte del PDF.",
    },
  },
} satisfies Record<string, Surface>;

export type SurfaceId = keyof typeof surfaces;
