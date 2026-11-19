import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { HudButton } from "@/design-system/nightrunner";
import { NumberSelect } from "./ModularNumberLabs";
import { extendedEuclid, gcd, modularPower, modulo, residues } from "./modular-arithmetic";

const eulerModuli = [5, 7, 8, 9, 11, 12, 13, 15];
const crtModuli = [2, 3, 4, 5, 6, 7];

export function FermatEulerLab() {
  const [base, setBase] = useState(2);
  const [modulus, setModulus] = useState(7);
  const [stage, setStage] = useState(0);
  const [selected, setSelected] = useState(1);
  const values = residues(modulus);
  const coprimes = values.slice(1).filter((value) => gcd(value, modulus) === 1);
  const exponent = coprimes.length;
  const primeModulus = exponent === modulus - 1;
  const divisor = gcd(base, modulus);
  const products = coprimes.map((value) => modulo(base * value, modulus));
  const distinct = new Set(products).size;
  const before = coprimes.reduce((product, value) => modulo(product * value, modulus), 1);
  const after = products.reduce((product, value) => modulo(product * value, modulus), 1);
  const power = modularPower(base, exponent, modulus).result;
  const actions = ["Moltiplica i coprimi", "Verifica la potenza", "Ricomincia il confronto"];

  function changeExample(nextBase: number, nextModulus: number) {
    setBase(nextBase);
    setModulus(nextModulus);
    setStage(0);
    setSelected(1);
  }

  return (
    <section className="crypto-stage math-stage" aria-label="Il ritorno a 1 di Fermat ed Eulero">
      <h2 className="crypto-stage-label">Il ritorno a 1 di Fermat ed Eulero</h2>
      <p className="math-tutorial-copy">
        Se a e n sono coprimi, elevare a al numero di coprimi con n dà resto 1. Per capire perché,
        parti dalla stessa griglia usata per contare φ(n). Osserva dove finisce ogni casella quando
        moltiplichi per a.
      </p>

      <div className="crypto-controls" role="group" aria-label="Esempi di Fermat ed Eulero">
        <HudButton variant="secondary" onClick={() => changeExample(2, 7)}>
          Prova 2 modulo 7
        </HudButton>
        <HudButton variant="secondary" onClick={() => changeExample(2, 9)}>
          Prova 2 modulo 9
        </HudButton>
        <HudButton variant="secondary" onClick={() => changeExample(3, 9)}>
          Prova 3 modulo 9
        </HudButton>
      </div>
      <div className="crypto-controls math-settings">
        <NumberSelect
          label="Modulo n"
          values={eulerModuli}
          value={modulus}
          onChange={(next) => changeExample(modulo(base, next), next)}
        />
        <NumberSelect
          label="Base a"
          values={values}
          value={base}
          onChange={(next) => changeExample(next, modulus)}
        />
      </div>

      <div className="math-theorem-board">
        <div className="math-theorem-head">
          <strong className="math-expression">
            φ({modulus}) = {exponent}
          </strong>
          <strong className="math-expression">
            MCD({base}, {modulus}) = {divisor}
          </strong>
        </div>
        <p className="math-tutorial-copy">
          {stage === 0
            ? "Queste sono le caselle coprime con n. Con il prossimo passo apparirà il resto ottenuto da ciascuna."
            : "Ogni freccia segue una casella dal numero di partenza al suo nuovo resto. Seleziona una coppia per vedere il calcolo."}
        </p>
        <div
          className="math-permutation"
          role="group"
          aria-label="Griglia di permutazione dei coprimi"
        >
          {coprimes.map((value) => {
            const product = modulo(base * value, modulus);
            return (
              <button
                key={value}
                type="button"
                aria-label={stage === 0 ? `Coprimo ${value}` : `Da ${value} al resto ${product}`}
                disabled={stage === 0}
                aria-pressed={stage > 0 && selected === value}
                data-outside={stage > 0 && !coprimes.includes(product)}
                onClick={() => setSelected(value)}
              >
                <span>{value}</span>
                {stage > 0 && (
                  <>
                    <ArrowRight aria-hidden="true" />
                    <strong>{product}</strong>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {stage > 0 && (
          <div className="math-number-result" data-invalid={divisor !== 1} aria-live="polite">
            <strong className="math-expression">
              ({base} × {selected}) mod {modulus} = {modulo(base * selected, modulus)}
            </strong>
            <strong className="math-expression">
              {distinct} resti distinti su {exponent}
            </strong>
            <p className="math-tutorial-copy">
              {divisor === 1
                ? "Il prodotto di due coprimi con n è ancora coprimo con n. Poiché a ha un inverso, puoi tornare dalla casella di arrivo a quella di partenza. Quindi ogni resto compare una volta e il prodotto resta lo stesso."
                : `Ogni nuovo resto condivide il fattore ${divisor} con ${modulus}. Le caselle escono dall’insieme dei coprimi, quindi il ragionamento della permutazione si interrompe.`}
            </p>
          </div>
        )}
      </div>

      {stage === 2 && (
        <>
          <div className="math-theorem-board">
            <p className="math-tutorial-copy">
              Il prodotto delle caselle originali lascia resto <strong>{before}</strong>.
              Moltiplicarle tutte per {base} introduce {exponent} fattori {base} e il prodotto delle
              nuove caselle lascia resto <strong>{after}</strong>.
            </p>
            <p className="math-tutorial-copy">
              {divisor === 1
                ? "I due prodotti hanno lo stesso resto. Il prodotto delle caselle originali è invertibile, perché ogni fattore è coprimo con n. Puoi cancellarlo dai due membri. Rimane solo la potenza, che dà resto 1."
                : "Il teorema richiede MCD(a, n) = 1. Qui la potenza conserva il fattore comune con n e lascia un resto diverso da 1."}
            </p>
          </div>
          <output className="math-number-result" aria-label="Potenza di Eulero">
            <strong className="math-readout">
              {base}
              <sup>{exponent}</sup> mod {modulus} = {power}
            </strong>
            <span className="math-expression">
              {divisor !== 1
                ? "L’ipotesi di coprimalità non è soddisfatta."
                : primeModulus
                  ? `Piccolo teorema di Fermat · ${modulus} è primo e l’esponente è p − 1 = ${exponent}.`
                  : `Teorema di Eulero · ${modulus} è composto e l’esponente è φ(${modulus}) = ${exponent}.`}
            </span>
            {!primeModulus && divisor === 1 && (
              <span className="math-expression">
                Con l’esponente n − 1, qui ottieni {base}
                <sup>{modulus - 1}</sup> mod {modulus} ={" "}
                {modularPower(base, modulus - 1, modulus).result}.
              </span>
            )}
          </output>
        </>
      )}

      <div className="crypto-controls math-step-actions">
        <HudButton onClick={() => setStage((stage + 1) % actions.length)}>
          {actions[stage]} <ArrowRight aria-hidden="true" />
        </HudButton>
      </div>
      <p className="crypto-legend">
        Quando una potenza lascia resto 1, puoi aggiungere quell’esponente senza cambiare il resto.
        In Mini-RSA questa idea, applicata ai due primi, spiega perché decifrare annulla la
        cifratura.
      </p>
    </section>
  );
}

export function CrtLab() {
  const [firstModulus, setFirstModulus] = useState(3);
  const [secondModulus, setSecondModulus] = useState(5);
  const [firstRemainder, setFirstRemainder] = useState(2);
  const [secondRemainder, setSecondRemainder] = useState(3);
  const [stage, setStage] = useState(0);
  const { divisor, first: coefficient } = extendedEuclid(firstModulus, secondModulus);
  const period = (firstModulus * secondModulus) / divisor;
  const cells = residues(period).map((value) => ({
    value,
    left: modulo(value, firstModulus) === firstRemainder,
    right: modulo(value, secondModulus) === secondRemainder,
  }));
  const solution = cells.find(({ left, right }) => left && right)?.value;
  const actions = ["Applica il primo resto", "Incrocia i due resti", "Ricomincia il confronto"];
  const inverse = modulo(coefficient, secondModulus);
  const jump = modulo((secondRemainder - firstRemainder) * inverse, secondModulus);

  return (
    <section className="crypto-stage math-stage" aria-label="Teorema cinese del resto">
      <h2 className="crypto-stage-label">Teorema cinese del resto</h2>
      <p className="math-tutorial-copy">
        Cerca un numero che lasci due resti assegnati. Per esempio, se metti delle tessere in file
        da 3 ne avanzano 2. In file da 5 ne avanzano 3. Quale casella rispetta entrambe le
        condizioni?
      </p>

      <div className="math-crt-settings">
        <div className="crypto-controls math-settings">
          <NumberSelect
            label="Primo modulo"
            values={crtModuli}
            value={firstModulus}
            onChange={(next) => {
              setFirstModulus(next);
              setFirstRemainder(modulo(firstRemainder, next));
              setStage(0);
            }}
          />
          <NumberSelect
            label="Primo resto"
            values={residues(firstModulus)}
            value={firstRemainder}
            onChange={(next) => {
              setFirstRemainder(next);
              setStage(0);
            }}
          />
        </div>
        <div className="crypto-controls math-settings">
          <NumberSelect
            label="Secondo modulo"
            values={crtModuli}
            value={secondModulus}
            onChange={(next) => {
              setSecondModulus(next);
              setSecondRemainder(modulo(secondRemainder, next));
              setStage(0);
            }}
          />
          <NumberSelect
            label="Secondo resto"
            values={residues(secondModulus)}
            value={secondRemainder}
            onChange={(next) => {
              setSecondRemainder(next);
              setStage(0);
            }}
          />
        </div>
      </div>

      <div className="math-theorem-board">
        <div className="math-theorem-head">
          <span className="math-expression">
            <strong className="math-crt-first">I</strong> · x mod {firstModulus} = {firstRemainder}
          </span>
          <span className="math-expression">
            <strong className="math-crt-second">II</strong> · x mod {secondModulus} ={" "}
            {secondRemainder}
          </span>
        </div>
        <p className="math-tutorial-copy">
          Esplora le caselle da 0 a {period - 1}. Da {period} in poi ritrovi gli stessi resti,
          perché {period} è il più piccolo multiplo comune dei due moduli.
        </p>
        <ul className="math-crt-grid" aria-label="Candidati di un periodo">
          {cells.map(({ value, left, right }) => {
            const matches = stage > 1 && left && right;
            const first = stage > 0 && left;
            const second = stage > 1 && right;
            return (
              <li key={value} data-first={first} data-second={second} data-match={matches}>
                <strong>{value}</strong>
                {matches ? (
                  <span aria-label="Soddisfa entrambe le condizioni">I ∩ II</span>
                ) : (
                  (first || second) && (
                    <span
                      aria-label={
                        first ? "Soddisfa la prima condizione" : "Soddisfa la seconda condizione"
                      }
                    >
                      {first ? "I" : "II"}
                    </span>
                  )
                )}
              </li>
            );
          })}
        </ul>
        {stage === 1 && (
          <p className="math-tutorial-copy" role="status">
            Partendo da {firstRemainder}, aggiungi {firstModulus} ogni volta. Queste sono tutte le
            caselle con il primo resto. Ora cerca fra loro quella che soddisfa anche il secondo.
          </p>
        )}
      </div>

      {stage === 2 && (
        <output
          className="math-number-result"
          data-invalid={solution === undefined}
          aria-label="Intersezione dei resti"
        >
          <strong className="math-readout">
            {solution === undefined ? "Nessuna soluzione" : `x ≡ ${solution} (mod ${period})`}
          </strong>
          <span className="math-expression">
            {solution === undefined
              ? `I due resti sono diversi modulo ${divisor}, il MCD dei moduli. Un solo numero non può lasciarli entrambi.`
              : `${solution} mod ${firstModulus} = ${firstRemainder} e ${solution} mod ${secondModulus} = ${secondRemainder}.`}
          </span>
          {solution !== undefined && (
            <span className="math-tutorial-copy">
              Due soluzioni differiscono di un multiplo di entrambi i moduli e quindi di {period}.
              Nell’intervallo mostrato puoi trovare una sola intersezione.
            </span>
          )}
        </output>
      )}

      {stage === 2 && divisor === 1 && (
        <div className="math-theorem-board">
          <p className="math-tutorial-copy">
            Con moduli coprimi, i salti di {firstModulus} attraversano tutte le posizioni modulo{" "}
            {secondModulus} una volta ciascuna, come nel laboratorio sugli inversi. Uno di questi
            salti raggiunge sempre il secondo resto. Il periodo è il prodotto dei moduli,{" "}
            {firstModulus} × {secondModulus} = {period}.
          </p>
          <details className="math-details">
            <summary>Calcola il numero di salti con un inverso</summary>
            <p className="math-tutorial-copy">
              Scrivi x = {firstRemainder} + {firstModulus} × k. Per ottenere il secondo resto,
              {firstModulus} × k deve essere congruente a {secondRemainder} − {firstRemainder}{" "}
              modulo {secondModulus}. Moltiplica per {inverse}, l’inverso di {firstModulus} modulo{" "}
              {secondModulus}.
            </p>
            <strong className="math-expression">
              k = (({secondRemainder} − {firstRemainder}) × {inverse}) mod {secondModulus} = {jump}
            </strong>
          </details>
        </div>
      )}

      <div className="crypto-controls math-step-actions">
        <HudButton onClick={() => setStage((stage + 1) % actions.length)}>
          {actions[stage]} <ArrowRight aria-hidden="true" />
        </HudButton>
      </div>
      <p className="crypto-legend">
        In RSA, quando conosci i primi p e q, puoi ricavare i resti del messaggio modulo p e modulo
        q. Il teorema cinese del resto li riunisce in un unico messaggio modulo p × q.
      </p>
    </section>
  );
}
