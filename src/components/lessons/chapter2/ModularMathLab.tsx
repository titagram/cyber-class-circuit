import { useId, useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { HudBadge, HudButton, HudPanel } from "@/design-system/nightrunner";
import "./ModularMathLab.css";

const clockSize = 12;
const clockTicks = Array.from({ length: clockSize }, (_, value) => {
  const angle = (2 * Math.PI * value) / clockSize;
  return {
    value,
    left: `${50 + Math.sin(angle) * 39}%`,
    top: `${50 - Math.cos(angle) * 39}%`,
  };
});

const bases = [2, 3, 4, 5, 6, 7, 8, 9];
const exponents = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const moduli = [4, 5, 6, 7, 8, 9, 10, 11, 12];
const prime = 23;
const generator = 5;
const privateExponents = Array.from({ length: prime - 3 }, (_, index) => index + 2);

function modularPower(base: number, exponent: number, modulus: number) {
  const steps: { power: number; previous: number; residue: number }[] = [];
  const initial = 1 % modulus;
  let result = initial;

  for (let power = 1; power <= exponent; power++) {
    const previous = result;
    result = (previous * base) % modulus;
    steps.push({ power, previous, residue: result });
  }

  return { initial, result, steps };
}

export function ModularMathLab() {
  return (
    <div className="modular-math-lab">
      <ResidueClock />
      <PowerLab />
      <KeyExchangeLab />
    </div>
  );
}

function ResidueClock() {
  const [number, setNumber] = useState(17);
  const residue = number % clockSize;
  const turns = Math.floor(number / clockSize);

  return (
    <HudPanel heading="L’orologio dei resti" className="math-panel">
      <p>
        Dopo l’11 si torna a 0. Scegli una posizione sul quadrante oppure sposta il contatore. Prova
        ad aggiungere 12 e osserva dove resta la lancetta.
      </p>
      <div className="math-clock-layout">
        <div className="math-clock" role="group" aria-label="Posizioni dell’orologio modulo 12">
          <div className="math-clock-ring" aria-hidden="true" />
          <div
            className="math-clock-hand"
            aria-hidden="true"
            style={{ transform: `rotate(${(360 * residue) / clockSize}deg)` }}
          />
          <span className="math-clock-center" aria-hidden="true">
            mod 12
          </span>
          {clockTicks.map(({ value, left, top }) => (
            <HudButton
              key={value}
              className="math-clock-tick"
              variant={residue === value ? "primary" : "secondary"}
              aria-pressed={residue === value}
              aria-label={`Posizione ${value}`}
              style={{ left, top }}
              onClick={() => setNumber(turns * clockSize + value)}
            >
              {value}
            </HudButton>
          ))}
        </div>

        <div className="math-card math-clock-readout">
          <div className="math-moves" role="group" aria-label="Sposta il contatore">
            <HudButton
              variant="secondary"
              disabled={number === 0}
              onClick={() => setNumber((current) => current - 1)}
            >
              −1
            </HudButton>
            <HudButton variant="secondary" onClick={() => setNumber((current) => current + 1)}>
              +1
            </HudButton>
            <HudButton
              variant="secondary"
              onClick={() => setNumber((current) => current + clockSize)}
            >
              +12
            </HudButton>
          </div>
          <div className="math-clock-result" aria-live="polite" aria-atomic="true">
            <span className="math-label">Resto della divisione per 12</span>
            <strong className="math-readout">
              {number} mod {clockSize} = {residue}
            </strong>
            <span className="math-expression">
              {number} = {clockSize} × {turns} + {residue}
            </span>
          </div>
          <p>Numeri che atterrano sulla stessa posizione sono congruenti modulo 12.</p>
        </div>
      </div>
    </HudPanel>
  );
}

function PowerLab() {
  const [base, setBase] = useState(3);
  const [exponent, setExponent] = useState(4);
  const [modulus, setModulus] = useState(7);
  const { initial, result, steps } = modularPower(base, exponent, modulus);

  return (
    <HudPanel heading="Potenze modulo n" className="math-panel">
      <p>
        A ogni passo moltiplica il resto precedente per la base e prendi il nuovo resto. Puoi
        ridurre a ogni moltiplicazione e ottenere lo stesso risultato della potenza calcolata per
        intero.
      </p>
      <div className="math-power-controls" role="group" aria-label="Parametri della potenza">
        <NumberSelect label="Base" values={bases} value={base} onChange={setBase} />
        <NumberSelect
          label="Esponente"
          values={exponents}
          value={exponent}
          onChange={setExponent}
        />
        <NumberSelect label="Modulo" values={moduli} value={modulus} onChange={setModulus} />
      </div>
      <div className="math-card math-power-trace">
        <div className="math-power-result" aria-live="polite" aria-atomic="true">
          <span className="math-label">Risultato</span>
          <strong className="math-readout">
            {base}
            <sup>{exponent}</sup> mod {modulus} = {result}
          </strong>
        </div>
        <ol className="math-residues" aria-label="Passi della potenza modulare">
          <li aria-current={exponent === 0 ? "step" : undefined}>
            <span>
              {base}
              <sup>0</sup>
            </span>
            <span>
              1 mod {modulus} = <strong>{initial}</strong>
            </span>
          </li>
          {steps.map(({ power, previous, residue }) => (
            <li key={power} aria-current={power === exponent ? "step" : undefined}>
              <span>
                {base}
                <sup>{power}</sup>
              </span>
              <span>
                ({previous} × {base}) mod {modulus} = <strong>{residue}</strong>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </HudPanel>
  );
}

function KeyExchangeLab() {
  const [alice, setAlice] = useState(6);
  const [bob, setBob] = useState(15);
  const alicePublic = modularPower(generator, alice, prime).result;
  const bobPublic = modularPower(generator, bob, prime).result;
  const aliceSecret = modularPower(bobPublic, alice, prime).result;
  const bobSecret = modularPower(alicePublic, bob, prime).result;

  return (
    <HudPanel heading="Diffie–Hellman in miniatura" className="math-panel">
      <p>
        Cambia gli esponenti privati di Alice e Bob e segui i valori che attraversano il canale. I
        parametri pubblici del modello didattico sono il primo <code>p = {prime}</code> e la base{" "}
        <code>g = {generator}</code>.
      </p>
      <div className="math-exchange">
        <section className="math-card math-party">
          <h3>Alice</h3>
          <NumberSelect
            label="Esponente privato di Alice"
            values={privateExponents}
            value={alice}
            onChange={setAlice}
          />
          <p className="math-expression">
            <span className="math-label">Valore pubblico</span>A = {generator}
            <sup>{alice}</sup> mod {prime} = <strong>{alicePublic}</strong>
          </p>
          <p className="math-expression">
            <span className="math-label">Segreto calcolato da Alice</span>B<sup>{alice}</sup> mod{" "}
            {prime} = {bobPublic}
            <sup>{alice}</sup> mod {prime} = <strong>{aliceSecret}</strong>
          </p>
        </section>

        <section className="math-exchange-channel" aria-label="Canale pubblico">
          <HudBadge>Canale pubblico</HudBadge>
          <p className="math-channel-message">
            Alice invia <strong>A = {alicePublic}</strong> <ArrowRight aria-hidden="true" />
          </p>
          <p className="math-channel-message">
            <ArrowLeft aria-hidden="true" /> <strong>B = {bobPublic}</strong> viene da Bob
          </p>
        </section>

        <section className="math-card math-party">
          <h3>Bob</h3>
          <NumberSelect
            label="Esponente privato di Bob"
            values={privateExponents}
            value={bob}
            onChange={setBob}
          />
          <p className="math-expression">
            <span className="math-label">Valore pubblico</span>B = {generator}
            <sup>{bob}</sup> mod {prime} = <strong>{bobPublic}</strong>
          </p>
          <p className="math-expression">
            <span className="math-label">Segreto calcolato da Bob</span>A<sup>{bob}</sup> mod{" "}
            {prime} = {alicePublic}
            <sup>{bob}</sup> mod {prime} = <strong>{bobSecret}</strong>
          </p>
        </section>
      </div>
      <div className="math-shared-secret">
        <strong className="math-shared-result" aria-live="polite" aria-atomic="true">
          <LockKeyhole aria-hidden="true" /> Segreto condiviso: {aliceSecret}
        </strong>
        <p>
          Alice eleva il valore pubblico di Bob al suo esponente privato. Bob fa il contrario. I due
          calcoli producono{" "}
          <code>
            g<sup>a × b</sup> mod p
          </code>{" "}
          perché <code>a × b = b × a</code>. Alice e Bob si scambiano <code>A</code> e{" "}
          <code>B</code> e tengono per sé i propri esponenti.
        </p>
        <p>
          Il primo 23 serve a rendere visibili i passaggi. I protocolli reali usano gruppi con
          parametri adeguati e derivano le chiavi di traffico dal segreto condiviso.
        </p>
      </div>
    </HudPanel>
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
  const labelId = useId();

  return (
    <label className="nr-field">
      <span id={labelId} className="math-label">
        {label}
      </span>
      <select
        aria-labelledby={labelId}
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
    </label>
  );
}
