import { useState } from "react";
import {
  ArrowDown,
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
import "./TrustLabs.css";

type KeyVersion = 1 | 2;
type Archive = { ciphertext: string; dek: string; kekVersion: KeyVersion };
type RecoverySource = "Storage" | "Backup";
type RecoveryResult = "access-denied" | "key-disabled" | "recovered";
type Recovery = { source: RecoverySource; archive: Archive; result: RecoveryResult };
type StorageChange = "rewrap" | "encrypt";

const originalArchive: Archive = { ciphertext: "CT-42A", dek: "DEK-A", kekVersion: 1 };
const recoveryMessages = {
  "access-denied": "Accesso al KMS negato",
  "key-disabled": "KEK v1 disattivata",
  recovered: "Contratto recuperato",
};

export function KeyLifecycleLab() {
  const [activeKek, setActiveKek] = useState<KeyVersion>(1);
  const [oldKekEnabled, setOldKekEnabled] = useState(true);
  const [kmsAccess, setKmsAccess] = useState(true);
  const [storage, setStorage] = useState(originalArchive);
  const [storageChange, setStorageChange] = useState<StorageChange | null>(null);
  const [recovery, setRecovery] = useState<Recovery | null>(null);

  const storageKeyEnabled = storage.kekVersion === 2 || oldKekEnabled;
  const canRewrap = storage.kekVersion !== activeKek && storageKeyEnabled && kmsAccess;
  const canReplaceDek = storageKeyEnabled && kmsAccess && storage.dek === originalArchive.dek;

  function recover(source: RecoverySource, archive: Archive) {
    const result = !kmsAccess
      ? "access-denied"
      : archive.kekVersion === 1 && !oldKekEnabled
        ? "key-disabled"
        : "recovered";

    setRecovery({ source, archive, result });
  }

  return (
    <section
      className="crypto-stage trust-stage"
      aria-label="Laboratorio del ciclo di vita delle chiavi"
    >
      <header className="crypto-stage-label">KMS e copie del contratto</header>
      <section className="crypto-node trust-node kms-vault" aria-label="Chiavi nel KMS">
        <div className="trust-node-heading">
          <LockKeyhole aria-hidden="true" />
          <h3>Servizio di gestione delle chiavi (KMS)</h3>
        </div>
        <div className="kms-versions" aria-live="polite">
          <div className="trust-data" data-state={oldKekEnabled ? "active" : "blocked"}>
            {oldKekEnabled ? <KeyRound aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
            <strong>KEK v1</strong>
            <span>
              {activeKek === 1
                ? "Nuovi avvolgimenti"
                : oldKekEnabled
                  ? "Disponibile"
                  : "Disattivata"}
            </span>
          </div>
          <div className="trust-data" data-state={activeKek === 2 ? "active" : undefined}>
            {activeKek === 2 ? <KeyRound aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
            <strong>KEK v2</strong>
            <span>{activeKek === 2 ? "Nuovi avvolgimenti" : "Non ancora attiva"}</span>
          </div>
        </div>
        <div className="crypto-controls">
          <Button
            size="sm"
            disabled={activeKek === 2}
            onClick={() => {
              setActiveKek(2);
              setRecovery(null);
            }}
          >
            Ruota la KEK
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={activeKek === 1}
            onClick={() => {
              setOldKekEnabled((current) => !current);
              setRecovery(null);
            }}
          >
            {oldKekEnabled ? "Disattiva KEK v1" : "Riattiva KEK v1"}
          </Button>
        </div>
      </section>

      <div className="signature-join" data-arrows="split" aria-hidden="true">
        <ArrowDown />
        <ArrowDown />
      </div>

      <div className="kms-archives">
        <ArchiveCard
          title="Object storage"
          archive={storage}
          change={storageChange}
          recoverLabel="Recupera dallo storage"
          selected={recovery?.source === "Storage"}
          onRecover={() => recover("Storage", storage)}
        />
        <ArchiveCard
          title="Backup storico"
          archive={originalArchive}
          historic
          recoverLabel="Recupera dal backup"
          selected={recovery?.source === "Backup"}
          onRecover={() => recover("Backup", originalArchive)}
        />
      </div>

      <div className="kms-operation">
        <div
          className="crypto-controls"
          role="group"
          aria-label="Modifica della cifratura nello storage"
        >
          <Button
            size="sm"
            variant="outline"
            disabled={!canRewrap}
            onClick={() => {
              setStorage((archive) => ({ ...archive, kekVersion: activeKek }));
              setStorageChange("rewrap");
              setRecovery(null);
            }}
          >
            Ricifra la DEK dello storage
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!canReplaceDek}
            onClick={() => {
              setStorage({ ciphertext: "CT-42B", dek: "DEK-B", kekVersion: activeKek });
              setStorageChange("encrypt");
              setRecovery(null);
            }}
          >
            Cifra il file con una nuova DEK
          </Button>
        </div>
        <p aria-live="polite">
          {storageChange === "rewrap" &&
            "Rewrap · cambia la KEK che protegge la DEK. Il file cifrato resta identico."}
          {storageChange === "encrypt" &&
            "Nuova DEK · cambiano la chiave del file e il file cifrato."}
        </p>
      </div>

      <section className="kms-recovery" aria-label="Prova di recupero">
        <div className="kms-recovery-heading">
          <h3 className="crypto-label">Prova di recupero</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setKmsAccess((current) => !current);
              setRecovery(null);
            }}
          >
            {kmsAccess ? "Revoca accesso al KMS" : "Ripristina accesso al KMS"}
          </Button>
        </div>

        <div aria-live="polite">
          <RecoveryPath recovery={recovery} kmsAccess={kmsAccess} />
          <p
            className="crypto-legend"
            data-state={
              recovery?.result === "recovered" ? "success" : recovery ? "blocked" : undefined
            }
          >
            {recovery
              ? `${recovery.source} · ${recoveryMessages[recovery.result]}`
              : "Scegli una copia da recuperare."}
          </p>
        </div>
      </section>
      <p className="crypto-legend">
        La DEK cifra il file. La KEK protegge la DEK e rimane nel KMS.
      </p>
    </section>
  );
}

