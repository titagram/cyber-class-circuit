import { useState } from "react";
import { Button } from "@/components/ui/button";

type KeyVersion = 1 | 2;
type Archive = { ciphertext: string; dek: string; kekVersion: KeyVersion };
type RecoverySource = "Storage" | "Backup";
type Recovery = { source: RecoverySource; message: string; recovered: boolean };

const originalArchive: Archive = { ciphertext: "CT-42A", dek: "DEK-A", kekVersion: 1 };

export function KeyLifecycleLab() {
  const [activeKek, setActiveKek] = useState<KeyVersion>(1);
  const [oldKekEnabled, setOldKekEnabled] = useState(true);
  const [kmsAccess, setKmsAccess] = useState(true);
  const [storage, setStorage] = useState(originalArchive);
  const [recovery, setRecovery] = useState<Recovery | null>(null);

  const storageKeyEnabled = storage.kekVersion === 2 || oldKekEnabled;
  const canRewrap = storage.kekVersion !== activeKek && storageKeyEnabled && kmsAccess;
  const canReplaceDek = storageKeyEnabled && kmsAccess && storage.dek === originalArchive.dek;

  function recover(source: RecoverySource, archive: Archive) {
    if (!kmsAccess) {
      setRecovery({ source, message: "Accesso al KMS negato", recovered: false });
      return;
    }
    if (archive.kekVersion === 1 && !oldKekEnabled) {
      setRecovery({ source, message: "KEK v1 disattivata", recovered: false });
      return;
    }
    setRecovery({ source, message: "Contratto recuperato", recovered: true });
  }

  return (
    <div className="space-y-4">
      <section className="crypto-card space-y-3" aria-label="Chiavi nel KMS">
        <h3 className="crypto-label">Servizio di gestione delle chiavi (KMS)</h3>
        <div className="crypto-grid" aria-live="polite">
          <p className="crypto-readout">Nuovi avvolgimenti · KEK v{activeKek}</p>
          <p className="crypto-readout">KEK v1 · {oldKekEnabled ? "disponibile" : "disattivata"}</p>
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
        <p className="crypto-status" data-tone={kmsAccess ? "good" : "warning"} aria-live="polite">
          Backend · {kmsAccess ? "accesso al KMS concesso" : "accesso al KMS revocato"}
        </p>
      </section>

      <div className="crypto-grid">
        <ArchiveCard
          title="Object storage"
          archive={storage}
          recoverLabel="Recupera dallo storage"
          onRecover={() => recover("Storage", storage)}
        />
        <ArchiveCard
          title="Backup storico"
          archive={originalArchive}
          recoverLabel="Recupera dal backup"
          onRecover={() => recover("Backup", originalArchive)}
        />
      </div>

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
            setStorage({ ...storage, kekVersion: activeKek });
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
            setRecovery(null);
          }}
        >
          Cifra il file con una nuova DEK
        </Button>
      </div>

      <div role="status" className="crypto-card space-y-2">
        <p className="crypto-label">Prova di recupero</p>
        {recovery ? (
          <>
            <p className="crypto-status" data-tone={recovery.recovered ? "good" : "warning"}>
              {recovery.source} · {recovery.message}
            </p>
            <p className="text-sm text-muted-foreground">
              {recovery.recovered
                ? "Il KMS decifra la DEK con la versione di KEK indicata. Con la DEK il backend decifra il file."
                : "Il backend non riesce a recuperare la DEK e il file resta cifrato."}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Scegli da quale copia recuperare il contratto 42.
          </p>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        La DEK (Data Encryption Key) cifra il file. La KEK (Key Encryption Key) protegge la DEK e
        resta nel KMS. Ruotare la KEK cambia la versione predefinita per le nuove cifrature.
        Ricifrare la DEK (rewrap) mantiene intatto il file cifrato. Il backup storico conserva la
        propria copia della DEK cifrata e dipende ancora dalla KEK v1.
      </p>
    </div>
  );
}

function ArchiveCard({
  title,
  archive,
  recoverLabel,
  onRecover,
}: {
  title: string;
  archive: Archive;
  recoverLabel: string;
  onRecover: () => void;
}) {
  return (
    <section className="crypto-card space-y-3" aria-label={title}>
      <h3 className="crypto-label">{title}</h3>
      <div className="space-y-1" aria-live="polite">
        <p className="crypto-readout">Contratto 42 cifrato · {archive.ciphertext}</p>
        <p className="crypto-readout">
          {archive.dek} cifrata con KEK v{archive.kekVersion}
        </p>
      </div>
      <Button size="sm" onClick={onRecover}>
        {recoverLabel}
      </Button>
    </section>
  );
}
