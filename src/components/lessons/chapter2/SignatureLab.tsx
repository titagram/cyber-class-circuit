import { useState } from "react";
import {
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
import { TutorialFrame, type TutorialStep } from "./TutorialFrame";
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
  trusted: "CA fidata, certificato valido",
  "unknown-ca": "CA ignota",
  expired: "Certificato scaduto",
} as const;

const steps = [
  {
    label: "Prepara",
    title: "Prepara il contratto 42",
    explanation:
      "Il gestionale attende l’approvazione del cliente Alfa. Scegli chi firma il contratto. Alfa e Beta hanno ciascuna una coppia di chiavi: il titolare usa la chiave privata per firmare e il gestionale usa la chiave pubblica per verificare.",
  },
  {
    label: "Firma",
    title: "Allega la firma digitale",
    explanation:
      "L’algoritmo calcola un’impronta dei byte del contratto e usa la chiave privata per produrre la firma. Nella scena H₁ è l’impronta del documento originale e la firma è indicata da un’etichetta. Prova a cambiare il documento ricevuto oppure la chiave pubblica, lasciando intatta la firma.",
  },
  {
    label: "Verifica",
    title: "Controlla il documento e la firma",
    explanation:
      "Il gestionale ricalcola l’impronta del documento arrivato. L’algoritmo di verifica usa quell’impronta, la firma allegata e la chiave pubblica. Qui puoi vedere separatamente le due cause di un errore. Il prossimo controllo stabilisce a chi appartiene la chiave.",
  },
  {
    label: "Identità",
    title: "Collega la chiave a chi approva",
    explanation:
      "Il certificato associa la chiave pubblica a un’identità. Il gestionale controlla che la catena arrivi a un’autorità (CA) di cui si fida, che il certificato sia in corso di validità e che l’identità sia quella di Alfa. Poi consulta i permessi del gestionale per il contratto 42.",
  },
  {
    label: "Decisione",
    title: "Decidi se accettare l’approvazione",
    explanation:
      "Il gestionale accetta l’approvazione se la firma è valida, la chiave appartiene al firmatario atteso e il firmatario ha il permesso di approvare il contratto 42.",
  },
] as const satisfies readonly TutorialStep[];

const nextLabels = [
  "Firma il contratto",
  "Verifica la firma",
  "Verifica il certificato",
  "Valuta l’approvazione",
];

type Signer = keyof typeof signers;
type DocumentVersion = keyof typeof versions;
type Certificate = keyof typeof certificates;

