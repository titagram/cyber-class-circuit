import { useId, useState } from "react";
import { ArrowDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TutorialFrame, type TutorialStep } from "./TutorialFrame";
import "./ByteEncodingLab.css";

const encoder = new TextEncoder();
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const presets = ["A", "Caffè", "🔐"];
const nextLabels = ["Leggi un byte in hex", "Raggruppa in Base64", "Prova XOR sui bit"];

const steps = [
  {
    label: "UTF-8",
    title: "Trasforma il testo in una sequenza di byte",
    explanation: (
      <p>
        Un algoritmo riceve numeri, quindi prima serve una regola per tradurre il testo. UTF-8
        assegna una sequenza di byte a ogni punto di codice Unicode. Tocca la <strong>è</strong> per
        scoprire perché il numero di byte può superare il numero di caratteri.
      </p>
    ),
  },
  {
    label: "Hex",
    title: "Leggi gli stessi bit con due cifre esadecimali",
    explanation: (
      <p>
        Ogni byte contiene otto bit. Dividili in due gruppi da quattro. Ciascun gruppo può valere da
        0 a 15, quindi ti basta una cifra da 0 a F per mostrarlo. Seleziona un byte e segui i due
        gruppi fino al risultato.
      </p>
    ),
  },
  {
    label: "Base64",
    title: "Raggruppa i bit in modo diverso per trasportare i byte come testo",
    explanation: (
      <p>
        Base64 prende fino a tre byte alla volta e legge i bit in gruppi da sei. Ogni gruppo sceglie
        uno dei 64 simboli dell’alfabeto Base64. Prova il campione <strong>A</strong> per vedere il
        riempimento di un blocco incompleto.
      </p>
    ),
  },
  {
    label: "XOR",
    title: "Applica due volte la maschera e ritrova i bit iniziali",
    explanation: (
      <p>
        XOR confronta i bit a coppie. Ottieni 1 se sono diversi e 0 se sono uguali. Un 1 nella
        maschera inverte il bit del byte, uno 0 lo lascia com’è. Cambia la maschera e applicala due
        volte per vedere perché l’operazione è reversibile.
      </p>
    ),
  },
] satisfies readonly TutorialStep[];

function hex(value: number) {
  return value.toString(16).toUpperCase().padStart(2, "0");
}

function binary(value: number) {
  return value.toString(2).padStart(8, "0");
}

