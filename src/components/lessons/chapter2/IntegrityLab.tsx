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
const utf8 = new TextEncoder();
const shaBlockBytes = 64;
const shaLengthBytes = 8;

function byteHex(value: number) {
  return value.toString(16).padStart(2, "0");
}

function byteBits(value: number) {
  return value.toString(2).padStart(8, "0");
}

function moveGridByte(
  event: KeyboardEvent<HTMLButtonElement>,
  index: number,
  length: number,
  select: (index: number) => void,
) {
  const grid = event.currentTarget.parentElement;
  if (!grid) return;
  const columns = Number(getComputedStyle(grid).getPropertyValue("--integrity-columns")) || 8;
  const positions: Record<string, number> = {
    ArrowLeft: index - 1,
    ArrowRight: index + 1,
    ArrowUp: index - columns,
    ArrowDown: index + columns,
    Home: 0,
    End: length - 1,
  };
  if (!Object.hasOwn(positions, event.key)) return;
  event.preventDefault();
  const next = Math.max(0, Math.min(length - 1, positions[event.key]!));
  select(next);
  (grid.children.item(next) as HTMLButtonElement | null)?.focus();
}

const receiveStep: TutorialStep = {
  label: "Copia ricevuta",
  title: "Scegli quale copia arriva al server",
  explanation:
    "Scegli «Cambia importo» per sostituire una sola cifra. Prima di ricalcolare SHA-256, controlla in quale posizione cambiano i byte e quanti bit di ingresso differiscono.",
};

