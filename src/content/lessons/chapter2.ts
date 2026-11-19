type CryptoLesson = {
  title: string;
  question: string;
  takeaway: string;
  reference: { label: string; href: string };
};

export const chapter2 = {
  "cybersecurity-2-0": {
    title: "2.0 — Dai caratteri ai byte",
    question: "Che cosa legge davvero un algoritmo quando gli passiamo un testo?",
    takeaway:
      "UTF-8 traduce il testo in byte. Hex e Base64 rappresentano quegli stessi byte e si possono decodificare. XOR opera sui bit e si annulla quando applichi due volte la stessa maschera.",
    reference: {
      label: "CryptoHack · Introduzione a codifiche e XOR",
      href: "https://cryptohack.org/courses/intro/course_details/",
    },
  },
  "cybersecurity-2-1": {
    title: "2.1 — Cifratura autenticata",
    question: "Come fa il server a capire se può aprire il contratto cifrato?",
    takeaway:
      "AES-GCM cifra il contenuto e verifica anche i dati associati. Le informazioni associate restano leggibili. Per ogni nuova cifratura usa un nonce distinto con la stessa chiave.",
    reference: {
      label: "NIST SP 800-38D · AES-GCM",
      href: "https://csrc.nist.gov/pubs/sp/800/38/d/final",
    },
  },
  "cybersecurity-2-2": {
    title: "2.2 — Hash e codici di autenticazione",
    question: "Che cosa dimostra l’impronta di un documento?",
    takeaway:
      "Un hash rileva modifiche se il valore atteso proviene da una fonte fidata. HMAC sfrutta una chiave condivisa per autenticare il messaggio tra chi la possiede.",
    reference: { label: "RFC 2104 · HMAC", href: "https://datatracker.ietf.org/doc/html/rfc2104" },
  },
  "cybersecurity-2-3": {
    title: "2.3 — Laboratorio di matematica crittografica",
    question: "Come si passa dai conti con i resti alle chiavi crittografiche?",
    takeaway:
      "Il massimo comune divisore dice se esiste un inverso. Mini-RSA usa quell’inverso per legare gli esponenti delle due chiavi. Diffie–Hellman usa invece le potenze modulari per ottenere un segreto condiviso.",
    reference: {
      label: "NIST SP 800-56A · Accordo di chiave",
      href: "https://csrc.nist.gov/pubs/sp/800/56/a/r3/final",
    },
  },
  "cybersecurity-2-4": {
    title: "2.4 — Firme digitali e certificati",
    question: "Una firma valida basta per fidarsi del contratto?",
    takeaway:
      "La firma si verifica con una chiave pubblica. Il certificato associa quella chiave a un’identità entro un sistema di fiducia. Il gestionale valuta a parte chi può approvare il contratto.",
    reference: {
      label: "NIST FIPS 186-5 · Firme digitali",
      href: "https://csrc.nist.gov/pubs/fips/186-5/final",
    },
  },
  "cybersecurity-2-5": {
    title: "2.5 — Come TLS stabilisce il canale",
    question: "Come decide il browser di fidarsi del reverse proxy?",
    takeaway:
      "Nel caso illustrato TLS autentica il server, ricava le chiavi di traffico e protegge il collegamento. Il tratto tra proxy e backend ha una configurazione indipendente.",
    reference: { label: "IETF · TLS 1.3", href: "https://datatracker.ietf.org/doc/html/rfc9846" },
  },
  "cybersecurity-2-6": {
    title: "2.6 — Cifratura a riposo e ciclo di vita delle chiavi",
    question: "Dopo aver ruotato una chiave, si può ancora aprire il backup?",
    takeaway:
      "La rotazione e il ripristino vanno progettati insieme. Una copia storica resta leggibile solo se il sistema può ancora recuperare la chiave che la protegge, con i permessi previsti.",
    reference: {
      label: "NIST SP 800-57 · Gestione delle chiavi",
      href: "https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final",
    },
  },
} as const satisfies Record<string, CryptoLesson>;

export type CryptoLessonId = keyof typeof chapter2;

export const cryptoLessonIds = Object.keys(chapter2) as CryptoLessonId[];
