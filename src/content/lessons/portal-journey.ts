import type { PortalExchange } from "./portal-42";

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

export function portalJourney(trace: PortalExchange): Step[] {
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
