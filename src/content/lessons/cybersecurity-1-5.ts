type Observation = {
  route: readonly string[];
  artifact: string;
  meaning: string;
};
type Point = {
  label: string;
  identity: string;
  control: string;
  observe: (revoked: boolean) => Observation;
};

// The colleague saved one authorised download before either observation.
export const exposurePoints: readonly Point[] = [
  {
    label: "Link del collega",
    identity: "Browser del collega con il link ricevuto da Giulia.",
    control:
      "Autorizzare ogni nuova lettura sul server. Legare il token al file e all’operazione e verificare nel registro la revoca prima di chiamare lo storage.",
    observe: (revoked) => ({
      route: revoked
        ? [
            "Collega",
            "Reverse proxy",
            "Gestore link",
            "Registro · revocato",
            "Gestore link · diniego",
          ]
        : [
            "Collega",
            "Reverse proxy",
            "Gestore link",
            "Registro · attivo",
            "Gestore link · autorizza",
            "Storage",
          ],
      artifact: revoked
        ? "GET /s/demo-2\n410 Gone · nessun byte del PDF"
        : "GET /s/demo-2\n200 OK · application/pdf · 42.pdf",
      meaning: revoked
        ? "Il registro ha restituito lo stato revocato. Il gestore ferma la richiesta e risponde attraverso il proxy. In questa esecuzione lo storage non riceve una lettura."
        : "Il gestore ha verificato il token e recuperato il file. La risposta contiene i byte. Il collega può leggere il PDF senza usare la sessione di Giulia.",
    }),
  },
  {
    label: "Download sul dispositivo",
    identity: "Utente del dispositivo con accesso alla copia salvata.",
    control:
      "Valutare prima della consegna chi può scaricare il file e su quali dispositivi. La revoca sul portale ha effetto sulle richieste future.",
    observe: () => ({
      route: ["Collega", "Cartella Download", "Lettore PDF"],
      artifact: "Download/42.pdf → pagina 1\nRichieste al portale: 0",
      meaning:
        "Il lettore apre la copia già salvata. Nessun componente del portale riceve un evento di apertura, anche se lo stesso indirizzo web ora restituisce un diniego.",
    }),
  },
  {
    label: "Proxy e servizio file",
    identity: "Processi del reverse proxy e del backend durante questa richiesta del collega.",
    control:
      "Controllare configurazione dei buffer, cache delle risposte e accessi ai file temporanei. Per affermare che esiste una copia persistente occorre individuarla.",
    observe: (revoked) => ({
      route: ["Browser", "Reverse proxy", "Servizio file"],
      artifact: revoked
        ? "Risposta del gestore: 410\nByte PDF inoltrati: 0"
        : "Storage → backend → proxy → browser\nCorpo della risposta: blocchi di 42.pdf",
      meaning: revoked
        ? "Il proxy inoltra il diniego. Questa richiesta non porta il contenuto del PDF nei buffer di risposta."
        : "Entrambi i processi trasferiscono il corpo della risposta. Nel modello i buffer sono transitori. Il semplice passaggio dei byte non dimostra che un operatore possa recuperarli dopo.",
    }),
  },
  {
    label: "Storage e backup",
    identity: "Identità tecnica del servizio file e, separatamente, operatore di ripristino.",
    control:
      "Tenere privato l’archivio e limitare i privilegi per oggetto o namespace. Separare lettura ordinaria e ripristino, registrando file, versione e operatore.",
    observe: () => ({
      route: ["Operatore autorizzato", "Servizio ripristino", "Backup", "Storage"],
      artifact: "Storage: files/42.pdf\nBackup: copia della versione 1",
      meaning:
        "La revoca cambia un record nel servizio di condivisione. L’originale e il backup continuano a esistere. Per verificarne l’accessibilità servono policy dei servizi e riscontro di una lettura o di un ripristino autorizzato.",
    }),
  },
  {
    label: "Anteprima",
    identity: "Giulia con permesso di lettura e processo che genera la miniatura.",
    control:
      "Applicare alla rotta di anteprima la policy di lettura del file. Limitare anche l’accesso a eventuali immagini derivate persistenti.",
    observe: () => ({
      route: ["Giulia", "Servizio anteprima", "Generatore", "Prima pagina"],
      artifact: "GET /api/documents/42/preview · sessione di Giulia\n200 OK · image/png",
      meaning:
        "Questa operazione usa la sessione autorizzata di Giulia. Il generatore legge il PDF, mentre alla persona arriva un’immagine: i dati visibili nella prima pagina sono esposti anche attraverso questo formato.",
    }),
  },
  {
    label: "Database, cache e log",
    identity: "Backend per la scheda e operatore abilitato per il log applicativo.",
    control:
      "Separare privilegi di consultazione e scrittura. Limitare la scheda ai campi necessari e omettere cookie, token e contenuti dai log.",
    observe: (revoked) => ({
      route: ["Gestore link", "Evento applicativo", "Sistema di log"],
      artifact: `Scheda in database/cache: file_id=42 · tenant=Alfa\nEvento simulato: file_id=42 · status=${revoked ? 410 : 200}`,
      meaning:
        "La scheda descrive il file. Il log documenta l’esito della richiesta. Nessuno dei due artefatti contiene i byte del PDF o dimostra che il destinatario lo abbia aperto.",
    }),
  },
];
