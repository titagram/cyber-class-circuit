export const readRequest = "GET /api/documents/42";

export const readCases = {
  visitor: {
    status: "401 Unauthorized",
    stage: "Sessione assente",
    title: "Il gestore di sessione ferma la richiesta",
    why: "Il proxy ha inoltrato la richiesta al backend. Senza una sessione valida il backend non sa chi sta chiedendo il file. Risponde al browser prima di consultare i permessi o chiamare lo storage.",
    storage: "Nessuna chiamata",
  },
  denied: {
    status: "403 Forbidden",
    stage: "Lettura negata",
    title: "Il modulo di autorizzazione ferma la richiesta",
    why: "Il backend ha riconosciuto Giulia dalla sessione e ha consultato la scheda 42 nel database. Giulia non ha il permesso di lettura su questo file. Il browser riceve il diniego e nessun byte del PDF.",
    storage: "Nessuna chiamata",
  },
  allowed: {
    status: "200 OK",
    stage: "Lettura consentita",
    title: "Il browser riceve 42.pdf",
    why: "Il backend ha riconosciuto Giulia e verificato il suo permesso sulla scheda 42. Poi ha chiesto il file con la propria identità tecnica. Lo storage ha verificato che il servizio possa leggere l’oggetto e ha restituito i byte, che tornano al browser tramite il proxy.",
    storage: "Byte restituiti",
  },
} as const;

export const layers = ["Ingresso HTTPS", "Lettura del file", "Storage privato"] as const;
export type ReadCase = keyof typeof readCases;
export function describeLayer(layer: (typeof layers)[number], result: ReadCase) {
  if (layer === "Ingresso HTTPS") {
    return "Il browser sceglie l’ID 42 e invia la richiesta a files.example sulla porta 443. Il reverse proxy riceve connessioni da Internet e inoltra la richiesta al backend. Anche un visitatore può arrivare a questo ingresso.";
  }
  if (layer === "Lettura del file") {
    if (result === "visitor")
      return "L’endpoint riceve un ID scelto dal browser. Il gestore di sessione richiede un’identità verificata. Senza di essa la richiesta si ferma qui.";
    if (result === "denied")
      return "La sessione identifica Giulia. Il modulo di autorizzazione confronta la sua identità con i permessi della scheda 42 e nega la lettura. Conoscere l’ID del file permette di chiederlo.";
    return "La sessione identifica Giulia. Il modulo di autorizzazione trova sulla scheda 42 il suo permesso di lettura e il backend può chiedere il PDF allo storage.";
  }
  return result === "allowed"
    ? "Il chiamante qui è il backend. Lo storage verifica le credenziali del servizio e il suo permesso su files/42.pdf. Solo dopo apre l’oggetto."
    : "Il browser può raggiungere l’ingresso HTTPS. L’API dello storage è privata e richiede le credenziali del servizio. In questo caso il backend si è fermato prima di chiamarla.";
}
