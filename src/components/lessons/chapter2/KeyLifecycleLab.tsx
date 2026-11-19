import { useState } from "react";
import {
  ArrowRight,
  Archive as ArchiveIcon,
  Database,
  FileLock2,
  FileText,
  KeyRound,
  LockKeyhole,
  LockKeyholeOpen,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { contract } from "@/content/lessons/cybersecurity-1-3";
import { TutorialFrame, type TutorialStep } from "./TutorialFrame";
import "./TrustLabs.css";

type KeyVersion = 1 | 2;
type Archive = { ciphertext: string; dek: string; kekVersion: KeyVersion };
type RecoverySource = "Storage" | "Backup";
type RecoveryResult = "access-denied" | "key-disabled" | "recovered";
type Recovery = { archive: Archive; result: RecoveryResult };
type StorageChange = "rewrap" | "encrypt";

const originalArchive: Archive = { ciphertext: "CT-42A", dek: "DEK-A", kekVersion: 1 };
const archivesByChange: Record<StorageChange, Archive> = {
  rewrap: { ...originalArchive, kekVersion: 2 },
  encrypt: { ciphertext: "CT-42B", dek: "DEK-B", kekVersion: 2 },
};
const recoveryMessages = {
  "access-denied": "Accesso al KMS negato",
  "key-disabled": "KEK v1 disattivata",
  recovered: "Contratto recuperato",
} as const;

const steps = [
  {
    label: "Due chiavi",
    title: "Proteggi il contratto 42 prima di archiviarlo",
    explanation:
      "Il backend cifra i byte del contratto con una chiave per i dati, chiamata DEK. Il servizio di gestione delle chiavi (KMS) protegge la DEK cifrandola a sua volta con una chiave chiamata KEK. La KEK resta nel KMS.",
  },
  {
    label: "Copie",
    title: "La copia corrente e il backup partono uguali",
    explanation:
      "Lo storage e il backup conservano il file cifrato, la DEK cifrata e il riferimento alla versione della KEK usata. Queste etichette rappresentano le due parti della copia. Per recuperare il contratto, il backend deve poter usare la KEK indicata nella copia che sta aprendo.",
  },
  {
    label: "Rotazione",
    title: "Il KMS rende attiva una nuova versione",
    explanation:
      "Il KMS userà KEK v2 per le nuove cifrature delle DEK. Le copie esistenti indicano ancora KEK v1. Scegli come aggiornare lo storage e osserva quali valori cambiano. Il backup resta la fotografia del giorno in cui è stato creato.",
  },
  {
    label: "Condizioni",
    title: "Prepara il recupero dopo la rotazione",
    explanation:
      "Per aprire una copia servono due condizioni: il servizio di ripristino deve avere il permesso di usare il KMS e la versione della KEK indicata nella copia deve essere disponibile. Prova a disattivare la v1 oppure a revocare il permesso, poi confronta i ripristini.",
  },
  {
    label: "Ripristino",
    title: "Verifica se il contratto torna leggibile",
    explanation: (
      <p>
        Il servizio chiede al KMS di decifrare la DEK della copia scelta. Usa quella DEK per
        decifrare il file. Se il recupero riesce, il backend può restituire il contratto a una
        richiesta autorizzata <code>GET /api/documents/42</code>. Prova entrambe le copie e vedi
        dove si ferma il recupero quando manca un requisito.
      </p>
    ),
  },
] as const satisfies readonly TutorialStep[];

const nextLabels = [
  "Archivia le copie",
  "Ruota la KEK",
  "Prepara il ripristino",
  "Apri la prova di ripristino",
];

export function KeyLifecycleLab() {
  const [step, setStep] = useState(0);
  const [oldKekEnabled, setOldKekEnabled] = useState(true);
  const [kmsAccess, setKmsAccess] = useState(true);
  const [storageChange, setStorageChange] = useState<StorageChange>();
  const [selectedSource, setSelectedSource] = useState<RecoverySource>();
  const [recoveries, setRecoveries] = useState<Partial<Record<RecoverySource, Recovery>>>({});
  const storage = storageChange ? archivesByChange[storageChange] : originalArchive;
  const recovery = selectedSource ? recoveries[selectedSource] : undefined;

  function changeStep(next: number) {
    setRecoveries({});
    setSelectedSource(undefined);
    if (next < 3) {
      setKmsAccess(true);
      setOldKekEnabled(true);
    }
    if (next < 2) setStorageChange(undefined);
    setStep(next);
  }

  function recover(source: RecoverySource, archive: Archive) {
    const result = !kmsAccess
      ? "access-denied"
      : archive.kekVersion === 1 && !oldKekEnabled
        ? "key-disabled"
        : "recovered";
    setSelectedSource(source);
    setRecoveries((previous) => ({ ...previous, [source]: { archive, result } }));
  }

  return (
    <TutorialFrame
      steps={steps}
      activeStep={step}
      onStepChange={changeStep}
      canAdvance={step !== 2 || Boolean(storageChange)}
      nextLabel={nextLabels[step] ?? "Passo successivo"}
      actions={
        step === 4 ? (
          <>
            <Button variant="outline" onClick={() => changeStep(0)}>
              Ricomincia il percorso
            </Button>
            <Button onClick={() => changeStep(3)}>Cambia le condizioni</Button>
          </>
        ) : null
      }
    >
      <div className="crypto-stage trust-stage">
        {step === 0 && (
          <div className="kms-archives">
            <section className="crypto-node trust-node" aria-label="Cifratura del contratto">
              <div className="trust-node-heading">
                <FileLock2 aria-hidden="true" />
                <h3>File cifrato</h3>
              </div>
              <p className="trust-data">
                <FileText aria-hidden="true" /> Contratto 42 · {contract.amount}
              </p>
              <p className="trust-data">
                <KeyRound aria-hidden="true" /> DEK-A <ArrowRight aria-hidden="true" />{" "}
                <code>CT-42A</code>
              </p>
            </section>
            <section className="crypto-node trust-node" aria-label="Cifratura della DEK">
              <div className="trust-node-heading">
                <LockKeyhole aria-hidden="true" />
                <h3>DEK cifrata</h3>
              </div>
              <p className="trust-data">
                <KeyRound aria-hidden="true" /> KEK v1 rimane nel KMS
              </p>
              <p className="trust-data">
                <LockKeyhole aria-hidden="true" /> <code>DEK-A cifrata con KEK v1</code>
              </p>
            </section>
          </div>
        )}

        {step >= 1 && step <= 3 && (
          <section className="crypto-node trust-node kms-vault" aria-label="Chiavi nel KMS">
            <div className="trust-node-heading">
              <LockKeyhole aria-hidden="true" />
              <h3>Versioni nel KMS</h3>
            </div>
            <div className="kms-versions" aria-live="polite">
              <div className="trust-data" data-state={oldKekEnabled ? "active" : "blocked"}>
                <KeyRound aria-hidden="true" /> <strong>KEK v1</strong>
                <span>
                  {step === 1
                    ? "Attiva"
                    : oldKekEnabled
                      ? "Disponibile per il recupero"
                      : "Disattivata"}
                </span>
              </div>
              <div className="trust-data" data-state={step >= 2 ? "active" : undefined}>
                <KeyRound aria-hidden="true" /> <strong>KEK v2</strong>
                <span>{step >= 2 ? "Attiva per le nuove DEK" : "Non ancora attiva"}</span>
              </div>
            </div>
          </section>
        )}

        {(step === 1 || step === 2 || step === 4) && (
          <div className="kms-archives">
            <ArchiveCard
              title="Object storage"
              archive={storage}
              change={storageChange}
              selected={selectedSource === "Storage"}
              action={
                step === 4
                  ? { label: "Recupera dallo storage", onClick: () => recover("Storage", storage) }
                  : undefined
              }
            />
            <ArchiveCard
              title="Backup storico"
              archive={originalArchive}
              historic
              selected={selectedSource === "Backup"}
              action={
                step === 4
                  ? {
                      label: "Recupera dal backup",
                      onClick: () => recover("Backup", originalArchive),
                    }
                  : undefined
              }
            />
          </div>
        )}

        {step === 2 && (
          <div className="kms-operation">
            <div
              className="crypto-controls"
              role="group"
              aria-label="Aggiornamento della copia corrente"
            >
              <Button
                variant={storageChange === "rewrap" ? "default" : "outline"}
                aria-pressed={storageChange === "rewrap"}
                onClick={() => setStorageChange("rewrap")}
              >
                Ricifra la DEK dello storage
              </Button>
              <Button
                variant={storageChange === "encrypt" ? "default" : "outline"}
                aria-pressed={storageChange === "encrypt"}
                onClick={() => setStorageChange("encrypt")}
              >
                Cifra il file con una nuova DEK
              </Button>
            </div>
            <p aria-live="polite">
              {storageChange === "rewrap"
                ? "Rewrap: il KMS apre DEK-A con KEK v1 e la cifra con KEK v2. Il file CT-42A resta identico."
                : storageChange === "encrypt"
                  ? "Nuova DEK: il backend recupera il contratto con DEK-A, lo cifra con DEK-B e protegge la nuova DEK con KEK v2."
                  : "Per proseguire, scegli come aggiornare la copia corrente."}
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="kms-recovery">
            <p className="trust-data" data-state={kmsAccess ? "active" : "blocked"} role="status">
              {kmsAccess
                ? "Il servizio di ripristino ha accesso al KMS."
                : "Il servizio di ripristino non ha accesso al KMS."}
            </p>
            <div className="crypto-controls" role="group" aria-label="Condizioni di ripristino">
              <Button variant="outline" onClick={() => setOldKekEnabled(!oldKekEnabled)}>
                {oldKekEnabled ? "Disattiva KEK v1" : "Riattiva KEK v1"}
              </Button>
              <Button variant="outline" onClick={() => setKmsAccess(!kmsAccess)}>
                {kmsAccess ? "Revoca accesso al KMS" : "Ripristina accesso al KMS"}
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <section className="kms-recovery" aria-label="Prova di recupero">
            <h3 className="crypto-stage-label">Percorso di recupero</h3>
            <div aria-live="polite">
              <RecoveryPath recovery={recovery} kmsAccess={kmsAccess} />
              {(["Storage", "Backup"] as const).map((source) => {
                const attempted = recoveries[source];
                return attempted ? (
                  <p
                    key={source}
                    className="crypto-legend"
                    data-state={attempted.result === "recovered" ? "success" : "blocked"}
                  >
                    {source} · {recoveryMessages[attempted.result]}
                  </p>
                ) : null;
              })}
              {recovery?.result === "recovered" && (
                <p className="trust-data kms-recovered-file">
                  <FileText aria-hidden="true" />
                  <code>Contratto 42 · {contract.amount}</code>
                </p>
              )}
              {!recovery && <p className="crypto-legend">Scegli una copia da recuperare.</p>}
            </div>
          </section>
        )}
      </div>
    </TutorialFrame>
  );
}

function ArchiveCard({
  title,
  archive,
  change,
  selected,
  historic = false,
  action,
}: {
  title: string;
  archive: Archive;
  change?: StorageChange | undefined;
  selected: boolean;
  historic?: boolean;
  action?: { label: string; onClick: () => void } | undefined;
}) {
  const Icon = historic ? ArchiveIcon : Database;

  return (
    <section
      className="crypto-node trust-node"
      aria-label={title}
      data-state={selected ? "active" : undefined}
    >
      <div className="trust-node-heading">
        <Icon aria-hidden="true" />
        <div>
          <h3>{title}</h3>
          <p>{historic ? "Copia storica" : "Copia corrente"}</p>
        </div>
      </div>
      <div className="kms-archive-values" aria-live="polite">
        <p className="trust-data" data-state={change === "encrypt" ? "active" : undefined}>
          <FileLock2 aria-hidden="true" /> <span>File cifrato</span>{" "}
          <code>{archive.ciphertext}</code>
        </p>
        <p className="trust-data" data-state={change ? "active" : undefined}>
          <LockKeyhole aria-hidden="true" />{" "}
          <code>
            {archive.dek} cifrata con KEK v{archive.kekVersion}
          </code>
        </p>
      </div>
      {action && (
        <Button variant={selected ? "default" : "outline"} onClick={action.onClick}>
          {action.label} <ArrowRight aria-hidden="true" />
        </Button>
      )}
    </section>
  );
}

function RecoveryPath({
  recovery,
  kmsAccess,
}: {
  recovery: Recovery | undefined;
  kmsAccess: boolean;
}) {
  const kekVersion = recovery?.archive.kekVersion;
  const accessDenied = recovery?.result === "access-denied";
  const keyDisabled = recovery?.result === "key-disabled";
  const recovered = recovery?.result === "recovered";
  const AccessIcon = accessDenied ? ShieldX : ShieldCheck;
  const FileIcon = recovered ? FileText : FileLock2;
  const KeyIcon = recovered ? LockKeyholeOpen : LockKeyhole;

  return (
    <ol className="kms-path" aria-label="Percorso di recupero">
      <li
        className="crypto-node trust-node"
        data-state={accessDenied ? "blocked" : recovery ? "success" : undefined}
      >
        <AccessIcon aria-hidden="true" />
        <div>
          <strong>Accesso al KMS</strong>
          <span>
            {recovery
              ? kmsAccess
                ? "Permesso concesso"
                : "Permesso negato"
              : "In attesa della prova"}
          </span>
        </div>
      </li>
      <li
        className="crypto-node trust-node"
        data-state={keyDisabled ? "blocked" : recovered ? "success" : undefined}
      >
        <KeyIcon aria-hidden="true" />
        <div>
          <strong>Decifratura della DEK</strong>
          <span>
            {!recovery && "Versione della KEK indicata nella copia"}
            {accessDenied && `KEK v${kekVersion} non raggiunta`}
            {keyDisabled && `KEK v${kekVersion} disattivata`}
            {recovered && `KEK v${kekVersion} → ${recovery.archive.dek}`}
          </span>
        </div>
      </li>
      <li className="crypto-node trust-node" data-state={recovered ? "success" : undefined}>
        <FileIcon aria-hidden="true" />
        <div>
          <strong>Contratto 42</strong>
          <span>{recovered ? "In chiaro" : "Resta cifrato"}</span>
        </div>
      </li>
    </ol>
  );
}
