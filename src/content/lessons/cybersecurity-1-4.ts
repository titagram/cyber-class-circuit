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
