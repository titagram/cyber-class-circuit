import type { ReviewCase } from "./web-module";

export const perimeter: readonly ReviewCase[] = [
  {
    name: "Sito pubblico",
    route: ["Browser anonimo", "Reverse proxy", "Catalogo", "Metadati pubblici"],
    input: "GET /documenti",
    decision:
      "Il proxy accetta la connessione pubblica e inoltra la rotta. Il catalogo seleziona i campi pubblicabili e restituisce una pagina con il nome 42.pdf.",
    risk: "Un elenco costruito serializzando l’intera scheda può esporre il tenant, i permessi o la posizione interna del file.",
    control:
      "Pubblicare solo le rotte previste. Nel catalogo proiettare esplicitamente i campi destinati al visitatore.",
    evidence:
      "La risposta HTML contiene nome e collegamento. Il download richiede una richiesta distinta e una decisione sul file.",
  },
  {
    name: "API del file",
    route: ["Browser o programma", "Reverse proxy", "Servizio file", "Storage privato"],
    input: "GET /api/documents/42",
    decision:
      "Il client sceglie l’ID nella richiesta. Il backend ricava il soggetto dalla sessione o dal token del programma e valuta la lettura su quel file.",
    risk: "Se l’unico controllo è nascondere il pulsante nell’interfaccia, la rotta resta accessibile agli altri client.",
    control:
      "Nel servizio applicativo verificare soggetto, tenant, azione e risorsa prima di aprire l’oggetto nello storage.",
    evidence:
      "La stessa rotta restituisce un PDF al soggetto autorizzato e un diniego al soggetto privo del permesso.",
  },
  {
    name: "Link condiviso",
    route: ["Collega", "Reverse proxy", "Condivisioni", "Registro dei link"],
    input: "GET /s/demo-2",
    decision:
      "Il destinatario presenta la concessione contenuta nell’indirizzo. Il gestore decide in base a file, operazione e stato del link.",
    risk: "Chi riceve una copia del link attivo può esercitare la concessione anche senza un account nel portale.",
    control:
      "Limitare la concessione al file e alla lettura. Verificarla a ogni richiesta e applicare la revoca sul server.",
    evidence:
      "Dopo la revoca lo stesso indirizzo restituisce 410 nel portale simulato. Nessun nuovo byte viene letto dallo storage.",
  },
  {
    name: "Console operativa",
    route: ["Operatore", "Ingresso amministrativo", "Servizio ripristino", "Backup"],
    input: "POST /admin/restores · file 42 · versione 1",
    decision:
      "L’operatore usa una console riservata. Il servizio verifica il privilegio di ripristino per il tenant prima di riscrivere la versione corrente.",
    risk: "Un controllo generico di login permetterebbe a un normale utente di avviare un’operazione che sostituisce dati.",
    control:
      "Separare l’accesso alla console, autorizzare ogni comando lato server e registrare operatore, oggetto e versione.",
    evidence:
      "Verificare insieme le regole di raggiungibilità della console, la policy applicativa e l’evento di ripristino.",
  },
  {
    name: "Dipendenze private",
    route: ["Servizio file", "Rete applicativa", "Database / Redis", "Scheda del file"],
    input: "Identità di servizio · tenant Alfa · file 42",
    decision:
      "Il browser interagisce con l’API. Database e cache ricevono chiamate dal backend tramite la rete applicativa.",
    risk: "Un listener pubblicato per errore introduce un ingresso di rete separato. Un’identità di servizio troppo ampia aumenta i dati raggiungibili da una funzione.",
    control:
      "Limitare i listener ai chiamanti previsti. Assegnare al servizio i soli privilegi necessari e includere il tenant nello scope dei record e delle chiavi cache.",
    evidence:
      "Le risposte del browser descrivono l’API. Per attestare l’isolamento servono anche configurazione di rete, regole di accesso e permessi del servizio.",
  },
  {
    name: "Integrazione opzionale",
    route: ["Gestionale partner", "Webhook pubblicato", "Coda importazioni", "Worker privato"],
    input: "Estensione ipotetica · POST /integrations/imports",
    decision:
      "Se il portale accetta notifiche da un partner, il ricevitore diventa un nuovo ingresso. Il worker consuma il messaggio in un secondo momento con una propria identità.",
    risk: "Fidarsi del tenant dichiarato nel messaggio può far elaborare dati per un’altra organizzazione. Le riconsegne possono duplicare una scrittura.",
    control:
      "Autenticare l’integrazione, ricavare il tenant dalla sua registrazione, validare lo schema e rendere idempotente la scrittura. Limitare separatamente i privilegi del worker.",
    evidence:
      "Seguire un evento di prova dal ricevitore alla coda fino all’esito del job. Una risposta di accettazione attesta la presa in carico, non il completamento.",
  },
];