function ArchiveCard({
  title,
  archive,
  change,
  selected,
  historic = false,
  recoverLabel,
  onRecover,
}: {
  title: string;
  archive: Archive;
  change?: StorageChange | null;
  selected: boolean;
  historic?: boolean;
  recoverLabel: string;
  onRecover: () => void;
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
          <FileLock2 aria-hidden="true" />
          <span>File cifrato</span>
          <code>{archive.ciphertext}</code>
        </p>
        <p className="trust-data" data-state={change ? "active" : undefined}>
          <LockKeyhole aria-hidden="true" />
          <code>
            {archive.dek} cifrata con KEK v{archive.kekVersion}
          </code>
        </p>
      </div>
      <Button size="sm" variant={selected ? "default" : "outline"} onClick={onRecover}>
        {recoverLabel} <ArrowRight aria-hidden="true" />
      </Button>
    </section>
  );
}

function RecoveryPath({ recovery, kmsAccess }: { recovery: Recovery | null; kmsAccess: boolean }) {
  const kekVersion = recovery?.archive.kekVersion;
  const accessDenied = recovery?.result === "access-denied";
  const keyDisabled = recovery?.result === "key-disabled";
  const recovered = recovery?.result === "recovered";
  const AccessIcon = kmsAccess ? ShieldCheck : ShieldX;
  const FileIcon = recovered ? FileText : FileLock2;
  const KeyIcon = recovered ? LockKeyholeOpen : LockKeyhole;

  return (
    <ol className="kms-path" aria-label="Percorso di recupero">
      <li
        className="crypto-node trust-node"
        data-state={kmsAccess ? (recovery ? "success" : "active") : "blocked"}
      >
        <AccessIcon aria-hidden="true" />
        <div>
          <strong>Accesso al KMS</strong>
          <span>{kmsAccess ? "Permesso concesso" : "Permesso negato"}</span>
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
