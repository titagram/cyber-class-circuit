import { useId, useState, type KeyboardEvent } from "react";
import {
  ArrowRight,
  Ban,
  FileText,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  LockKeyholeOpen,
  Package,
  Shield,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { aeadCases, aeadEnvelope, integrityCases } from "@/content/lessons/chapter2-symmetric";
import "./SymmetricLabs.css";

const envelopeFields = {
  nonce: {
    label: "Nonce (IV)",
    definition: "Ogni nuova cifratura deve usare un nonce distinto per la stessa chiave.",
  },
  ciphertext: {
    label: "Ciphertext",
    definition: "Il contenuto cifrato è uno degli input della verifica del tag.",
  },
  tag: {
    label: "Tag",
    definition: "Il server verifica il tag usando la chiave, il nonce, il ciphertext e l’AAD.",
  },
  aad: {
    label: "Contesto AAD",
    definition: "Il tenant e il documento restano leggibili. Il tag li lega al ciphertext.",
  },
} as const;

const packetFields = ["nonce", "ciphertext", "tag"] as const;
type EnvelopeField = keyof typeof envelopeFields;
const browserTenant = new URLSearchParams(aeadEnvelope.aad).get("tenant");

export function AuthenticatedEncryptionLab() {
  const inspectorId = useId();
  const [sample, setSample] = useState<(typeof aeadCases)[number]>(aeadCases[0]);
  const [verified, setVerified] = useState(false);
  const [field, setField] = useState<EnvelopeField>("nonce");

  const alteredCiphertext = sample.id === "ciphertext";
  const alteredAad = sample.id === "aad";
  const serverTenant = new URLSearchParams(sample.serverAad).get("tenant") ?? "";
  const tenantOffset = sample.serverAad.indexOf(serverTenant);
  const originalByte = aeadEnvelope.ciphertext.slice(0, 2);
  const receivedByte = sample.receivedCiphertext.slice(0, 2);
  const outcome = verified ? (sample.accepted ? "success" : "blocked") : "waiting";
  const GateIcon = verified ? (sample.accepted ? ShieldCheck : ShieldX) : Shield;
  const DocumentIcon = outcome === "success" ? LockKeyholeOpen : LockKeyhole;

  return (
    <div className="crypto-symmetric">
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
              setField(option.id === "original" ? "nonce" : option.id);
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <section className="crypto-stage crypto-aead" aria-label="Apertura della busta AES-GCM">
        <div className="crypto-aead-flow">
          <div className="crypto-node crypto-aead-node" data-state="active">
            <h3 className="crypto-stage-label">Busta ricevuta</h3>
            <Package aria-hidden="true" className="crypto-aead-icon" />
            <div className="crypto-aead-fields" role="group" aria-label="Campi della busta">
              {packetFields.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="crypto-aead-field"
                  aria-pressed={field === id}
                  aria-controls={inspectorId}
                  data-changed={id === "ciphertext" && alteredCiphertext}
                  onClick={() => setField(id)}
                >
                  <span>
                    {envelopeFields[id].label}
                    {id === "ciphertext" && alteredCiphertext && (
                      <span className="sr-only"> alterato</span>
                    )}
                  </span>
                  <code>
                    {id === "ciphertext" && alteredCiphertext
                      ? `${originalByte} → ${receivedByte}`
                      : `${aeadEnvelope[id].length / 2} B`}
                  </code>
                </button>
              ))}
            </div>
          </div>

          <div className="crypto-aead-link" data-state="active" aria-hidden="true">
            <ArrowRight />
          </div>

          <div className="crypto-node crypto-aead-node" data-state={outcome}>
            <h3 className="crypto-stage-label">
              Server · AES-GCM
              <span className="crypto-aead-shared-key">Chiave condivisa con il browser</span>
            </h3>
            <GateIcon aria-hidden="true" className="crypto-aead-icon" />
            <button
              type="button"
              className="crypto-aead-field"
              aria-pressed={field === "aad"}
              aria-controls={inspectorId}
              data-changed={alteredAad}
              onClick={() => setField("aad")}
            >
              <span>{envelopeFields.aad.label}</span>
              <code>
                {browserTenant} → {serverTenant}
              </code>
            </button>
            <Button type="button" size="sm" onClick={() => setVerified(true)}>
              Verifica sul server
            </Button>
          </div>

          <div className="crypto-aead-link" data-state={outcome} aria-hidden="true">
            {outcome === "blocked" ? <Ban /> : <ArrowRight />}
          </div>

          <div className="crypto-node crypto-aead-node crypto-aead-document" data-state={outcome}>
            <h3 className="crypto-stage-label">Contratto 42</h3>
            <DocumentIcon key={outcome} aria-hidden="true" className="crypto-aead-icon" />
            <div className="crypto-aead-output" role="status" aria-atomic="true">
              {verified ? (
                <>
                  <p className="crypto-status" data-tone={sample.accepted ? "good" : "warning"}>
                    {sample.accepted ? "Accettato" : "Rifiutato"}
                  </p>
                  {sample.accepted ? (
                    <pre aria-label="Testo in chiaro restituito" className="crypto-aead-plaintext">
                      {aeadEnvelope.plaintext}
                    </pre>
                  ) : (
                    <p className="crypto-aead-message">Nessun testo in chiaro restituito.</p>
                  )}
                  <span className="sr-only">{sample.explanation}</span>
                </>
              ) : (
                <p className="crypto-aead-message">In attesa di verifica del tag.</p>
              )}
            </div>
          </div>
        </div>

        {verified && (
          <p className="crypto-aead-reason" aria-hidden="true">
            {sample.explanation}
          </p>
        )}

        <div id={inspectorId} className="crypto-legend crypto-aead-inspector">
          <div>
            <strong>{envelopeFields[field].label}</strong>
            <p>{envelopeFields[field].definition}</p>
          </div>
          {field === "aad" ? (
            <dl className="crypto-aead-aad">
              <div>
                <dt>Browser</dt>
                <dd>
                  <code>{aeadEnvelope.aad}</code>
                </dd>
              </div>
              <div>
                <dt>Server</dt>
                <dd>
                  <code>
                    {alteredAad ? (
                      <>
                        {sample.serverAad.slice(0, tenantOffset)}
                        <mark className="crypto-symmetric-mark">{serverTenant}</mark>
                        {sample.serverAad.slice(tenantOffset + serverTenant.length)}
                      </>
                    ) : (
                      sample.serverAad
                    )}
                  </code>
                </dd>
              </div>
            </dl>
          ) : (
            <code className="crypto-aead-value">
              {field === "ciphertext" && alteredCiphertext ? (
                <>
                  <mark className="crypto-symmetric-mark">{receivedByte}</mark>
                  {sample.receivedCiphertext.slice(2)}
                </>
              ) : (
                aeadEnvelope[field]
              )}
            </code>
          )}
        </div>
      </section>
    </div>
  );
}

