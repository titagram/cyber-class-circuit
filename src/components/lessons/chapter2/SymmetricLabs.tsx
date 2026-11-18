import { useState, type ReactNode } from "react";
import { FileText, Fingerprint, KeyRound, Package, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HudNotice } from "@/design-system/nightrunner";
import { aeadCases, aeadEnvelope, integrityCases } from "@/content/lessons/chapter2-symmetric";

export function AuthenticatedEncryptionLab() {
  const [sample, setSample] = useState<(typeof aeadCases)[number]>(aeadCases[0]);
  const [verified, setVerified] = useState(false);

  return (
    <div className="space-y-4">
      <div className="crypto-controls" role="group" aria-label="Scenario AES-GCM">
        {aeadCases.map((option) => (
          <Button
            key={option.id}
            type="button"
            size="sm"
            variant={sample.id === option.id ? "default" : "outline"}
            aria-pressed={sample.id === option.id}
            onClick={() => {
              if (sample.id === option.id) return;
              setSample(option);
              setVerified(false);
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="crypto-grid">
        <section className="crypto-card space-y-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <Package aria-hidden="true" className="size-4 shrink-0 text-accent" />
            Busta ricevuta dal server
          </h3>
          <dl className="space-y-3">
            <CryptoField label="Nonce (IV)">{aeadEnvelope.nonce}</CryptoField>
            <CryptoField label="Ciphertext">
              {sample.id === "ciphertext" ? (
                <>
                  <mark className="bg-accent/20 font-bold text-accent">
                    {sample.receivedCiphertext.slice(0, 2)}
                  </mark>
                  {sample.receivedCiphertext.slice(2)}
                </>
              ) : (
                sample.receivedCiphertext
              )}
            </CryptoField>
            <CryptoField label="Tag di autenticazione">{aeadEnvelope.tag}</CryptoField>
          </dl>
        </section>
        <section className="crypto-card space-y-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-accent" />
            Apertura sul server
          </h3>
          <dl className="space-y-3">
            <CryptoField label="AAD usata dal browser">{aeadEnvelope.aad}</CryptoField>
            <CryptoField label="AAD attesa dal server">{sample.serverAad}</CryptoField>
          </dl>
          <p className="text-sm text-muted-foreground">
            Il tenant e l’identificativo del documento sono dati associati (AAD). Rimangono
            leggibili e il tag li lega al contenuto cifrato.
          </p>
          <div className="crypto-controls">
            <Button type="button" size="sm" onClick={() => setVerified(true)}>
              Verifica sul server
            </Button>
          </div>
          <div className="space-y-2" role="status" aria-atomic="true">
            {verified ? (
              <>
                <p className="crypto-status" data-tone={sample.accepted ? "good" : "warning"}>
                  {sample.accepted ? "Accettato" : "Rifiutato"}
                </p>
                <p className="text-sm text-muted-foreground">{sample.explanation}</p>
                {sample.accepted ? (
                  <pre aria-label="Testo in chiaro restituito" className="crypto-readout">
                    {aeadEnvelope.plaintext}
                  </pre>
                ) : (
                  <p className="text-sm">Nessun testo in chiaro restituito.</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">In attesa di verifica del tag.</p>
            )}
          </div>
        </section>
      </div>

      <HudNotice role="note">
        In ogni nuova cifratura AES-GCM il nonce deve essere unico per la chiave usata. La
        simulazione mostra una busta già cifrata e ripete la verifica della stessa busta.
      </HudNotice>
    </div>
  );
}

const integrityMethods = [
  {
    id: "sha256",
    label: "SHA-256",
    referenceLabel: "Impronta di riferimento",
    computedLabel: "Impronta ricalcolata",
    matchStatus: "Impronte identiche",
    mismatchStatus: "Impronte diverse",
  },
  {
    id: "hmac",
    label: "HMAC-SHA-256",
    referenceLabel: "Tag originale ricevuto",
    computedLabel: "Tag ricalcolato con la chiave condivisa",
    matchStatus: "Tag valido",
    mismatchStatus: "Tag non valido",
  },
] as const;

export function IntegrityLab() {
  const [sample, setSample] = useState<(typeof integrityCases)[number]>(integrityCases[0]);
  const [method, setMethod] = useState<(typeof integrityMethods)[number]>(integrityMethods[0]);
  const reference = integrityCases[0];
  const matching = sample[method.id] === reference[method.id];
  const useMac = method.id === "hmac";

  return (
    <div className="space-y-4">
      <p>
        Il server riceve un aggiornamento per il contratto 42. Cambia un campo del messaggio e
        confronta il valore ottenuto con quello del messaggio originale.
      </p>
      <div className="crypto-controls" role="group" aria-label="Messaggio del contratto">
        {integrityCases.map((option) => (
          <Button
            key={option.id}
            type="button"
            size="sm"
            variant={sample.id === option.id ? "default" : "outline"}
            aria-pressed={sample.id === option.id}
            onClick={() => setSample(option)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="crypto-grid">
        <section className="crypto-card space-y-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <FileText aria-hidden="true" className="size-4 shrink-0 text-accent" />
            Messaggio del contratto 42
          </h3>
          <dl className="space-y-3">
            <CryptoField label="Messaggio originale">{reference.message}</CryptoField>
            <CryptoField label="Messaggio ricevuto">{sample.message}</CryptoField>
          </dl>
          <p className="text-sm text-muted-foreground">{sample.explanation}</p>
        </section>
        <section className="crypto-card space-y-3">
          <h3 className="flex items-center gap-2 font-semibold">
            {useMac ? (
              <KeyRound aria-hidden="true" className="size-4 shrink-0 text-accent" />
            ) : (
              <Fingerprint aria-hidden="true" className="size-4 shrink-0 text-accent" />
            )}
            Verifica del messaggio
          </h3>
          <div className="crypto-controls" role="group" aria-label="Metodo di verifica">
            {integrityMethods.map((option) => (
              <Button
                key={option.id}
                type="button"
                size="sm"
                variant={method.id === option.id ? "default" : "outline"}
                aria-pressed={method.id === option.id}
                onClick={() => setMethod(option)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <dl className="space-y-3">
            <CryptoField label={method.referenceLabel}>{reference[method.id]}</CryptoField>
            <CryptoField label={method.computedLabel}>{sample[method.id]}</CryptoField>
          </dl>
          <div className="space-y-2" role="status" aria-atomic="true">
            <p className="crypto-status" data-tone={matching ? "good" : "warning"}>
              {matching ? method.matchStatus : method.mismatchStatus}
            </p>
            {useMac ? (
              <p className="text-sm text-muted-foreground">
                Mittente e destinatario condividono il segreto. Entrambi possono produrre un tag
                valido, quindi per attribuire il messaggio a una persona serve un altro meccanismo.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {sample.differentHashBits} bit su 256 diversi dall’impronta di riferimento.
                </p>
                <p className="text-sm text-muted-foreground">
                  Chiunque può calcolare SHA-256. Per fidarsi del confronto, il server deve ottenere
                  l’impronta attesa da una fonte attendibile.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function CryptoField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="crypto-label">{label}</dt>
      <dd className="crypto-readout">
        <code>{children}</code>
      </dd>
    </div>
  );
}
