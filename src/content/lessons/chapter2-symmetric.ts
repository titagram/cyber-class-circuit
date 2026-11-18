// Precomputed AES-128-GCM fixture for an invented contract. The key stays out of the UI.
export const aeadEnvelope = {
  nonce: "f3b2c8818e9501b42ade064d",
  ciphertext: "d2618fd087791aaa5608353cc3c78c3f06df6832cb3de9648be227b6a7b46b0b3f",
  tag: "32ab02c6b0b5671ea644028d678e3741",
  aad: "tenant=alfa&documento=42",
  plaintext: "Contratto 42\nImporto: EUR 125.000",
} as const;

export const aeadCases = [
  {
    id: "original",
    label: "Messaggio originale",
    receivedCiphertext: aeadEnvelope.ciphertext,
    serverAad: aeadEnvelope.aad,
    accepted: true,
    explanation: "Il tag è valido per il ciphertext e per l’AAD attesa dal server.",
  },
  {
    id: "ciphertext",
    label: "Ciphertext alterato",
    receivedCiphertext: `d3${aeadEnvelope.ciphertext.slice(2)}`,
    serverAad: aeadEnvelope.aad,
    accepted: false,
    explanation: "È cambiato un bit del ciphertext. Il controllo del tag fallisce.",
  },
  {
    id: "aad",
    label: "AAD del tenant errato",
    receivedCiphertext: aeadEnvelope.ciphertext,
    serverAad: "tenant=beta&documento=42",
    accepted: false,
    explanation:
      "Il server verifica la busta nel contesto di Beta. Il tag era legato al tenant Alfa.",
  },
] as const;

// SHA-256 and HMAC-SHA-256 outputs for the exact UTF-8 messages below.
export const integrityCases = [
  {
    id: "original",
    label: "Messaggio originale",
    message: "documento=42&importo_eur=125000&stato=APPROVATO",
    sha256: "025da33a6123db5aada3a03d5e12652e455a10ad54e8f0cf4d4fa924372f1c87",
    hmac: "ffef0b2b32fdbcaaebf494f889285c57e06d0bae1454d2db329b5fcc528f30cf",
    differentHashBits: 0,
    explanation: "Il messaggio ricevuto è identico all’originale, byte per byte.",
  },
  {
    id: "amount",
    label: "Cambia importo",
    message: "documento=42&importo_eur=925000&stato=APPROVATO",
    sha256: "cbabd88a3f5e373bd29ef337f873fb76240ae6ec08b4de5d9a443b6777d4fbfc",
    hmac: "f4650ac32e3d5338a3f745d6719693416955117e52aab135513cbbf858dea176",
    differentHashBits: 134,
    explanation:
      "L’importo passa da 125.000 a 925.000 euro. Nel messaggio è cambiata una sola cifra.",
  },
  {
    id: "status",
    label: "Cambia stato",
    message: "documento=42&importo_eur=125000&stato=BOZZA",
    sha256: "ec0d32024d7125fd80bcc34d1beeb8d45bcadbac6ffaa9e8d4cdb62b3be7fef6",
    hmac: "4a7b1d3ae32dd93665a45dcc448df55fcc942f1fab754d6bf8596b00e9fef483",
    differentHashBits: 124,
    explanation: "Il valore del campo stato passa da APPROVATO a BOZZA.",
  },
] as const;