export function SignatureLab() {
  const [step, setStep] = useState(0);
  const [signer, setSigner] = useState<Signer>("alfa");
  const [document, setDocument] = useState<DocumentVersion>("original");
  const [verificationKey, setVerificationKey] = useState<Signer>("alfa");
  const [certificate, setCertificate] = useState<Certificate>("trusted");
  const [hasPermission, setHasPermission] = useState(true);
  const sameDocument = document === "original";
  const signatureValid = sameDocument && verificationKey === signer;
  const trustedCertificate = certificate === "trusted";
  const identityConfirmed = trustedCertificate && verificationKey === "alfa";
  const identityOutcome = {
    trusted: identityConfirmed
      ? "Identità del certificato confermata"
      : "Firmatario atteso diverso",
    "unknown-ca": "Autorità non riconosciuta",
    expired: "Certificato scaduto",
  }[certificate];
  const accepted = signatureValid && identityConfirmed && hasPermission;
  const IdentityIcon = identityConfirmed ? BadgeCheck : BadgeX;

  function restart() {
    setStep(0);
    setSigner("alfa");
    setDocument("original");
    setVerificationKey("alfa");
    setCertificate("trusted");
    setHasPermission(true);
  }

  return (
    <TutorialFrame
      steps={steps}
      activeStep={step}
      onStepChange={setStep}
      nextLabel={nextLabels[step] ?? "Passo successivo"}
      actions={step === 4 ? <Button onClick={restart}>Prova un altro caso</Button> : null}
    >
      <div className="crypto-stage trust-stage">
        {step === 0 && (
          <div className="signature-inputs">
            <DocumentCard version="original" />
            <section className="crypto-node trust-node" aria-label="Firmatario del contratto">
              <div className="trust-node-heading">
                <KeyRound aria-hidden="true" />
                <h3>Chi firma</h3>
              </div>
              <label className="trust-field">
                Firmatario
                <select
                  value={signer}
                  onChange={(event) => {
                    const nextSigner = event.target.value as Signer;
                    setSigner(nextSigner);
                    setVerificationKey(nextSigner);
                  }}
                >
                  <option value="alfa">{signers.alfa.name}</option>
                  <option value="beta">{signers.beta.name}</option>
                </select>
              </label>
              <p className="trust-data">
                <KeyRound aria-hidden="true" /> Chiave privata {signers[signer].key}
              </p>
            </section>
          </div>
        )}

        {step === 1 && (
          <>
            <div className="signature-inputs">
              <DocumentCard version={document} received />
              <section className="crypto-node trust-node" aria-label="Firma allegata">
                <div className="trust-node-heading">
                  <FileSignature aria-hidden="true" />
                  <div>
                    <h3>Firma allegata</h3>
                    <p>Generata con la chiave privata {signers[signer].key}</p>
                  </div>
                </div>
                <p className="trust-data" data-state="active">
                  <Fingerprint aria-hidden="true" />
                  <span>Impronta al momento della firma</span>
                  <code>{versions.original.fingerprint}</code>
                </p>
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
              </section>
            </div>
            <div
              className="crypto-controls"
              role="group"
              aria-label="Versione del contratto ricevuto"
            >
              <Button
                variant={sameDocument ? "default" : "outline"}
                aria-pressed={sameDocument}
                onClick={() => setDocument("original")}
              >
                Originale
              </Button>
              <Button
                variant={sameDocument ? "outline" : "default"}
                aria-pressed={!sameDocument}
                onClick={() => setDocument("edited")}
              >
                Importo modificato
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="signature-results">
            <section
              className="crypto-node trust-node"
              aria-label="Verifica della firma"
              data-state={signatureValid ? "success" : "blocked"}
            >
              <div className="trust-node-heading">
                <Fingerprint aria-hidden="true" />
                <h3>Verifica della firma</h3>
              </div>
              <p className="trust-data">
                <span>Impronta originale e ricevuta</span>
                <code>
                  H₁ {sameDocument ? "=" : "≠"} {versions[document].fingerprint}
                </code>
              </p>
              <div className="trust-checks">
                <SignatureCheck
                  passed={sameDocument}
                  pass="Impronte uguali"
                  fail="Impronte diverse"
                />
                <SignatureCheck
                  passed={verificationKey === signer}
                  pass="Coppia di chiavi corretta"
                  fail="Chiave pubblica della coppia sbagliata"
                />
              </div>
              <p className="crypto-status" data-tone={signatureValid ? "good" : "warning"}>
                {signatureValid ? "Firma valida" : "Firma non valida"}
              </p>
            </section>
            <section className="crypto-node trust-node" aria-label="Certificato presentato">
              <div className="trust-node-heading">
                <FileText aria-hidden="true" />
                <h3>Certificato presentato</h3>
              </div>
              <p className="trust-data">
                <KeyRound aria-hidden="true" />
                Chiave pubblica {signers[verificationKey].key} · {signers[verificationKey].name}
              </p>
              <label className="trust-field">
                Stato del certificato
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
            </section>
          </div>
        )}

        {step === 3 && (
          <div className="signature-results">
            <section
              className="crypto-node trust-node"
              aria-label="Verifica dell’identità"
              data-state={identityConfirmed ? "success" : "blocked"}
            >
              <div className="trust-node-heading">
                <IdentityIcon aria-hidden="true" />
                <h3>Identità nel certificato</h3>
              </div>
              <div className="trust-checks">
                <span>
                  Chiave {signers[verificationKey].key} · {signers[verificationKey].name}
                </span>
                <span>Identità attesa · {signers.alfa.name}</span>
              </div>
              <p className="crypto-status" data-tone={identityConfirmed ? "good" : "warning"}>
                {identityOutcome}
              </p>
            </section>
            <section className="crypto-node trust-node" aria-label="Permessi del gestionale">
              <div className="trust-node-heading">
                <KeyRound aria-hidden="true" />
                <h3>Permesso di approvare</h3>
              </div>
              <p className="trust-data" data-state={hasPermission ? "active" : "blocked"}>
                {hasPermission
                  ? "Permesso concesso sul contratto 42"
                  : "Permesso negato sul contratto 42"}
              </p>
              <Button variant="outline" onClick={() => setHasPermission(!hasPermission)}>
                {hasPermission ? "Revoca il permesso" : "Concedi il permesso"}
              </Button>
            </section>
          </div>
        )}

        {step === 4 && (
          <section
            className="crypto-node trust-node"
            aria-label="Esito per il contratto 42"
            data-state={accepted ? "success" : "blocked"}
          >
            <div className="trust-checks">
              <SignatureCheck passed={signatureValid} pass="Firma valida" fail="Firma non valida" />
              <SignatureCheck
                passed={identityConfirmed}
                pass="Identità verificata e attesa"
                fail={identityOutcome}
              />
              <SignatureCheck
                passed={hasPermission}
                pass="Permesso concesso"
                fail="Permesso negato"
              />
            </div>
            <p className="crypto-status" data-tone={accepted ? "good" : "warning"}>
              {accepted ? "Approvazione accettata" : "Approvazione respinta"}
            </p>
            <p className="crypto-legend">
              {accepted
                ? "L’approvazione di Alfa viene registrata sul contratto 42."
                : !sameDocument
                  ? "Il documento è cambiato dopo la firma. L’approvazione non viene registrata."
                  : !signatureValid
                    ? "La chiave pubblica non corrisponde alla firma. L’approvazione non viene registrata."
                    : !identityConfirmed
                      ? "Il certificato non conferma l’identità attesa. L’approvazione non viene registrata."
                      : "Il gestionale richiede il permesso di approvare il contratto 42."}
            </p>
          </section>
        )}
      </div>
    </TutorialFrame>
  );
}

function DocumentCard({
  version,
  received = false,
}: {
  version: DocumentVersion;
  received?: boolean;
}) {
  return (
    <section
      className="crypto-node trust-node"
      aria-label={received ? "Documento ricevuto" : "Documento originale"}
    >
      <div className="trust-node-heading">
        <FileText aria-hidden="true" />
        <div>
          <h3>{received ? "Contratto 42 ricevuto" : "Contratto 42 originale"}</h3>
          <p>{versions[version].amount}</p>
        </div>
      </div>
      <p className="trust-data" data-state={version === "edited" ? "blocked" : "active"}>
        <Fingerprint aria-hidden="true" />
        <span>{received ? "Impronta del documento ricevuto" : "Impronta del documento"}</span>
        <code key={version}>{versions[version].fingerprint}</code>
      </p>
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
