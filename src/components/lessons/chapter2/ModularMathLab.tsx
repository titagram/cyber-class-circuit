import { useId, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  Clock3,
  LockKeyhole,
  Repeat2,
  ScanLine,
  UnlockKeyhole,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HudButton, HudTextField } from "@/design-system/nightrunner";
import "./ModularMathLab.css";

const moduli = Array.from({ length: 11 }, (_, index) => index + 2);
const bases = [2, 3, 4, 5, 6, 7, 8, 9];
const exponents = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const prime = 23;
const generator = 5;
const privateExponents = Array.from({ length: prime - 3 }, (_, index) => index + 2);
const exchangeStages = ["Prepara", "Scambia", "Deriva"];

function residues(modulus: number) {
  return Array.from({ length: modulus }, (_, value) => value);
}

function modulo(number: number, modulus: number) {
  const remainder = number % modulus;
  return remainder < 0 ? remainder + modulus : remainder || 0;
}

function gcd(a: number, b: number) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }

  return a;
}

function modularPower(base: number, exponent: number, modulus: number) {
  const initial = { power: 0, previous: 1, residue: 1 };
  const trace = [initial];
  let result = initial.residue;

  for (let power = 1; power <= exponent; power++) {
    const previous = result;
    result = modulo(previous * base, modulus);
    trace.push({ power, previous, residue: result });
  }

  return { initial, trace, result };
}

export function ModularMathLab() {
  return (
    <Tabs defaultValue="resti" className="modular-math-lab">
      <TabsList className="math-tabs" aria-label="Esperimenti di algebra modulare">
        <TabsTrigger value="resti">
          <Clock3 aria-hidden="true" /> Resti
        </TabsTrigger>
        <TabsTrigger value="inversi">
          <Repeat2 aria-hidden="true" /> Inversi
        </TabsTrigger>
        <TabsTrigger value="potenze">
          <ChartNoAxesColumnIncreasing aria-hidden="true" /> Potenze
        </TabsTrigger>
        <TabsTrigger value="diffie-hellman">
          <LockKeyhole aria-hidden="true" /> Diffie–Hellman
        </TabsTrigger>
      </TabsList>
      <TabsContent forceMount value="resti" className="math-tab-panel">
        <ResidueClock />
      </TabsContent>
      <TabsContent forceMount value="inversi" className="math-tab-panel">
        <InverseLab />
      </TabsContent>
      <TabsContent forceMount value="potenze" className="math-tab-panel">
        <PowerLab />
      </TabsContent>
      <TabsContent forceMount value="diffie-hellman" className="math-tab-panel">
        <KeyExchangeLab />
      </TabsContent>
    </Tabs>
  );
}

