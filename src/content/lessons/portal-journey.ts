import type { PortalExchange, SharedLink } from "./portal-42";

export const stops = {
  client: { ring: 0, x: 1, y: 27 },
  entry: { ring: 1, x: 9, y: 43 },
  session: { ring: 2, x: 21, y: 40 },
  authorization: { ring: 2, x: 20, y: 68 },
  backend: { ring: 2, x: 74, y: 35 },
  database: { ring: 3, x: 36, y: 54 },
  storage: { ring: 3, x: 69, y: 61 },
} as const;

type Stop = keyof typeof stops;
type Phase = "request" | "stop" | "allow" | "response";
type Step = { at: Stop; title: string; why: string; phase: Phase };

function step(at: Stop, title: string, why: string, phase: Phase = "request"): Step {
  return { at, title, why, phase };
}

function sharedLinkJourney(trace: PortalExchange, { event, url }: SharedLink): Step[] {
  const managing = event === "created" || event === "revoked";
  const creating = event === "created";
  const accepted = event === "downloaded";
  const manager = "Gestore delle condivisioni";
  const registry = "Registro dei link";
  const steps = [
    step("client", trace.actor, trace.request),
    step(
      "entry",
      "Reverse proxy",
      managing
        ? "Inoltra al backend la richiesta di Giulia con il cookie di sessione."
        : "Inoltra al backend la GET del collega. L’indirizzo contiene il token del link.",
    ),
  ];
  if (managing) {
    steps.push(
      step(
        "session",
        "Gestore di sessione",
        "Dal cookie il backend identifica Giulia, che chiede di gestire la condivisione del file 42.",
      ),
      step(
        "authorization",
        manager,
        creating
          ? "Verifica che Giulia possa condividere il file 42. Genera un token che permette a chi lo presenta di scaricare questo PDF."
          : "Verifica che Giulia possa gestire la condivisione di 42.pdf. Chiede al registro di disattivare proprio il token di questo link.",
      ),
      step(
        "database",
        registry,
        creating
          ? `Registra il token di ${url} associandolo al file 42. Memorizza il permesso di sola lettura e lo stato attivo. I byte restano nello storage.`
          : `Cambia lo stato di ${url} da attivo a revocato. Il file in archivio e le copie già scaricate restano dove sono.`,
      ),
      step(
        "backend",
        "Server HTTP del backend",
        creating
          ? `Ricevuta la conferma del registro, restituisce a Giulia l’indirizzo ${url} con 201 Created.`
          : "Il registro conferma la revoca. Il gestore risponde con 204 No Content.",
        "response",
      ),
    );
  } else {
    steps.push(
      step(
        "authorization",
        manager,
        `Estrae il token da ${url} e chiede al registro a quale file dà accesso e se è ancora attivo.`,
      ),
      step(
        "database",
        registry,
        accepted
          ? "La registrazione associa il token al file 42, con permesso di lettura e stato attivo. Questi dati tornano al gestore."
          : "La registrazione associa ancora il token al file 42. Lo stato è diventato revocato. Il registro restituisce questo dato al gestore.",
      ),
      accepted
        ? step(
            "authorization",
            manager,
            "Il token è attivo e consente la lettura del file 42. Il gestore autorizza il download e chiede i byte allo storage con l’identità del servizio.",
            "allow",
          )
        : step(
            "authorization",
            manager,
            "Il token è revocato. Il gestore ferma la richiesta qui e risponde 410 Gone, prima di chiamare lo storage.",
            "stop",
          ),
    );
    if (accepted)
      steps.push(
        step(
          "storage",
          "Storage privato",
          "Riconosce l’identità tecnica del backend e gli restituisce i byte di 42.pdf.",
        ),
        step(
          "backend",
          "Server HTTP del backend",
          "Invia al proxy la risposta 200 OK con il PDF nel corpo.",
          "response",
        ),
      );
  }
  steps.push(
    step(
      "entry",
      "Reverse proxy",
      managing
        ? "Inoltra la risposta del backend al browser di Giulia."
        : "Inoltra la risposta del backend al browser del collega.",
      "response",
    ),
    step(
      "client",
      managing ? "Browser di Giulia" : "Browser del collega",
      creating
        ? `Giulia riceve ${url} e lo passa al collega.`
        : event === "revoked"
          ? `Giulia riceve conferma della revoca. Il collega ha ancora lo stesso indirizzo ${url}.`
          : accepted
            ? `${trace.response}. Il collega riceve una copia di 42.pdf. L’originale resta in archivio.`
            : "410 Gone. Il collega ha riprovato lo stesso indirizzo. La copia già scaricata resta sul suo dispositivo, ma questa richiesta non gli consegna altri byte.",
      "response",
    ),
  );
  return steps;
}