const shaSteps = [
  {
    label: "Originale",
    title: "Che cosa deve arrivare intatto?",
    explanation:
      "Il server ha già accesso alla versione approvata del contratto 42. Quando riceverà una copia, dovrà controllare se contiene gli stessi byte. Seleziona una casella per vedere come un carattere di questo testo è rappresentato in UTF-8.",
  },
  {
    label: "Riferimento",
    title: "Ricava l’impronta dall’originale",
    explanation:
      "Una funzione di hash ricava un’impronta dai byte di ingresso. SHA-256 aggiunge un indicatore, degli zeri e la lunghezza del messaggio per formare blocchi da 512 bit. Dopo il mescolamento, il server conserva l’impronta di 256 bit in un archivio attendibile.",
  },
  receiveStep,
  {
    label: "Ricalcolo",
    title: "Calcola l’impronta sui byte arrivati",
    explanation:
      "Il server applica gli stessi passaggi ai byte ricevuti. Le eventuali caselle evidenziate indicano i byte del testo che differiscono dall’originale. Ora confronta l’impronta in uscita con quella conservata.",
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
      "HMAC-SHA-256 applica SHA-256 due volte. Prepara la stessa chiave in due modi, combinandola con due sequenze fisse di byte diverse. Il risultato del primo passaggio entra nel secondo, che produce il tag da allegare al contratto.",
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
            <InputBytes message={original.message} />
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
              {sample ? <InputByteChange sample={sample} /> : null}
            </div>
            {useMac ? (
              <dl className="crypto-integrity-values">
                <IntegrityValue label="Tag del mittente allegato" value={original.hmac} />
              </dl>
            ) : null}
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

function InputBytes({ message }: { message: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inspectorId = useId();
  const bytes = utf8.encode(message);
  const selected = bytes[selectedIndex]!;

  return (
    <div className="crypto-integrity-workbench">
      <div className="crypto-stage-label">{bytes.length} byte UTF-8</div>
      <div className="crypto-input-byte-grid" role="group" aria-label="Byte del contratto in UTF-8">
        {Array.from(bytes, (byte, index) => (
          <button
            key={index}
            type="button"
            className="crypto-integrity-byte crypto-input-byte"
            tabIndex={selectedIndex === index ? 0 : -1}
            aria-label={`Posizione ${index + 1}, carattere ${message[index]}, esadecimale ${byteHex(byte)}`}
            aria-pressed={selectedIndex === index}
            aria-controls={inspectorId}
            onClick={() => setSelectedIndex(index)}
            onKeyDown={(event) => moveGridByte(event, index, bytes.length, setSelectedIndex)}
          >
            <span aria-hidden="true">{message[index]}</span>
            <code aria-hidden="true">{byteHex(byte)}</code>
          </button>
        ))}
      </div>
      <dl
        id={inspectorId}
        className="crypto-input-byte-inspector"
        aria-label="Byte UTF-8 selezionato"
        aria-live="polite"
      >
        <div>
          <dt>Posizione</dt>
          <dd>{selectedIndex + 1}</dd>
        </div>
        <div>
          <dt>Carattere</dt>
          <dd>
            <code>{message[selectedIndex]}</code>
          </dd>
        </div>
        <div>
          <dt>Esadecimale</dt>
          <dd>
            <code>0x{byteHex(selected)}</code>
          </dd>
        </div>
        <div>
          <dt>Binario</dt>
          <dd>
            <code>{byteBits(selected)}</code>
          </dd>
        </div>
      </dl>
    </div>
  );
}

function InputByteChange({ sample }: { sample: IntegrityCase }) {
  const before = utf8.encode(original.message);
  const after = utf8.encode(sample.message);
  const index = before.findIndex((byte, position) => byte !== after[position]);
  if (index < 0) return null;

  const oldByte = before[index]!;
  const newByte = after[index]!;
  const xor = oldByte ^ newByte;
  const changed = bitsPerByte.filter((mask) => xor & mask).length;
  return (
    <div className="crypto-integrity-workbench" role="group" aria-label="Primo byte diverso">
      <div className="crypto-integrity-byte-header">
        <h3 className="crypto-stage-label">Byte {index + 1}</h3>
        <span>
          {changed} {changed === 1 ? "bit diverso" : "bit diversi"}
        </span>
      </div>
      <div className="crypto-input-change">
        <InputByteValue
          label="Originale"
          byte={oldByte}
          character={original.message[index]!}
          xor={xor}
        />
        <ArrowRight className="crypto-integrity-arrow" aria-hidden="true" />
        <InputByteValue
          label="Ricevuto"
          byte={newByte}
          character={sample.message[index]!}
          xor={xor}
        />
      </div>
      {before.length !== after.length ? (
        <p className="crypto-integrity-note">
          La copia è lunga {after.length} byte. L’originale ne misura {before.length}.
        </p>
      ) : null}
    </div>
  );
}

function InputByteValue({
  label,
  byte,
  character,
  xor,
}: {
  label: string;
  byte: number;
  character: string;
  xor: number;
}) {
  return (
    <div className="crypto-input-change-value">
      <span className="crypto-label">{label}</span>
      <code>
        {character} · 0x{byteHex(byte)}
      </code>
      <code className="crypto-input-change-bits" aria-label={`Binario ${byteBits(byte)}`}>
        {bitsPerByte.map((mask) => (
          <span key={mask} data-changed={Boolean(xor & mask)}>
            {byte & mask ? "1" : "0"}
          </span>
        ))}
      </code>
    </div>
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
  return (
    <div className="crypto-integrity-stage">
      <IntegrityMessage label={messageLabel} sample={sample} />
      {method === "hmac" ? <HmacPasses /> : <ShaBlock sample={sample} />}
      <dl className="crypto-integrity-values">
        <IntegrityValue label={resultLabel} value={sample[method]} />
      </dl>
    </div>
  );
}

function ShaBlock({ sample }: { sample: IntegrityCase }) {
  const bytes = utf8.encode(sample.message);
  const source = utf8.encode(original.message);
  // Each lesson message fits in one block with its padding and 64-bit length field.
  const block = new Uint8Array(shaBlockBytes);
  const lengthStart = block.length - shaLengthBytes;
  const bitLength = bytes.length * 8;
  block.set(bytes);
  block[bytes.length] = 0x80;
  new DataView(block.buffer).setBigUint64(lengthStart, BigInt(bitLength));
  const lengthHex = Array.from(block.subarray(lengthStart), byteHex).join(" ");

  return (
    <section className="crypto-integrity-workbench" aria-label="Blocco SHA-256 da 512 bit">
      <h3 className="crypto-stage-label">Blocco SHA-256 da 512 bit</h3>
      <div className="crypto-sha-block" aria-hidden="true">
        {Array.from(block, (byte, index) => {
          const kind =
            index < bytes.length ? "message" : index < lengthStart ? "padding" : "length";
          return (
            <code
              key={index}
              data-sha-byte-kind={kind}
              data-changed={kind === "message" && byte !== source[index]}
            >
              {byteHex(byte)}
            </code>
          );
        })}
      </div>
      <ul className="crypto-sha-legend" aria-label="Parti del blocco">
        <li data-sha-part="message">
          <span />
          {bytes.length} byte del messaggio
        </li>
        <li data-sha-part="padding">
          <span />
          Indicatore <code>80</code> e {lengthStart - bytes.length - 1} byte a zero
        </li>
        <li data-sha-part="length">
          <span />
          Lunghezza di {bitLength} bit <code>{lengthHex}</code>
        </li>
        {sample.id !== "original" ? (
          <li data-sha-part="changed">
            <span />
            Byte diversi dall’originale
          </li>
        ) : null}
      </ul>
      <div className="crypto-sha-mixing">
        <Fingerprint aria-hidden="true" />
        <div>
          <strong>64 passaggi di mescolamento</strong>
          <p className="crypto-integrity-note">
            Il blocco dà origine a 64 valori da 32 bit, uno per passaggio. Rotazioni, somme e
            operazioni sui bit mescolano gli otto gruppi di 32 bit che formeranno l’impronta.
          </p>
        </div>
      </div>
    </section>
  );
}

function HmacPasses() {
  return (
    <ol className="crypto-hmac-passes" aria-label="Passaggi HMAC-SHA-256" role="list">
      <li className="crypto-integrity-workbench">
        <h3 className="crypto-stage-label">Hash interno</h3>
        <p>
          <KeyRound aria-hidden="true" /> Chiave preparata per l’interno + byte del messaggio
        </p>
        <p>
          <ArrowRight aria-hidden="true" /> SHA-256 produce l’impronta interna (256 bit)
        </p>
      </li>
      <li className="crypto-integrity-workbench">
        <h3 className="crypto-stage-label">Hash esterno</h3>
        <p>
          <KeyRound aria-hidden="true" /> Chiave preparata per l’esterno + impronta interna
        </p>
        <p>
          <ArrowRight aria-hidden="true" /> SHA-256 produce il tag (256 bit)
        </p>
      </li>
    </ol>
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
                  key={index}
                  type="button"
                  className="crypto-integrity-byte"
                  tabIndex={selectedByte === index ? 0 : -1}
                  aria-label={`Byte ${index + 1}, ${byte.count} ${byte.count === 1 ? "bit diverso" : "bit diversi"}`}
                  aria-pressed={selectedByte === index}
                  aria-controls={inspectorId}
                  onClick={() => setSelectedByte(index)}
                  onKeyDown={(event) => moveGridByte(event, index, bytes.length, setSelectedByte)}
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
            ? `Un solo bit diverso all’ingresso, ${totalChanges} bit diversi all’uscita. Il mescolamento di SHA-256 fa sì che anche piccole modifiche possano avere un effetto ampio, chiamato effetto valanga. Il numero dipende dai messaggi confrontati.`
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
