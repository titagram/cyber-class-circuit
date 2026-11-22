import { readCases, readRequest } from "./cybersecurity-1-4";

export const scenes = [
  {
    name: "Visitatore",
    intro:
      "Giulia visita il portale per la prima volta. Cerca 42.pdf nel catalogo pubblico, poi prova a scaricarlo prima di accedere.",
  },
  {
    name: "Giulia con sessione",
    intro:
      "Qui il browser ha una sessione valida di Giulia. Prova la stessa lettura con e senza permesso, poi osserva cosa succede quando Giulia scrive o condivide.",
  },
  {
    name: "Altri attori esterni",
    intro:
      "Un collega riceve un link, un programma usa l’API e un operatore entra dalla console. Ognuno presenta al servizio una prova diversa della propria autorizzazione.",
  },
] as const;

export const actions = {
  home: "Visita la home",
  catalog: "Apri il catalogo",
  language: "Cambia lingua",
  search: "Cerca nel catalogo",
  visitor: "Scarica senza sessione",
  login: "Accedi come Giulia",
  read: "Scarica 42.pdf",
  upload: "Carica una nuova versione",
  preview: "Genera anteprima",
  share: "Crea un link",
  revoke: "Revoca il link",
  colleague: "Apri il link come collega",
  api: "Scarica tramite API",
  restore: "Ripristina dal backup",
} as const;

export type Action = keyof typeof actions;
export type Scene = 0 | 1 | 2;
export const sceneActions = [
  ["home", "catalog", "language", "search", "visitor", "login"],
  ["read", "upload", "preview", "share", "revoke"],
  ["colleague", "api", "restore"],
] as const satisfies readonly (readonly Action[])[];

// Each path names the public entry, then (if reached) the application and its private services.
type Path = readonly [string, string?, string?];
export type SharedLink = { event: "created" | "downloaded" | "revoked" | "refused"; url: string };
type Exchange = {
  sharedLink?: SharedLink;
  action: Action;
  actor: string;
  request: string;
  responder: string;
  response: string;
  effect: string;
  path: Path;
  readCase?: keyof typeof readCases;
};
const guest = "Giulia dal browser, senza sessione";
const signed = "Giulia dal browser, con sessione";
const cookie = "\nCookie: session=giulia-demo";
const pdf = (version: number) => `200 OK · application/pdf · versione ${version}`;

export const initialPortal = {
  version: 1,
  lastVersion: 1,
  english: false,
  // A previously issued example lets the third scene run independently.
  link: 1,
  revoked: false,
  failures: 0,
};
export type Portal = typeof initialPortal;
export type Inputs = { term: string; allowed: boolean; validCredentials: boolean };
export const initialInputs: Inputs = { term: "42.pdf", allowed: false, validCredentials: true };