export function portalJourney(trace: PortalExchange): Step[] {
  if (trace.sharedLink) return sharedLinkJourney(trace, trace.sharedLink);
  const steps = [step("client", trace.actor, trace.request.split("\n")[0] ?? trace.request)];
  if (trace.readCase) {
    const guest = trace.readCase === "visitor";
    const allowed = trace.readCase === "allowed";
    steps.push(
      step(
        "entry",
        "Reverse proxy",
        "Riceve la GET dal browser e la inoltra al server HTTP del backend.",
      ),
    );
    steps.push(
      guest
        ? step(
            "session",
            "Gestore di sessione",
            "Manca il cookie di sessione. Il backend ferma il download qui e prepara 401 Unauthorized.",
            "stop",
          )
        : step(
            "session",
            "Gestore di sessione",
            "Il cookie identifica Giulia. Il backend può ora controllare se può leggere il file 42.",
          ),
    );
    if (!guest) {
      steps.push(
        step(
          "database",
          "Database dei metadati",
          "Il backend chiede la scheda del file 42. Il database restituisce i dati sui permessi. I byte del PDF sono nello storage.",
        ),
      );
      steps.push(
        allowed
          ? step(
              "authorization",
              "Modulo di autorizzazione",
              "Il modulo confronta i permessi con l’identità di Giulia e autorizza la lettura. Ora il backend può chiedere i byte allo storage.",
              "allow",
            )
          : step(
              "authorization",
              "Modulo di autorizzazione",
              "Giulia è identificata, ma manca il permesso su questo file. Il modulo ferma il download qui con 403 Forbidden. Lo storage non viene chiamato.",
              "stop",
            ),
      );
      if (allowed) {
        steps.push(
          step(
            "storage",
            "Storage privato",
            "Verifica l’identità tecnica del backend e gli restituisce i byte di 42.pdf. L’originale resta in archivio.",
          ),
        );
        steps.push(
          step(
            "backend",
            "Server HTTP del backend",
            "Il backend invia al proxy la risposta 200 OK con i byte del PDF.",
            "response",
          ),
        );
      }
    }
    steps.push(
      step(
        "entry",
        "Reverse proxy",
        allowed
          ? "Inoltra al browser la risposta che contiene il PDF."
          : "Inoltra al browser il diniego del backend. La risposta non contiene il PDF.",
        "response",
      ),
    );
    steps.push(
      step(
        "client",
        "Browser di Giulia",
        allowed
          ? `Riceve la copia richiesta. ${trace.response}.`
          : `Riceve ${trace.response}. Nessun byte del file è stato consegnato.`,
        "response",
      ),
    );
    return steps;
  }

  const [entry, application, service] = trace.path;
  steps.push(step("entry", entry, trace.request));
  if (application) steps.push(step("session", application, trace.responder));
  if (service)
    steps.push(
      step("database", service, `La funzione «${application}» coinvolge questo servizio privato.`),
    );
  if (service && application)
    steps.push(
      step("session", application, "Il backend prepara la risposta per il client.", "response"),
    );
  if (application)
    steps.push(
      step("entry", entry, "La risposta torna al client attraverso questo ingresso.", "response"),
    );
  steps.push(step("client", trace.actor, `${trace.response}. ${trace.effect}`, "response"));
  return steps;
}
