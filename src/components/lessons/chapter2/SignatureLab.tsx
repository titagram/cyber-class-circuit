import { useState } from "react";
import { Button } from "@/components/ui/button";
import { contract } from "@/content/lessons/cybersecurity-1-3";

const signers = {
  alfa: { name: contract.customer, key: "A" },
  beta: { name: contract.supplier, key: "B" },
} as const;

const versions = {
  original: { amount: contract.amount, fingerprint: "H₁" },
  edited: { amount: "€ 128.000", fingerprint: "H₂" },
} as const;

const certificates = {
  trusted: "Emesso da una CA fidata",
  "unknown-ca": "Emesso da una CA ignota",
  expired: "Scaduto",
} as const;

type Signer = keyof typeof signers;
type DocumentVersion = keyof typeof versions;
type Certificate = keyof typeof certificates;

const selectClass =
  "min-w-0 rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground";

export function SignatureLab() {
  const [document, setDocument] = useState<DocumentVersion>("original");
  const [signer, setSigner] = useState<Signer>("alfa");
  const [signature, setSignature] = useState<{ document: DocumentVersion; signer: Signer }>({
    document: "original",
    signer: "alfa",
  });
  const [verificationKey, setVerificationKey] = useState<Signer>("alfa");
  const [certificate, setCertificate] = useState<Certificate>("trusted");

  const sameDocument = document === signature.document;
  const sameKeyPair = verificationKey === signature.signer;
  const signatureValid = sameDocument && sameKeyPair;
  const expectedIdentity = verificationKey === "alfa";
  const identityConfirmed = expectedIdentity && certificate === "trusted";
  const identityOutcome = {
    trusted: expectedIdentity ? "Identità del certificato confermata" : "Firmatario atteso diverso",
    "unknown-ca": "Autorità non riconosciuta",
    expired: "Certificato scaduto",
  }[certificate];

  return (
    <div className="space-y-4">
      <div className="crypto-grid">
        <section className="crypto-card space-y-3" aria-label="Documento da verificare">
          <h3 className="crypto-label">Contratto 42</h3>
          <div className="crypto-controls" role="group" aria-label="Versione del contratto">
            <Button
              size="sm"
              variant={document === "original" ? "default" : "outline"}
              aria-pressed={document === "original"}
              onClick={() => setDocument("original")}
            >
              Originale
            </Button>
            <Button
              size="sm"
              variant={document === "edited" ? "default" : "outline"}
              aria-pressed={document === "edited"}
              onClick={() => setDocument("edited")}
            >
              Importo modificato
            </Button>
          </div>
          <p className="crypto-readout" aria-live="polite">
            {versions[document].amount} · impronta {versions[document].fingerprint}
          </p>
        </section>

        <section className="crypto-card space-y-3" aria-label="Generazione della firma">
          <h3 className="crypto-label">Firma allegata</h3>
          <div className="crypto-controls">
            <label className="grid min-w-0 gap-1 text-sm text-muted-foreground">
              Firmatario
              <select
                className={selectClass}
                value={signer}
                onChange={(event) => setSigner(event.target.value as Signer)}
              >
                <option value="alfa">{signers.alfa.name}</option>
                <option value="beta">{signers.beta.name}</option>
              </select>
            </label>
            <Button
              size="sm"
              className="self-end"
              onClick={() => setSignature({ document, signer })}
            >
              Firma versione corrente
            </Button>
          </div>
          <p className="crypto-readout" aria-live="polite">
            Generata con la chiave privata {signers[signature.signer].key} · impronta firmata{" "}
            {versions[signature.document].fingerprint}
          </p>
        </section>
      </div>

      <div className="crypto-grid">
        <section className="crypto-card space-y-3" aria-label="Verifica della firma">
          <h3 className="crypto-label">Controllo crittografico</h3>
          <label className="grid gap-1 text-sm text-muted-foreground">
            Chiave pubblica di verifica
            <select
              className={selectClass}
              value={verificationKey}
              onChange={(event) => setVerificationKey(event.target.value as Signer)}
            >
              <option value="alfa">Chiave pubblica A</option>
              <option value="beta">Chiave pubblica B</option>
            </select>
          </label>
          <div aria-live="polite">
            <p className="crypto-status" data-tone={signatureValid ? "good" : "warning"}>
              {signatureValid ? "Firma valida" : "Firma non valida"}
            </p>
            <p className="text-sm text-muted-foreground">
              {sameDocument ? "Versione firmata intatta." : "Versione diversa da quella firmata."}{" "}
              {sameKeyPair
                ? "Coppia di chiavi corretta."
                : "Chiave pubblica della coppia sbagliata."}
            </p>
          </div>
        </section>

        <section className="crypto-card space-y-3" aria-label="Verifica dell’identità">
          <h3 className="crypto-label">Fiducia nel certificato</h3>
          <label className="grid gap-1 text-sm text-muted-foreground">
            Certificato presentato
            <select
              className={selectClass}
              value={certificate}
              onChange={(event) => setCertificate(event.target.value as Certificate)}
            >
              {Object.entries(certificates).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div aria-live="polite">
            <p className="crypto-status" data-tone={identityConfirmed ? "good" : "warning"}>
              {identityOutcome}
            </p>
            <p className="text-sm text-muted-foreground">
              Intestatario della chiave {signers[verificationKey].key} ·{" "}
              {signers[verificationKey].name}
              <br />
              Identità attesa · {signers.alfa.name}
            </p>
          </div>
        </section>
      </div>

      <p className="text-sm text-muted-foreground">
        H₁ e H₂ rappresentano le impronte delle due versioni. Il mittente conserva la chiave privata
        e invia la firma con il documento. Per un servizio web, TLS confronta il nome host atteso
        con i nomi nel certificato.
      </p>
    </div>
  );
}