export function ByteEncodingLab() {
  const [step, setStep] = useState(0);
  const [text, setText] = useState("Caffè");
  const [characterIndex, setCharacterIndex] = useState(0);
  const [byteIndex, setByteIndex] = useState(0);
  const [blockIndex, setBlockIndex] = useState(0);
  const inputId = useId();
  const characters = Array.from(text);
  const bytes = Array.from(encoder.encode(text));

  function changeText(value: string) {
    setText(value);
    setCharacterIndex(Math.max(0, Array.from(value).length - 1));
    setByteIndex(0);
    setBlockIndex(0);
  }

  const character = characters[characterIndex];
  const characterBytes = character ? Array.from(encoder.encode(character)) : [];
  const characterByteStart = encoder.encode(characters.slice(0, characterIndex).join("")).length;
  const byte = bytes[byteIndex];

  return (
    <TutorialFrame
      steps={steps}
      activeStep={step}
      onStepChange={setStep}
      nextLabel={nextLabels[step] ?? "Passo successivo"}
      canAdvance={bytes.length > 0}
      actions={
        step === 3 && (
          <Button type="button" variant="outline" onClick={() => setStep(0)}>
            <RotateCcw aria-hidden="true" /> Ricomincia
          </Button>
        )
      }
    >
      <div className="crypto-stage byte-lab">
        <div className="byte-source">
          <div>
            <label className="crypto-label" htmlFor={inputId}>
              Messaggio
            </label>
            <Input
              id={inputId}
              value={text}
              maxLength={20}
              onChange={(event) => changeText(event.currentTarget.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="crypto-controls" role="group" aria-label="Messaggi di esempio">
            {presets.map((preset) => (
              <Button
                key={preset}
                type="button"
                size="sm"
                variant={text === preset ? "default" : "outline"}
                aria-pressed={text === preset}
                onClick={() => changeText(preset)}
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        {bytes.length === 0 && <p role="status">Scrivi un messaggio o scegli un esempio.</p>}

        {character && step === 0 && (
          <div className="byte-workbench">
            <div className="utf8-trace">
              <div>
                <span className="crypto-stage-label">Tocca un carattere</span>
                <div className="byte-tokens" role="group" aria-label="Caratteri del messaggio">
                  {characters.map((value, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-pressed={index === characterIndex}
                      aria-label={`Carattere ${index + 1}: ${value === " " ? "spazio" : value}`}
                      onClick={() => setCharacterIndex(index)}
                    >
                      {value === " " ? "␣" : value}
                    </button>
                  ))}
                </div>
              </div>
              <ArrowDown className="byte-direction utf8-direction" aria-hidden="true" />
              <div className="byte-output utf8-character" aria-live="polite">
                <span className="crypto-label">
                  <code>{character}</code> · U+
                  {character.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0")}
                </span>
                <TokenRow values={characterBytes.map(hex)} />
                <p>
                  {characterBytes.length === 1
                    ? "Un byte. I caratteri ASCII mantengono lo stesso valore in UTF-8."
                    : `${characterBytes.length} byte. UTF-8 usa più byte per questo punto di codice.`}
                </p>
              </div>
            </div>
            <div className="byte-output utf8-message">
              <span className="crypto-stage-label">Messaggio completo · {bytes.length} byte</span>
              <div className="byte-tokens" role="group" aria-label="Sequenza UTF-8 del messaggio">
                {bytes.map((value, index) => (
                  <code
                    key={index}
                    data-selected={
                      index >= characterByteStart &&
                      index < characterByteStart + characterBytes.length
                    }
                  >
                    {hex(value)}
                  </code>
                ))}
              </div>
              <p>I byte del carattere selezionato sono evidenziati nella sequenza.</p>
            </div>
          </div>
        )}

        {byte !== undefined && (step === 1 || step === 3) && (
          <div className="byte-workbench">
            <span className="crypto-stage-label">Seleziona un byte</span>
            <div className="byte-tokens" role="group" aria-label="Byte del messaggio">
              {bytes.map((value, index) => (
                <button
                  key={index}
                  type="button"
                  aria-pressed={index === byteIndex}
                  aria-label={`Byte ${index + 1}: ${hex(value)}`}
                  onClick={() => setByteIndex(index)}
                >
                  {hex(value)}
                </button>
              ))}
            </div>
            {step === 1 && <HexTrace byte={byte} />}
            {step === 3 && <XorTrace key={`${text}-${byteIndex}`} byte={byte} />}
          </div>
        )}

        {bytes.length > 0 && step === 2 && (
          <Base64Trace bytes={bytes} blockIndex={blockIndex} onBlockChange={setBlockIndex} />
        )}
      </div>
    </TutorialFrame>
  );
}

function TokenRow({ values, label }: { values: readonly string[]; label?: string }) {
  return (
    <div className="byte-tokens" aria-label={label}>
      {values.map((value, index) => (
        <code key={index}>{value}</code>
      ))}
    </div>
  );
}

function HexTrace({ byte }: { byte: number }) {
  const bits = binary(byte);

  return (
    <div className="byte-output" aria-live="polite">
      <div className="byte-conversion">
        {[bits.slice(0, 4), bits.slice(4)].map((group, index) => {
          const value = parseInt(group, 2);
          return (
            <div key={index} className="crypto-node byte-conversion-card">
              <span className="crypto-label">
                {index === 0 ? "Primi quattro bit" : "Ultimi quattro bit"}
              </span>
              <code>{group}</code>
              <ArrowDown aria-hidden="true" />
              <span>{value} in decimale</span>
              <strong>{hex(value)[1]}</strong>
            </div>
          );
        })}
      </div>
      <p>
        Affianca le due cifre e ottieni <strong>{hex(byte)}</strong>. Il valore è ancora {byte}.
      </p>
    </div>
  );
}

function Base64Trace({
  bytes,
  blockIndex,
  onBlockChange,
}: {
  bytes: number[];
  blockIndex: number;
  onBlockChange: (index: number) => void;
}) {
  const count = Math.ceil(bytes.length / 3);
  const block = bytes.slice(blockIndex * 3, (blockIndex + 1) * 3);
  const bits = block.map(binary).join("");
  const groups = bits.match(/.{1,6}/g) ?? [];
  const symbols = groups.map((group) => alphabet[parseInt(group.padEnd(6, "0"), 2)]);
  const encoded = btoa(String.fromCharCode(...bytes));

  return (
    <div className="byte-workbench">
      <span className="crypto-stage-label">Segui un blocco</span>
      <div className="crypto-controls" role="group" aria-label="Blocchi Base64">
        {Array.from({ length: count }, (_, index) => (
          <Button
            key={index}
            size="sm"
            type="button"
            variant={index === blockIndex ? "default" : "outline"}
            aria-pressed={index === blockIndex}
            onClick={() => onBlockChange(index)}
          >
            Blocco {index + 1}
          </Button>
        ))}
      </div>
      <div className="byte-output" aria-live="polite">
        <TokenRow values={block.map(binary)} label="Byte del blocco in binario" />
        <ArrowDown className="byte-direction" aria-hidden="true" />
        <div className="byte-conversion">
          {groups.map((group, index) => (
            <div key={index} className="crypto-node byte-conversion-card">
              <code>
                {group}
                {group.length < 6 && <mark>{"0".repeat(6 - group.length)}</mark>}
              </code>
              <span>Indice {parseInt(group.padEnd(6, "0"), 2)}</span>
              <strong>{symbols[index]}</strong>
            </div>
          ))}
        </div>
        <p>
          Blocco codificato <strong>{encoded.slice(blockIndex * 4, blockIndex * 4 + 4)}</strong>.
          {block.length < 3 &&
            " Gli zeri evidenziati completano l’ultimo gruppo. I segni = indicano quanti byte mancano al blocco di tre."}
        </p>
        <div className="byte-encoding-pair">
          <div>
            <span className="crypto-label">Messaggio in Base64</span>
            <code>{encoded}</code>
          </div>
          <div>
            <span className="crypto-label">Decodifica dello stesso Base64</span>
            <code>
              {new TextDecoder("utf-8", { ignoreBOM: true }).decode(
                Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0)),
              )}
            </code>
          </div>
        </div>
        <p>
          Chi legge il Base64 può recuperare il testo senza una chiave. Qui stiamo cambiando
          rappresentazione.
        </p>
      </div>
    </div>
  );
}

function XorTrace({ byte }: { byte: number }) {
  const [mask, setMask] = useState(0b10100101);
  const [applications, setApplications] = useState(0);
  const altered = byte ^ mask;
  const recovered = altered ^ mask;

  return (
    <div className="byte-output xor-trace">
      <div className="xor-row">
        <span className="crypto-label">Byte originale · {hex(byte)}</span>
        <TokenRow values={Array.from(binary(byte))} />
      </div>
      <div className="xor-row">
        <span className="crypto-label">Maschera · {hex(mask)}</span>
        <div className="byte-tokens" role="group" aria-label="Bit della maschera">
          {Array.from(binary(mask), (bit, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Bit ${index + 1} della maschera`}
              aria-pressed={bit === "1"}
              onClick={() => {
                setMask((current) => current ^ (1 << (7 - index)));
                setApplications(0);
              }}
            >
              {bit}
            </button>
          ))}
        </div>
      </div>
      {applications >= 1 && (
        <div className="xor-row" role="status">
          <span className="crypto-label">Primo XOR · {hex(altered)}</span>
          <TokenRow values={Array.from(binary(altered))} />
        </div>
      )}
      {applications === 2 && (
        <div className="xor-row xor-recovered" role="status">
          <span className="crypto-label">Secondo XOR · {hex(recovered)}</span>
          <TokenRow values={Array.from(binary(recovered))} />
        </div>
      )}
      <div className="crypto-controls">
        <Button
          size="sm"
          type="button"
          onClick={() => setApplications((current) => (current === 2 ? 0 : current + 1))}
        >
          {applications === 0
            ? "Applica XOR"
            : applications === 1
              ? "Applica la stessa maschera"
              : "Azzera il calcolo"}
        </Button>
      </div>
      {applications === 2 && (
        <p>
          Hai ritrovato <strong>{hex(recovered)}</strong>. Nelle posizioni con maschera 1 hai
          invertito ogni bit due volte. In AES-GCM vedrai da dove arriva la maschera da applicare ai
          byte di un documento.
        </p>
      )}
    </div>
  );
}
