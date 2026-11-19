import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { ArrowRight, FileText, Fingerprint, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { integrityCases } from "@/content/lessons/chapter2-symmetric";
import { TutorialFrame, type TutorialStep } from "./TutorialFrame";
import "./SymmetricLabs.css";
import "./IntegrityLab.css";

type IntegrityCase = (typeof integrityCases)[number];
type Method = "sha256" | "hmac";

const original = integrityCases[0];
const bitsPerByte = [128, 64, 32, 16, 8, 4, 2, 1];

const receiveStep: TutorialStep = {
  label: "Copia ricevuta",
  title: "Scegli quale copia arriva al server",
  explanation:
    "Confronta il testo ricevuto con quello originale. Prova a sostituire una sola cifra dell’importo e osserva fin dove si propagherà la differenza.",
};

const shaSteps = [
  {
    label: "Originale",
    title: "Che cosa deve arrivare intatto?",
    explanation:
      "Il server ha già accesso alla versione approvata del contratto 42. In seguito ne riceverà una copia. Per verificare che i dati siano ancora gli stessi, gli serve un riferimento ricavato dai byte della versione approvata.",
  },
  {
    label: "Riferimento",
    title: "Ricava l’impronta dall’originale",
    explanation:
      "SHA-256 è una funzione di hash. Aggiunge bit di riempimento per formare blocchi da 512 bit. Qui ne basta uno. L’algoritmo mescola i dati di ogni blocco in uno stato interno e restituisce un’impronta di 256 bit. Il server la conserva in un archivio attendibile.",
  },
  receiveStep,
  {
    label: "Ricalcolo",
    title: "Calcola l’impronta sui byte arrivati",
    explanation:
      "Il server applica lo stesso SHA-256 ai byte del testo ricevuto, compresi i numeri, le lettere e i separatori. Il risultato è l’impronta della copia. Ora puoi confrontarla con quella salvata.",
  },
  {
    label: "Confronto",
    title: "Confronta l’impronta salvata con quella ricalcolata",
    explanation:
      "Il server confronta i risultati bit per bit. Le caselle gialle indicano dove i valori differiscono. Ogni gruppo è un byte, cioè 8 bit. Selezionane uno per leggere gli 0 e gli 1.",
  },
] as const satisfies readonly TutorialStep[];

const hmacSteps = [
  {
    label: "Originale",
    title: "Riparti dallo stesso contratto con una chiave condivisa",
    explanation:
      "Il mittente e il server hanno già la stessa chiave, un valore segreto noto a entrambi. La useranno con i byte del contratto per produrre e verificare un codice di autenticazione.",
  },
  {
    label: "Tag del mittente",
    title: "Il mittente genera un tag per il contratto",
    explanation:
      "HMAC-SHA-256 applica SHA-256 due volte. La prima usa il testo e la chiave combinata con una sequenza fissa di byte. La seconda usa il primo risultato e la stessa chiave combinata con una sequenza diversa. Ottiene così il tag, un codice di autenticazione di 256 bit che il mittente allega al contratto.",
  },
  {
    ...receiveStep,
    explanation:
      "In questo esempio puoi variare i byte del contratto. Il server riceve anche il tag prodotto dal mittente, che resta lo stesso in tutte e tre le prove.",
  },
  {
    label: "Ricalcolo",
    title: "Il server genera il suo tag sui byte arrivati",
    explanation:
      "Il server applica HMAC-SHA-256 ai byte della copia ricevuta. Usa la chiave che condivide già con il mittente e ottiene il tag da confrontare con quello allegato.",
  },
  {
    label: "Confronto",
    title: "Confronta il tag ricevuto con quello ricalcolato",
    explanation:
      "Il tag è valido se i due valori coincidono in tutti i 256 bit. Ogni gruppo della mappa rappresenta 8 bit. Selezionane uno per vedere quali 0 o 1 coincidono e quali differiscono.",
  },
] as const satisfies readonly TutorialStep[];

export function IntegrityLab() {
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<Method>("sha256");
  const [sample, setSample] = useState<IntegrityCase>();
  const useMac = method === "hmac";
  const steps = useMac ? hmacSteps : shaSteps;
  const nextLabels = [
    useMac ? "Genera il tag del mittente" : "Calcola l’impronta originale",
    "Passa alla ricezione",
    useMac ? "Ricalcola il tag sulla copia" : "Calcola l’impronta della copia",
    useMac ? "Verifica il tag ricevuto" : "Confronta le impronte",
  ];

  function switchMethod() {
    setMethod(useMac ? "sha256" : "hmac");
    setSample(undefined);
    setStep(0);
  }

  return (
    <div data-integrity-mode={method} data-integrity-step={step + 1}>
      <TutorialFrame
        steps={steps}
        activeStep={step}
        onStepChange={setStep}
        nextLabel={nextLabels[step] ?? "Passo successivo"}
        canAdvance={step !== 2 || sample !== undefined}
        actions={
          step === 4 ? (
            <>
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Prova un’altra copia
              </Button>
              <Button type="button" onClick={switchMethod}>
                {useMac ? "Riparti con SHA-256" : "Ripeti con HMAC"}
              </Button>
            </>
          ) : null
        }
      >
        {step === 0 ? (
          <div className="crypto-integrity-stage">
            <IntegrityMessage label="Originale" sample={original} />
            <MessageBytes message={original.message} />
            <p className="crypto-integrity-note">
              Un bit vale 0 oppure 1. Un byte raggruppa 8 bit. La codifica UTF-8 usa un byte per
              ciascun carattere di questo testo, compresi i separatori <code>&amp;</code> e{" "}
              <code>=</code>.
            </p>
          </div>
        ) : null}

        {step === 1 ? (
          <IntegrityCalculation
            method={method}
            sample={original}
            messageLabel="Originale"
            resultLabel={useMac ? "Tag allegato dal mittente" : "Impronta salvata dal server"}
          />
        ) : null}

        {step === 2 ? (
          <div className="crypto-integrity-stage">
            <div className="crypto-controls" role="group" aria-label="Copia del contratto ricevuta">
              {integrityCases.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  size="sm"
                  variant={sample?.id === option.id ? "default" : "outline"}
                  aria-pressed={sample?.id === option.id}
                  data-integrity-variant={option.id}
                  onClick={() => setSample(option)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="crypto-integrity-messages" aria-live="polite">
              <IntegrityMessage label="Originale" sample={original} />
              {sample ? <IntegrityMessage label="Ricevuto" sample={sample} /> : null}
              {sample ? <p className="crypto-integrity-note">{sample.explanation}</p> : null}
            </div>
          </div>
        ) : null}

        {step === 3 && sample ? (
          <IntegrityCalculation
            method={method}
            sample={sample}
            messageLabel="Ricevuto"
            resultLabel={useMac ? "Tag ricalcolato" : "Impronta della copia"}
          />
        ) : null}

        {step === 4 && sample ? <IntegrityComparison method={method} sample={sample} /> : null}
      </TutorialFrame>
    </div>
  );
}

function MessageBytes({ message }: { message: string }) {
  const bytes = new TextEncoder().encode(message);
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(" ");

  return (
    <dl className="crypto-integrity-values">
      <div>
        <dt className="crypto-label">{bytes.length} byte UTF-8 in esadecimale</dt>
        <dd className="crypto-readout">
          <code>{hex}</code>
        </dd>
      </div>
    </dl>
  );
}

function IntegrityCalculation({
  method,
  sample,
  messageLabel,
  resultLabel,
}: {
  method: Method;
  sample: IntegrityCase;
  messageLabel: string;
  resultLabel: string;
}) {
  const useMac = method === "hmac";
  const MethodIcon = useMac ? KeyRound : Fingerprint;

  return (
    <div className="crypto-integrity-stage">
      <IntegrityMessage label={messageLabel} sample={sample} />
      <MessageBytes message={sample.message} />
      <div className="crypto-integrity-operation">
        <div className="crypto-node crypto-integrity-method">
          <MethodIcon aria-hidden="true" />
          <div>
            <strong>{useMac ? "HMAC-SHA-256" : "SHA-256"}</strong>
            <span>
              {useMac
                ? "Testo e chiave, due passaggi di hash"
                : "Byte del testo → blocco da 512 bit → 256 bit"}
            </span>
          </div>
        </div>
        <ArrowRight className="crypto-integrity-arrow" aria-hidden="true" />
        <dl className="crypto-integrity-values">
          <IntegrityValue label={resultLabel} value={sample[method]} />
        </dl>
      </div>
    </div>
  );
}

function IntegrityValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="crypto-label">{label}</dt>
      <dd className="crypto-readout">
        <code>{value}</code>
      </dd>
    </div>
  );
}

function IntegrityComparison({ method, sample }: { method: Method; sample: IntegrityCase }) {
  const bytesId = useId();
  const inspectorId = useId();
  const [selectedByte, setSelectedByte] = useState(0);
  const useMac = method === "hmac";
  const expectedValue = original[method];
  const computedValue = sample[method];
  const bytes = useMemo(
    () =>
      Array.from({ length: expectedValue.length / 2 }, (_, index) => {
        const offset = index * 2;
        const expected = expectedValue.slice(offset, offset + 2);
        const computed = computedValue.slice(offset, offset + 2);
        const xor = parseInt(expected, 16) ^ parseInt(computed, 16);
        const differences = bitsPerByte.map((mask) => Boolean(xor & mask));
        return { expected, computed, differences, count: differences.filter(Boolean).length };
      }),
    [expectedValue, computedValue],
  );
  const totalChanges = bytes.reduce((total, byte) => total + byte.count, 0);
  const matching = totalChanges === 0;
  const { expected, computed, differences, count } = bytes[selectedByte]!;

  const expectedLabel = useMac ? "Tag ricevuto" : "Impronta salvata";
  const computedLabel = useMac ? "Tag ricalcolato" : "Impronta ricalcolata";
  const status = useMac
    ? matching
      ? "Tag valido"
      : "Tag non valido"
    : matching
      ? "Impronte identiche"
      : "Impronte diverse";
  const outcome = matching
    ? "Il controllo d’integrità riesce per questa copia."
    : "Il server rileva la modifica e scarta questa copia.";

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
      <section
        className="crypto-stage crypto-integrity"
        aria-label="Confronto dei risultati a 256 bit"
      >
        <dl className="crypto-integrity-values crypto-integrity-pair">
          <IntegrityValue label={expectedLabel} value={expectedValue} />
          <IntegrityValue label={computedLabel} value={computedValue} />
        </dl>
        <div className="crypto-integrity-result">
          <div className="crypto-integrity-tally" role="status" aria-atomic="true">
            <p className="crypto-status" data-tone={matching ? "good" : "warning"}>
              {status}
            </p>
            <span className="crypto-integrity-count">
              <strong>{totalChanges}</strong> / 256 bit diversi
            </span>
          </div>

          <div className="crypto-integrity-comparison">
            <div className="crypto-integrity-matrix" role="group" aria-label="Mappa dei 32 byte">
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
                {[
                  { label: expectedLabel, value: expected },
                  { label: computedLabel, value: computed },
                ].map(({ label, value }) => (
                  <div className="crypto-integrity-byte-row" key={label}>
                    <dt>{label}</dt>
                    <dd>
                      <code>0x{value.toUpperCase()}</code>
                    </dd>
                    <dd className="crypto-integrity-bit-values">
                      {bitsPerByte.map((mask, index) => (
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
          <span>Usa le frecce della tastiera per spostarti tra i byte.</span>
        </div>
      </section>

      <div className="crypto-integrity-conclusion">
        <p>
          <strong>{outcome}</strong>{" "}
          {sample.id === "amount"
            ? `Una sola cifra dell’importo ha fatto cambiare ${totalChanges} bit in questa prova. I passaggi di SHA-256 mescolano i dati, quindi un piccolo cambiamento può propagarsi a molti bit. Il numero dipende dai messaggi confrontati.`
            : sample.explanation}
        </p>
        <p>
          {useMac
            ? "Il contratto resta leggibile. Per produrre il tag di una copia diversa serve la chiave condivisa. Il tag autentica il messaggio rispetto a chi conosce quella chiave. Per attribuirlo a una persona precisa serve un altro meccanismo."
            : "Chiunque può calcolare SHA-256 su qualsiasi copia. La verifica dell’integrità dipende quindi dalla provenienza dell’impronta salvata. Prova HMAC per vedere come entra in gioco una chiave condivisa."}
        </p>
      </div>
    </div>
  );
}

function IntegrityMessage({ label, sample }: { label: string; sample: IntegrityCase }) {
  const [documentField, amount = "", status = ""] = sample.message.split("&");
  const [amountField, amountValue = ""] = amount.split("=");
  const [statusField, statusValue = ""] = status.split("=");

  return (
    <div className="crypto-integrity-message">
      <span className="crypto-stage-label">
        <FileText aria-hidden="true" /> {label}
      </span>
      <code>
        <span>{documentField}&amp;</span>
        <span>
          {amountField}=
          {sample.id === "amount" ? (
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
          {sample.id === "status" ? (
            <mark className="crypto-symmetric-mark">{statusValue}</mark>
          ) : (
            statusValue
          )}
        </span>
      </code>
    </div>
  );
}