export function perform(action: Action, portal: Portal, inputs: Inputs) {
  function result(
    actor: string,
    request: string,
    responder: string,
    response: string,
    effect: string,
    path: Path,
    changes: Partial<Portal> = {},
  ): { trace: Exchange; portal: Portal } {
    const next = { ...portal, ...changes };
    const trace: Exchange = { action, actor, request, responder, response, effect, path };
    if (action === "share" || action === "revoke" || action === "colleague") {
      const event =
        action === "colleague"
          ? next.revoked
            ? "refused"
            : "downloaded"
          : action === "share"
            ? "created"
            : "revoked";
      trace.sharedLink = { event, url: `/s/demo-${next.link}` };
    }
    return { trace, portal: next };
  }
  switch (action) {
    case "home":
      return result(
        guest,
        "GET /",
        "Il server web serve la pagina iniziale.",
        "200 OK · text/html",
        "Il browser disegna la home. Il collegamento al catalogo permette a Giulia di chiedere l’elenco dei file.",
        ["Home"],
      );
    case "catalog":
      return result(
        guest,
        "GET /documenti",
        "Il gestore del catalogo compone la pagina con le schede pubbliche.",
        "200 OK · text/html · 42.pdf",
        "Giulia vede il nome del file e il pulsante di download. Per ottenere i byte il browser deve fare una seconda richiesta.",
        ["Catalogo", "Elenco pubblico", "Metadati"],
      );
    case "language": {
      const language = portal.english ? "it" : "en";
      return result(
        guest,
        `GET /locales/${language}.json`,
        "Il server web serve il dizionario scelto fra le due lingue del portale.",
        "200 OK · application/json",
        portal.english
          ? "Il browser legge il dizionario italiano. Il comando «Download» diventa «Scarica»."
          : "Il browser legge il dizionario inglese. Il comando «Scarica» diventa «Download».",
        ["Dizionario pubblico"],
        { english: !portal.english },
      );
    }
    case "search": {
      const term = inputs.term.trim();
      const found = "42.pdf bilancio annuale".includes(term.toLowerCase());
      return result(
        guest,
        "GET /api/search?q=" + encodeURIComponent(term),
        "Il servizio di ricerca confronta il termine con i metadati pubblici.",
        "200 OK · application/json",
        found
          ? "Nei risultati compare la scheda di 42.pdf. Il browser ha ricevuto nome e ID del file."
          : "Il browser mostra un elenco vuoto perché nessuna scheda corrisponde al termine.",
        ["Ricerca", "Ricerca pubblica", "Metadati"],
      );
    }
    case "visitor":
    case "read": {
      const kind = action === "visitor" ? "visitor" : inputs.allowed ? "allowed" : "denied";
      const read = readCases[kind];
      const exchange = result(
        action === "visitor" ? guest : signed,
        readRequest + (action === "visitor" ? "" : cookie),
        kind === "allowed"
          ? "Il backend autorizza Giulia, legge il PDF dallo storage e risponde tramite il proxy."
          : read.title,
        kind === "allowed" ? pdf(portal.version) : read.status,
        read.why,
        kind === "visitor"
          ? ["Download", "Sessione"]
          : ["Download", "Autorizzazione", kind === "allowed" ? "Metadati e storage" : "Metadati"],
      );
      exchange.trace.readCase = kind;
      return exchange;
    }
    case "login": {
      const request = "POST /login\nAccount: Giulia · password dimostrativa";
      const path: Path = ["Login", "Autenticazione"];
      if (portal.failures >= 3)
        return result(
          guest,
          request,
          "Il gestore del login applica l’attesa prevista.",
          "429 Too Many Requests · Retry-After: 60",
          "La sessione resta assente. Fai avanzare l’orologio della simulazione di un minuto per riprovare.",
          path,
        );
      if (!inputs.validCredentials)
        return result(
          guest,
          request,
          "Il gestore del login verifica le credenziali.",
          "401 Unauthorized",
          "La password fornita non corrisponde. Il browser riceve un errore e resta senza sessione.",
          path,
          { failures: portal.failures + 1 },
        );
      return result(
        guest,
        request,
        "Il gestore del login verifica le credenziali e crea la sessione.",
        "200 OK · Set-Cookie: session=giulia-demo",
        "Il browser riceve il cookie che identifica Giulia nelle richieste successive. Segui quella sessione nella seconda scena.",
        path,
        { failures: 0 },
      );
    }
    case "upload": {
      const version = portal.lastVersion + 1;
      return result(
        signed,
        "POST /api/documents" + cookie + "\nmultipart/form-data · ID 42, nome e byte del PDF",
        "Il servizio di upload verifica il permesso di scrittura, il formato e la dimensione, poi archivia i byte.",
        "200 OK · versione " + version,
        `La versione corrente passa da v${portal.version} a v${version}. Il prossimo download autorizzato restituirà i nuovi byte.`,
        ["Upload", "Scrittura", "Storage privato"],
        { version, lastVersion: version },
      );
    }
    case "preview":
      if (!inputs.allowed)
        return result(
          signed,
          "GET /api/documents/42/preview" + cookie,
          "Il backend verifica il permesso di lettura sul file.",
          "403 Forbidden",
          "La richiesta si ferma al controllo dei permessi. Il generatore di miniature resta inattivo.",
          ["Anteprima", "Autorizzazione", "Metadati"],
        );
      return result(
        signed,
        "GET /api/documents/42/preview" + cookie,
        "Il backend autorizza la lettura e chiede al generatore di convertire la prima pagina.",
        "200 OK · image/png",
        `Giulia riceve una miniatura della versione ${portal.version}. Il generatore interno ha dovuto leggere il PDF per produrla.`,
        ["Anteprima", "Anteprima file", "Generatore e storage"],
      );
    case "share": {
      const link = portal.link + 1;
      return result(
        signed,
        "POST /api/documents/42/links" + cookie,
        "Il gestore delle condivisioni verifica il permesso e registra un token di lettura.",
        `201 Created · /s/demo-${link}`,
        "Giulia riceve un link da inviare al collega. Nel portale demo è valido un solo link per file e quello nuovo sostituisce il precedente.",
        ["Link del file", "Condivisione", "Registro dei link"],
        { link, revoked: false },
      );
    }
    case "revoke":
      return result(
        signed,
        `DELETE /api/documents/42/links/demo-${portal.link}` + cookie,
        "Il gestore delle condivisioni verifica il permesso e disattiva il token.",
        "204 No Content",
        "Il collega che riapre questo link non riceve altri byte. Le copie già scaricate restano sul suo dispositivo.",
        ["Revoca link", "Condivisione", "Registro dei link"],
        { revoked: true },
      );
    case "colleague":
      return result(
        "Collega dal proprio browser",
        `GET /s/demo-${portal.link}\nToken nel link · senza cookie di Giulia`,
        "Il gestore delle condivisioni cerca il token e controlla se dà ancora accesso al file 42.",
        portal.revoked ? "410 Gone" : pdf(portal.version),
        portal.revoked
          ? "Il token è revocato. Il gestore si ferma dopo aver letto il registro dei link, prima di chiedere il PDF allo storage."
          : `Il token è attivo. Il servizio legge 42.pdf dallo storage e consegna al collega una copia della versione ${portal.version}.`,
        [
          "Link ricevuto",
          "Condivisione",
          portal.revoked ? "Registro dei link" : "Registro e storage",
        ],
      );
    case "api":
      return result(
        "Programma esterno autorizzato",
        readRequest + "\nAuthorization: Bearer api-demo",
        "Il backend riconosce il programma dal token e verifica il suo permesso di lettura sul file.",
        pdf(portal.version),
        "Il programma riceve i byte sulla stessa rotta usata da Giulia. Può scaricare il file senza aprire la pagina del portale.",
        ["Download", "Autorizzazione", "Metadati e storage"],
      );
    case "restore":
      return result(
        "Operatore dalla console amministrativa",
        "POST /admin/restores\nSessione operatore · file 42 · copia v1",
        "Il servizio di ripristino verifica il privilegio dell’operatore e recupera la copia dal backup.",
        "200 OK · versione corrente 1",
        portal.version === 1
          ? "Il servizio riscrive v1 nello storage. Il contenuto coincide con quello già presente perché era corrente la stessa versione."
          : `Il servizio sostituisce v${portal.version} con i byte del backup v1. I prossimi download leggeranno v1.`,
        ["Console operatore", "Ripristino", "Backup e storage"],
        { version: 1 },
      );
  }
}

export type PortalExchange = ReturnType<typeof perform>["trace"];
