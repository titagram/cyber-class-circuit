export const lesson = {
  id: "cybersecurity-1-1",
  title: "1.1 — Che cosa dobbiamo proteggere, e perché?",
  subtitle:
    "Asset, conseguenze di una compromissione e condizioni che rendono possibile un attacco intenzionale.",
  openingQuestion:
    "Perché qualcuno dovrebbe attaccare la nostra applicazione e che cosa abbiamo da perdere?",
  openingText:
    "Prima di scegliere un controllo di sicurezza dobbiamo comprendere che cosa ha valore, per chi e quali conseguenze produrrebbe la sua compromissione.",
  scenario:
    "Considera un gestionale SaaS multi-tenant: più organizzazioni clienti condividono la stessa applicazione, ma ciascuna deve poter accedere soltanto ai propri dati.",
} as const;

export const moments = [
  { value: "domanda", label: "1 · La domanda" },
  { value: "asset", label: "2 · Gli asset" },
  { value: "triangolo", label: "3 · Il triangolo" },
  { value: "opportunita", label: "4 · Le opportunità" },
] as const;

export type Moment = (typeof moments)[number]["value"];

export type Asset = {
  id: string;
  name: string;
  summary: string;
  contains: string;
  value: string;
  access: string;
  damages: string;
};

export const assets: readonly Asset[] = [
  {
    id: "account",
    name: "Credenziali e account",
    summary: "Identità e accessi degli utenti",
    contains:
      "Identificativi degli account, hash delle password, sessioni, token di recupero e ruoli assegnati agli utenti dei diversi tenant.",
    value:
      "Consentono di autenticarsi e agire a nome di un utente. Un account amministrativo può offrire accesso esteso a dati e funzioni sensibili.",
    access:
      "Il proprietario dell'account, il servizio di gestione delle identità e gli amministratori autorizzati, ciascuno con privilegi limitati alle proprie responsabilità.",
    damages:
      "Account takeover, impersonificazione, modifica dei permessi e accesso non autorizzato ai dati di uno o più tenant.",
  },
  {
    id: "dati-personali",
    name: "Dati personali",
    summary: "Informazioni riferite alle persone",
    contains:
      "Nomi, recapiti, dati anagrafici, informazioni lavorative e ogni altra informazione associabile a una persona identificata o identificabile.",
    value:
      "Possono essere usati per frodi, phishing mirato, furto d'identità o per ottenere informazioni su clienti e dipendenti.",
    access:
      "Le persone incaricate che ne hanno necessità per finalità determinate, secondo il proprio ruolo e per i soli tenant di competenza.",
    damages:
      "Violazione della riservatezza, danni alle persone coinvolte, perdita di fiducia, obblighi di notifica e possibili conseguenze legali ed economiche.",
  },
  {
    id: "documenti",
    name: "Documenti riservati",
    summary: "File e contenuti dei clienti",
    contains:
      "Contratti, preventivi, relazioni, documenti finanziari e altri file caricati o generati all'interno dei singoli tenant.",
    value:
      "Rivelano strategie, relazioni commerciali e informazioni non pubbliche utili a concorrenti, frodatori o attaccanti interessati al sabotaggio.",
    access:
      "Gli utenti del tenant proprietario con un'autorizzazione specifica e i processi applicativi che devono gestire quei documenti.",
    damages:
      "Divulgazione di segreti commerciali, uso illecito delle informazioni, ricatti e compromissione delle attività del cliente.",
  },
  {
    id: "economia",
    name: "Informazioni economiche",
    summary: "Pagamenti, importi e dati contabili",
    contains:
      "Piani tariffari, fatture, importi, coordinate di pagamento, movimenti e informazioni sulla situazione economica dei clienti.",
    value:
      "Possono avere un valore economico diretto oppure consentire frodi, manipolazione dei pagamenti e analisi riservate sull'attività dei clienti.",
    access:
      "Gli utenti autorizzati del tenant, gli operatori amministrativi incaricati e i servizi di fatturazione o pagamento strettamente necessari.",
    damages:
      "Perdite economiche, pagamenti deviati, frodi, alterazione dei dati contabili e controversie con clienti e fornitori.",
  },
  {
    id: "configurazioni",
    name: "Chiavi e configurazioni applicative",
    summary: "Segreti e controlli dell'infrastruttura",
    contains:
      "Chiavi API, segreti applicativi, configurazioni dei servizi, stringhe di connessione e parametri che regolano integrazioni e permessi.",
    value:
      "Permettono di raggiungere altri sistemi, decifrare o firmare dati, modificare il comportamento dell'applicazione ed estendere un accesso iniziale.",
    access:
      "Esclusivamente i sistemi e gli operatori con una necessità operativa documentata; i segreti non devono essere visibili agli utenti del gestionale.",
    damages:
      "Compromissione di servizi collegati, esfiltrazione di dati, interruzione del servizio e movimento laterale verso altre parti dell'infrastruttura.",
  },
] as const;