function ResidueClock() {
  const [reading, setReading] = useState({ number: 17, modulus: 12, angle: 150 });
  const [entry, setEntry] = useState("17");
  const { number, modulus, angle } = reading;
  const residue = modulo(number, modulus);
  const turns = Math.floor(number / modulus);
  const jump = Number(entry);
  const validJump = /^[+-]?\d+$/.test(entry.trim()) && Number.isSafeInteger(jump);

  function moveTo(next: number) {
    const delta = next - number;
    const remainder = modulo(next, modulus) - residue;
    const travel =
      delta > 0 ? modulo(remainder, modulus) || modulus : -(modulo(-remainder, modulus) || modulus);

    if (delta !== 0) {
      setReading({ ...reading, number: next, angle: angle + (travel * 360) / modulus });
    }
    setEntry(String(next));
  }

  function changeModulus(next: number) {
    const destination = (modulo(number, next) * 360) / next;
    const travel = modulo(destination - angle + 180, 360) - 180;
    setReading({ ...reading, modulus: next, angle: angle + travel });
  }

  return (
    <section className="crypto-stage math-stage" aria-label="L’orologio dei resti">
      <h2 className="crypto-stage-label">L’orologio dei resti</h2>
      <div className="math-clock-layout">
        <div className="math-clock" role="group" aria-label={`Quadrante modulo ${modulus}`}>
          <div className="math-clock-ring" aria-hidden="true" />
          <div
            className="math-clock-hand"
            aria-hidden="true"
            style={{ transform: `rotate(${angle}deg)` }}
          />
          <div className="math-clock-center" aria-hidden="true">
            <span>RESTO</span>
            <strong>{residue}</strong>
          </div>
          {residues(modulus).map((value) => {
            const tick = (2 * Math.PI * value) / modulus;
            const destination = number + (value - residue);
            return (
              <button
                key={value}
                type="button"
                className="math-clock-tick"
                aria-pressed={residue === value}
                aria-label={`Posizione ${value}`}
                style={{
                  left: `${50 + Math.sin(tick) * 39}%`,
                  top: `${50 - Math.cos(tick) * 39}%`,
                }}
                disabled={!Number.isSafeInteger(destination)}
                onClick={() => moveTo(destination)}
              >
                {value}
              </button>
            );
          })}
        </div>

        <div className="math-clock-sidebar">
          <div className="math-clock-result" aria-live="polite" aria-atomic="true">
            <strong className="math-readout">
              {number} mod {modulus} = {residue}
            </strong>
            <span className="math-expression">
              {number} = {modulus} × {turns} + {residue}
            </span>
          </div>
          <form
            className="crypto-controls math-clock-entry"
            onSubmit={(event) => {
              event.preventDefault();
              if (validJump) moveTo(jump);
            }}
          >
            <NumberSelect label="Modulo" values={moduli} value={modulus} onChange={changeModulus} />
            <HudTextField
              label="Numero intero"
              value={entry}
              onChange={(event) => setEntry(event.currentTarget.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <HudButton type="submit" disabled={!validJump}>
              Vai
            </HudButton>
          </form>
          <div className="math-moves" role="group" aria-label="Spostamenti sul quadrante">
            {[-modulus, -1, 1, modulus].map((delta) => (
              <HudButton
                key={delta}
                variant="secondary"
                aria-label={
                  delta === modulus
                    ? "Avanza di un giro"
                    : delta === -modulus
                      ? "Torna indietro di un giro"
                      : undefined
                }
                disabled={!Number.isSafeInteger(number + delta)}
                onClick={() => moveTo(number + delta)}
              >
                {delta > 0 ? "+" : "−"}
                {Math.abs(delta)}
              </HudButton>
            ))}
          </div>
        </div>
      </div>
      <p className="crypto-legend">
        Fai un giro completo. Il numero cambia, il resto rimane lo stesso. Questi numeri sono
        congruenti.
      </p>
    </section>
  );
}

function InverseLab() {
  const [modulus, setModulus] = useState(12);
  const [factor, setFactor] = useState(5);
  const [multiplier, setMultiplier] = useState(2);
  const values = residues(modulus);
  const products = values.map((value) => modulo(factor * value, modulus));
  const reached = new Set(products);
  const selected = modulo(factor * multiplier, modulus);
  const divisor = gcd(factor, modulus);
  const status =
    divisor > 1
      ? "Nessun inverso"
      : selected === 1
        ? `${multiplier} è l’inverso di ${factor}`
        : "Inverso possibile";

  return (
    <section className="crypto-stage math-stage" aria-label="Inverso moltiplicativo">
      <div className="math-stage-header">
        <h2 className="crypto-stage-label">Inverso moltiplicativo</h2>
        <div className="crypto-controls math-settings">
          <NumberSelect
            label="Modulo"
            values={moduli}
            value={modulus}
            onChange={(next) => {
              setModulus(next);
              setFactor(modulo(factor, next));
              setMultiplier(modulo(multiplier, next));
            }}
          />
          <NumberSelect label="Fattore a" values={values} value={factor} onChange={setFactor} />
        </div>
      </div>

      <div className="math-product-board" data-invertible={divisor === 1}>
        <p className="math-label">Scegli un moltiplicatore b per ottenere resto 1.</p>
        <div className="math-product-grid" role="group" aria-label="Prodotti modulo n">
          {products.map((product, value) => (
            <button
              key={value}
              type="button"
              className="math-product"
              aria-label={`Moltiplicatore ${value}, resto ${product}`}
              aria-pressed={value === multiplier}
              onClick={() => setMultiplier(value)}
            >
              <span>× {value}</span>
              <strong>{product}</strong>
            </button>
          ))}
        </div>

        <div className="math-inverse-result" aria-live="polite" aria-atomic="true">
          <div>
            <span className="math-label">Prodotto selezionato</span>
            <strong className="math-readout">
              ({factor} × {multiplier}) mod {modulus} = {selected}
            </strong>
          </div>
          <div
            className="math-gcd-result"
            data-state={divisor > 1 ? "blocked" : selected === 1 ? "found" : "possible"}
          >
            <strong>{status}</strong>
            <span className="math-expression">
              MCD({factor}, {modulus}) = {divisor}
            </span>
          </div>
        </div>

        <div className="math-coverage">
          <p className="math-label">
            Resti raggiunti · {reached.size} su {modulus}
          </p>
          <ul className="math-coverage-strip" aria-label="Distribuzione dei resti">
            {values.map((value) => (
              <li
                key={value}
                aria-label={`Resto ${value}, ${reached.has(value) ? "raggiunto" : "irraggiungibile"}${value === 1 ? ", obiettivo" : ""}`}
                data-reached={reached.has(value)}
                data-current={selected === value}
                data-target={value === 1}
              >
                {value}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="crypto-legend">
        <code>a</code> è un’unità, cioè è invertibile modulo <code>n</code>, esattamente quando{" "}
        <code>MCD(a, n) = 1</code>.
      </p>
    </section>
  );
}

function PowerLab() {
  const [base, setBase] = useState(3);
  const [exponent, setExponent] = useState(4);
  const [modulus, setModulus] = useState(7);
  const [step, setStep] = useState(0);
  const { initial, trace } = modularPower(base, exponent, modulus);
  const { previous, residue: value } = trace[step] ?? initial;
  const calculation =
    step === 0
      ? `1 mod ${modulus} = ${value}`
      : `(${previous} × ${base}) mod ${modulus} = ${value}`;

  return (
    <section className="crypto-stage math-stage" aria-label="Potenze modulo n">
      <div className="math-stage-header">
        <h2 className="crypto-stage-label">Potenze modulo n</h2>
        <div
          className="crypto-controls math-settings math-power-settings"
          role="group"
          aria-label="Parametri della potenza"
        >
          <NumberSelect label="Base" values={bases} value={base} onChange={setBase} />
          <NumberSelect
            label="Esponente"
            values={exponents}
            value={exponent}
            onChange={(next) => {
              setExponent(next);
              setStep(Math.min(step, next));
            }}
          />
          <NumberSelect label="Modulo" values={moduli} value={modulus} onChange={setModulus} />
        </div>
      </div>
      <div className="math-plot" role="group" aria-label="Grafico dei resti a ogni esponente">
        <span className="math-label math-plot-caption">Resto</span>
        <div
          className="math-plot-area"
          style={{ "--math-plot-lines": modulus - 1 } as CSSProperties}
        >
          <span className="math-y-max" aria-hidden="true">
            {modulus - 1}
          </span>
          <span className="math-y-zero" aria-hidden="true">
            0
          </span>
          {trace.map(({ residue, power }) => (
            <div
              className="math-plot-column"
              key={power}
              data-visited={power <= step}
              data-selected={power === step}
              style={
                { "--math-plot-height": `${(residue / (modulus - 1)) * 100}%` } as CSSProperties
              }
            >
              <span className="math-plot-stem" aria-hidden="true" />
              <button
                className="math-plot-dot"
                type="button"
                aria-label={`Esponente ${power}, resto ${residue}`}
                aria-pressed={power === step}
                onClick={() => setStep(power)}
              >
                {residue}
              </button>
              <span className="math-plot-power" aria-hidden="true">
                {power}
              </span>
            </div>
          ))}
        </div>
        <span className="math-label math-x-label">Esponente</span>
      </div>

      <div className="math-power-footer">
        <div className="math-moves">
          <HudButton
            type="button"
            variant="secondary"
            aria-label="Passo precedente"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft aria-hidden="true" />
          </HudButton>
          <HudButton
            type="button"
            variant="secondary"
            aria-label="Passo successivo"
            disabled={step === exponent}
            onClick={() => setStep(step + 1)}
          >
            <ArrowRight aria-hidden="true" />
          </HudButton>
        </div>
        <div className="math-power-result" aria-live="polite" aria-atomic="true">
          <strong className="math-readout">{calculation}</strong>
          <span className="math-expression">
            {base}
            <sup>{step}</sup> ≡ {value} (mod {modulus})
          </span>
        </div>
      </div>
      <p className="crypto-legend">
        Seleziona un punto o usa le frecce. Per ogni nuovo esponente, moltiplica il resto precedente
        per la base e riduci di nuovo.
      </p>
    </section>
  );
}

function KeyExchangeLab() {
  const [stage, setStage] = useState(0);
  const [alice, setAlice] = useState(6);
  const [bob, setBob] = useState(15);
  const alicePublic = modularPower(generator, alice, prime).result;
  const bobPublic = modularPower(generator, bob, prime).result;
  const aliceSecret = modularPower(bobPublic, alice, prime).result;
  const bobSecret = modularPower(alicePublic, bob, prime).result;

  return (
    <section className="crypto-stage math-stage" aria-label="Diffie–Hellman in miniatura">
      <div className="math-stage-header">
        <h2 className="crypto-stage-label">Diffie–Hellman in miniatura</h2>
        <span className="math-expression math-public-parameters">
          Parametri pubblici <strong>p = {prime}</strong> <strong>g = {generator}</strong>
        </span>
      </div>

      <ol className="math-exchange-stages" aria-label="Fasi dello scambio">
        {exchangeStages.map((label, index) => (
          <li
            key={label}
            aria-current={index === stage ? "step" : undefined}
            data-complete={index < stage}
          >
            <span>{index + 1}</span> {label}
          </li>
        ))}
      </ol>

      <div className="math-exchange" data-stage={stage}>
        <section className="crypto-card math-party math-alice" aria-label="Alice">
          <h3>
            <LockKeyhole aria-hidden="true" /> Alice
          </h3>
          <NumberSelect
            label="Esponente privato di Alice"
            values={privateExponents}
            value={alice}
            onChange={(next) => {
              setAlice(next);
              setStage(0);
            }}
          />
          <div className="math-party-value">
            <span className="math-label">Valore pubblico A</span>
            <span className="math-expression">
              {generator}
              <sup>{alice}</sup> mod {prime} = <strong>{alicePublic}</strong>
            </span>
          </div>
          {stage === 2 && (
            <div className="math-party-value math-derived">
              <span className="math-label">Calcolo locale con B</span>
              <span className="math-expression">
                {bobPublic}
                <sup>{alice}</sup> mod {prime} = <strong>{aliceSecret}</strong>
              </span>
            </div>
          )}
        </section>

        <section className="math-channel" aria-label="Canale pubblico">
          <span className="math-label">
            <ScanLine aria-hidden="true" /> Canale pubblico
          </span>
          <div className="math-channel-lane">
            <ArrowRight aria-hidden="true" />
            {stage > 0 && (
              <strong className="math-packet math-packet-out">A = {alicePublic}</strong>
            )}
          </div>
          <div className="math-channel-lane">
            <ArrowLeft aria-hidden="true" />
            {stage > 0 && <strong className="math-packet math-packet-in">B = {bobPublic}</strong>}
          </div>
        </section>

        <section className="crypto-card math-party math-bob" aria-label="Bob">
          <h3>
            <LockKeyhole aria-hidden="true" /> Bob
          </h3>
          <NumberSelect
            label="Esponente privato di Bob"
            values={privateExponents}
            value={bob}
            onChange={(next) => {
              setBob(next);
              setStage(0);
            }}
          />
          <div className="math-party-value">
            <span className="math-label">Valore pubblico B</span>
            <span className="math-expression">
              {generator}
              <sup>{bob}</sup> mod {prime} = <strong>{bobPublic}</strong>
            </span>
          </div>
          {stage === 2 && (
            <div className="math-party-value math-derived">
              <span className="math-label">Calcolo locale con A</span>
              <span className="math-expression">
                {alicePublic}
                <sup>{bob}</sup> mod {prime} = <strong>{bobSecret}</strong>
              </span>
            </div>
          )}
        </section>
      </div>

      <div
        className="math-exchange-feedback"
        aria-live="polite"
        aria-atomic="true"
        data-derived={stage === 2}
      >
        {stage === 0 && <span>Scegli gli esponenti privati, poi fai partire lo scambio.</span>}
        {stage === 1 && <span>Alice riceve B. Bob riceve A. Gli esponenti restano locali.</span>}
        {stage === 2 && (
          <>
            <strong className="math-readout">
              <UnlockKeyhole aria-hidden="true" />
              {`Segreto condiviso = ${aliceSecret}`}
            </strong>
            <span className="math-expression">
              Entrambi ottengono g<sup>a × b</sup> mod p.
            </span>
          </>
        )}
      </div>

      <div className="crypto-controls math-exchange-actions">
        <HudButton variant="secondary" disabled={stage === 0} onClick={() => setStage(stage - 1)}>
          <ArrowLeft aria-hidden="true" /> Indietro
        </HudButton>
        <HudButton onClick={() => setStage(stage === 2 ? 0 : stage + 1)}>
          {stage === 0
            ? "Invia i valori pubblici"
            : stage === 1
              ? "Calcola il segreto"
              : "Ricomincia"}
          <ArrowRight aria-hidden="true" />
        </HudButton>
      </div>
      <p className="crypto-legend">
        Il modulo 23 è didattico. Nei protocolli reali le chiavi di traffico si derivano dal segreto
        condiviso.
      </p>
    </section>
  );
}

function NumberSelect({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: readonly number[];
  value: number;
  onChange: (value: number) => void;
}) {
  const id = useId();

  return (
    <div className="nr-field">
      <label className="nr-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="nr-input"
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      >
        {values.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