const integrityMethods = [
  {
    id: "sha256",
    label: "SHA-256",
    matchStatus: "Impronte identiche",
    mismatchStatus: "Impronte diverse",
  },
  {
    id: "hmac",
    label: "HMAC-SHA-256",
    matchStatus: "Tag valido",
    mismatchStatus: "Tag non valido",
  },
] as const;

const bitMasks = [128, 64, 32, 16, 8, 4, 2, 1];

export function IntegrityLab() {
  const bytesId = useId();
  const inspectorId = useId();
  const [sample, setSample] = useState<(typeof integrityCases)[number]>(integrityCases[0]);
  const [method, setMethod] = useState<(typeof integrityMethods)[number]>(integrityMethods[0]);
  const [selectedByte, setSelectedByte] = useState(0);
  const reference = integrityCases[0];
  const useMac = method.id === "hmac";
  const MethodIcon = useMac ? KeyRound : Fingerprint;
  const bytes = Array.from({ length: 32 }, (_, index) => {
    const offset = index * 2;
    const expected = reference[method.id].slice(offset, offset + 2);
    const computed = sample[method.id].slice(offset, offset + 2);
    const xor = parseInt(expected, 16) ^ parseInt(computed, 16);
    const differences = bitMasks.map((mask) => Boolean(xor & mask));
    return { expected, computed, differences, count: differences.filter(Boolean).length };
  });
  const totalChanges = bytes.reduce((total, byte) => total + byte.count, 0);
  const matching = totalChanges === 0;
  const { expected, computed, differences, count } = bytes[selectedByte]!;

  function moveByte(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const grid = event.currentTarget.parentElement;
    if (!grid) return;
    const columns = Number(getComputedStyle(grid).getPropertyValue("--integrity-columns")) || 8;
    const positions: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      ArrowUp: index - columns,
      ArrowDown: index + columns,
      Home: 0,
      End: bytes.length - 1,
    };
    if (!Object.hasOwn(positions, event.key)) return;
    event.preventDefault();
    const next = Math.max(0, Math.min(bytes.length - 1, positions[event.key]!));
    setSelectedByte(next);
    document.getElementById(`${bytesId}-${next}`)?.focus();
  }

  return (
    <div className="crypto-symmetric">
      <div className="crypto-controls crypto-integrity-controls">
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
      </div>

      <section
        className="crypto-stage crypto-integrity"
        aria-label="Confronto delle impronte a 256 bit"
      >
        <div className="crypto-integrity-flow">
          <div
            className="crypto-integrity-messages"
            role="group"
            aria-label="Messaggi del contratto 42"
          >
            <IntegrityMessage label="Originale" message={reference.message} />
            <IntegrityMessage label="Ricevuto" message={sample.message} changed={sample.id} />
          </div>
          <ArrowRight className="crypto-integrity-arrow" aria-hidden="true" />
          <div
            className="crypto-node crypto-integrity-method"
            data-state={useMac ? "active" : undefined}
          >
            <MethodIcon aria-hidden="true" />
            <div>
              <strong>{method.label}</strong>
              <span>{useMac ? "Chiave condivisa" : "Solo il messaggio"}</span>
            </div>
          </div>
        </div>

        <div className="crypto-integrity-result">
          <div className="crypto-integrity-overview" role="status" aria-atomic="true">
            <h3 className="crypto-stage-label">Confronto bit per bit</h3>
            <div className="crypto-integrity-tally">
              <p className="crypto-status" data-tone={matching ? "good" : "warning"}>
                {matching ? method.matchStatus : method.mismatchStatus}
              </p>
              <span className="crypto-integrity-count">
                <strong>{totalChanges}</strong> / 256 bit diversi
              </span>
            </div>
          </div>

          <div className="crypto-integrity-comparison">
            <div
              className="crypto-integrity-matrix"
              role="group"
              aria-label="Seleziona un byte con le frecce"
            >
              {bytes.map((byte, index) => (
                <button
                  id={`${bytesId}-${index}`}
                  key={index}
                  type="button"
                  className="crypto-integrity-byte"
                  tabIndex={selectedByte === index ? 0 : -1}
                  aria-label={`Byte ${index + 1}, ${byte.count} ${byte.count === 1 ? "bit diverso" : "bit diversi"}`}
                  aria-pressed={selectedByte === index}
                  aria-controls={inspectorId}
                  onClick={() => setSelectedByte(index)}
                  onKeyDown={(event) => moveByte(event, index)}
                >
                  <span className="crypto-integrity-byte-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="crypto-integrity-bits" aria-hidden="true">
                    {byte.differences.map((changed, bit) => (
                      <span key={bit} className="crypto-integrity-bit" data-changed={changed} />
                    ))}
                  </span>
                </button>
              ))}
            </div>

            <div id={inspectorId} className="crypto-integrity-inspector" aria-live="polite">
              <div className="crypto-integrity-byte-header">
                <h4 className="crypto-stage-label">Byte {selectedByte + 1}</h4>
                <span>
                  {count} {count === 1 ? "bit diverso" : "bit diversi"}
                </span>
              </div>
              <dl>
                {(
                  [
                    { label: "Atteso", value: expected },
                    { label: "Calcolato", value: computed },
                  ] as const
                ).map(({ label, value }) => (
                  <div className="crypto-integrity-byte-row" key={label}>
                    <dt>{label}</dt>
                    <dd>
                      <code>0x{value.toUpperCase()}</code>
                    </dd>
                    <dd className="crypto-integrity-bit-values">
                      {bitMasks.map((mask, index) => (
                        <code key={mask} data-changed={differences[index]}>
                          {parseInt(value, 16) & mask ? "1" : "0"}
                        </code>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="crypto-legend crypto-integrity-legend">
          <span>
            <i className="crypto-integrity-bit" aria-hidden="true" /> Bit uguale
          </span>
          <span>
            <i className="crypto-integrity-bit" data-changed="true" aria-hidden="true" /> Bit
            diverso
          </span>
          <span>Seleziona un byte per confrontare i suoi 8 bit.</span>
        </div>
      </section>

      <details className="crypto-integrity-details">
        <summary>Valori completi e limiti della verifica</summary>
        <dl>
          <div>
            <dt>Valore atteso</dt>
            <dd className="crypto-readout">
              <code>{reference[method.id]}</code>
            </dd>
          </div>
          <div>
            <dt>Valore calcolato</dt>
            <dd className="crypto-readout">
              <code>{sample[method.id]}</code>
            </dd>
          </div>
        </dl>
        <p>
          {useMac
            ? "Mittente e destinatario condividono il segreto. Entrambi possono produrre un tag valido, quindi per attribuire il messaggio a una persona serve un altro meccanismo."
            : "Chiunque può calcolare SHA-256. Per fidarsi del confronto, il server deve ottenere l’impronta attesa da una fonte attendibile."}
        </p>
      </details>
    </div>
  );
}

function IntegrityMessage({
  label,
  message,
  changed,
}: {
  label: string;
  message: string;
  changed?: (typeof integrityCases)[number]["id"];
}) {
  const [documentField, amount = "", status = ""] = message.split("&");
  const [amountField, amountValue = ""] = amount.split("=");
  const [statusField, statusValue] = status.split("=");

  return (
    <div className="crypto-integrity-message">
      <span className="crypto-stage-label">
        <FileText aria-hidden="true" /> {label}
      </span>
      <code>
        <span>{documentField}&amp;</span>
        <span>
          {amountField}=
          {changed === "amount" ? (
            <>
              <mark className="crypto-symmetric-mark">{amountValue[0]}</mark>
              {amountValue.slice(1)}
            </>
          ) : (
            amountValue
          )}
          &amp;
        </span>
        <span>
          {statusField}=
          {changed === "status" ? (
            <mark className="crypto-symmetric-mark">{statusValue}</mark>
          ) : (
            statusValue
          )}
        </span>
      </code>
    </div>
  );
}