export type FactorId = "capacita" | "motivazione" | "opportunita";

export type CrimeFactor = {
  id: FactorId;
  title: string;
  english: string;
  description: string;
  example: string;
  contribution: string;
};

export const crimeFactors: readonly CrimeFactor[] = [
  {
    id: "capacita",
    title: "CAPACITÀ",
    english: "Capability",
    description:
      "Conoscenze tecniche, strumenti, risorse ed esperienza di cui dispone l'attaccante.",
    example:
      "L'attaccante conosce il funzionamento delle API e sa individuare e sfruttare una vulnerabilità nel controllo degli accessi a un endpoint del SaaS.",
    contribution:
      "Rende l'attaccante in grado di trasformare una debolezza individuata in un'azione concreta contro l'applicazione.",
  },
  {
    id: "motivazione",
    title: "MOTIVAZIONE",
    english: "Motive",
    description: "Le ragioni che spingono ad attaccare un sistema.",
    example:
      "L'attaccante vuole sottrarre i documenti riservati di un cliente per ottenere un profitto, un vantaggio competitivo o danneggiare l'organizzazione.",
    contribution:
      "Fornisce un obiettivo e una ragione per investire tempo e risorse nell'attacco al nostro gestionale.",
  },
  {
    id: "opportunita",
    title: "OPPORTUNITÀ",
    english: "Opportunity",
    description:
      "Le condizioni che rendono concretamente possibile tentare un attacco, inclusa la facilità di accesso al bersaglio.",
    example:
      "Un endpoint pubblico accetta l'identificativo di un documento senza verificare che appartenga al tenant dell'utente autenticato.",
    contribution:
      "Offre un percorso praticabile verso l'obiettivo: credenziali compromesse, errori di configurazione, accessi privilegiati o vulnerabilità sfruttabili aumentano le occasioni di attacco.",
  },
] as const;

export const riskConcepts = [
  {
    term: "Minaccia",
    definition: "Chi o che cosa potrebbe causare un danno.",
  },
  {
    term: "Vulnerabilità",
    definition: "La debolezza sfruttabile.",
  },
  {
    term: "Rischio",
    definition:
      "La possibilità che si verifichi un evento dannoso, valutata considerando probabilità e conseguenze.",
  },
] as const;

export const riskNote =
  "Il Crime Triangle serve a ragionare sulle condizioni di un attacco intenzionale, ma non costituisce da solo una metodologia completa di risk assessment.";

export const reduction = {
  title: "Riduciamo le opportunità",
  scenario:
    "Un attaccante ha competenze tecniche elevate ed è motivato a sottrarre i documenti di un cliente. Nel SaaS esiste un endpoint che consente l'accesso ai documenti tramite identificativo.",
  situations: [
    {
      id: "A",
      title: "Situazione A — Controllo insufficiente",
      description:
        "L'endpoint non verifica correttamente che il documento richiesto appartenga a un tenant autorizzato.",
      outcome:
        "La vulnerabilità offre un'opportunità di accesso non autorizzato.",
    },
    {
      id: "B",
      title: "Situazione B — Controllo corretto",
      description:
        "Il backend verifica l'autorizzazione alla risorsa per ogni richiesta.",
      outcome:
        "Quella specifica opportunità viene eliminata, pur restando possibili altri percorsi di attacco.",
    },
  ],
  message:
    "Non possiamo controllare le capacità o le motivazioni di un attaccante. Possiamo però intervenire sulle opportunità che il nostro sistema gli offre.",
} as const;

export const conclusion =
  "La sicurezza non consiste nel rendere impossibile qualunque attacco, ma nel comprendere che cosa proteggere e ridurre concretamente le possibilità di compromissione.";

export const nextQuestion =
  "Ma quali proprietà deve possedere un'informazione per poter essere considerata protetta?";
