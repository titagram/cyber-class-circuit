import { useState } from "react";
import {
  ArrowDown,
  BadgeCheck,
  BadgeX,
  Check,
  FileSignature,
  FileText,
  Fingerprint,
  KeyRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { contract } from "@/content/lessons/cybersecurity-1-3";
import "./TrustLabs.css";

const signers = {
  alfa: { name: contract.customer, key: "A" },
  beta: { name: contract.supplier, key: "B" },
} as const;

const versions = {
  original: { amount: contract.amount, fingerprint: "H₁" },
  edited: { amount: "€ 128.000", fingerprint: "H₂" },
} as const;

const certificates = {
  trusted: "CA fidata",
  "unknown-ca": "CA ignota",
  expired: "Scaduto",
} as const;

type Signer = keyof typeof signers;
type DocumentVersion = keyof typeof versions;
type Certificate = keyof typeof certificates;

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
  const IdentityIcon = identityConfirmed ? BadgeCheck : BadgeX;

  return (
    <section className="crypto-stage trust-stage" aria-label="Laboratorio di firma digitale">
      <header className="crypto-stage-label">Documento e firma ricevuti</header>
      <div className="signature-inputs">
        <section className="crypto-node trust-node" aria-label="Documento da verificare">
          <div className="trust-node-heading">
            <FileText aria-hidden="true" />
            <div>
              <h3>Contratto 42</h3>
              <p>{versions[document].amount}</p>
            </div>
          </div>
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
          <div
            className="trust-data"
            data-state={sameDocument ? "active" : "blocked"}
            aria-live="polite"
          >
            <Fingerprint aria-hidden="true" />
            <span>Impronta calcolata</span>
            <code key={document}>{versions[document].fingerprint}</code>
          </div>
        </section>

        <section className="crypto-node trust-node" aria-label="Generazione della firma">
          <div className="trust-node-heading">
            <FileSignature aria-hidden="true" />
            <div>
              <h3>Firma allegata</h3>
              <p>Creata con la chiave privata {signers[signature.signer].key}</p>
            </div>
          </div>
          <div className="crypto-controls signature-create">
            <label className="trust-field">
              Firmatario
              <select value={signer} onChange={(event) => setSigner(event.target.value as Signer)}>
                <option value="alfa">{signers.alfa.name}</option>
                <option value="beta">{signers.beta.name}</option>
              </select>
            </label>
            <Button size="sm" onClick={() => setSignature({ document, signer })}>
              Firma versione corrente
            </Button>
          </div>
          <div className="trust-data" data-state="active" aria-live="polite">
            <Fingerprint aria-hidden="true" />
            <span>Impronta firmata</span>
            <code key={signature.document}>{versions[signature.document].fingerprint}</code>
          </div>
        </section>
      </div>

      <div className="signature-join">
        <ArrowDown aria-hidden="true" />
      </div>

      <div className="signature-results">
        <section
          className="crypto-node trust-node"
          data-state={signatureValid ? "success" : "blocked"}
          aria-label="Verifica della firma"
        >
          <div className="trust-node-heading">
            <Fingerprint aria-hidden="true" />
            <h3>Validità della firma</h3>
          </div>
          <div className="trust-checks" aria-live="polite">
            <SignatureCheck passed={sameDocument} pass="Impronte uguali" fail="Impronte diverse" />
            <SignatureCheck
              passed={sameKeyPair}
              pass="Coppia di chiavi corretta"
              fail="Chiave pubblica della coppia sbagliata"
            />
          </div>
          <label className="trust-field">
            Chiave pubblica di verifica
            <select
              value={verificationKey}
              onChange={(event) => setVerificationKey(event.target.value as Signer)}
            >
              <option value="alfa">Chiave pubblica A</option>
              <option value="beta">Chiave pubblica B</option>
            </select>
          </label>
          <p
            className="crypto-status"
            data-tone={signatureValid ? "good" : "warning"}
            aria-live="polite"
          >
            {signatureValid ? "Firma valida" : "Firma non valida"}
          </p>
        </section>

        <section
          className="crypto-node trust-node"
          data-state={identityConfirmed ? "success" : "blocked"}
          aria-label="Verifica dell’identità"
        >
          <div className="trust-node-heading">
            <IdentityIcon aria-hidden="true" />
            <h3>Identità nel certificato</h3>
          </div>
          <div className="trust-checks" aria-live="polite">
            <span>
              <KeyRound aria-hidden="true" /> Chiave {signers[verificationKey].key} ·{" "}
              {signers[verificationKey].name}
            </span>
            <span>Identità attesa · {signers.alfa.name}</span>
          </div>
          <label className="trust-field">
            Certificato presentato
            <select
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
          <p
            className="crypto-status"
            data-tone={identityConfirmed ? "good" : "warning"}
            aria-live="polite"
          >
            {identityOutcome}
          </p>
        </section>
      </div>
      <p className="crypto-legend">H₁ e H₂ rappresentano le impronte delle due versioni.</p>
    </section>
  );
}

function SignatureCheck({ passed, pass, fail }: { passed: boolean; pass: string; fail: string }) {
  const Icon = passed ? Check : X;

  return (
    <span className="trust-check" data-state={passed ? "success" : "blocked"}>
      <Icon aria-hidden="true" /> {passed ? pass : fail}
    </span>
  );
}
