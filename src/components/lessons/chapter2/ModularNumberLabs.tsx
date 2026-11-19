import { useId, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { HudButton, HudTextField } from "@/design-system/nightrunner";
import { euclideanDivisions, gcd, modularPower, modulo, residues } from "./modular-arithmetic";

const positiveNumbers = residues(61).slice(1);
const phiModuli = residues(31).slice(2);
const smallPrimes = [3, 5, 7, 11, 13];
const rsaStages = [
  "Scegli i primi",
  "Calcola n, φ e verifica e",
  "Trova d",
  "Scegli m",
  "Cifra",
  "Decifra",
];

export function EuclidLab() {
  const [a, setA] = useState(48);
  const [b, setB] = useState(18);
  const [step, setStep] = useState(0);
  const divisions = euclideanDivisions(a, b);
  const currentDivision = divisions[step];
  if (!currentDivision) return null;

  const { dividend, divisor, quotient, remainder } = currentDivision;

  return (
    <section className="crypto-stage math-stage" aria-label="Algoritmo di Euclide">
      <h2 className="crypto-stage-label">Algoritmo di Euclide</h2>
      <p className="math-tutorial-copy">
        Il massimo comune divisore (MCD) è il più grande intero che divide entrambi i numeri. Dividi
        il primo numero per il secondo, poi usa il divisore e il resto come prossima coppia. Così il
        secondo numero si riduce a ogni divisione, mentre il MCD resta lo stesso.
      </p>

      <div className="crypto-controls math-settings">
        <NumberSelect
          label="Primo numero a"
          values={positiveNumbers}
          value={a}
          onChange={(next) => {
            setA(next);
            setStep(0);
          }}
        />
        <NumberSelect
          label="Secondo numero b"
          values={positiveNumbers}
          value={b}
          onChange={(next) => {
            setB(next);
            setStep(0);
          }}
        />
      </div>

      <div className="math-division-board" aria-live="polite" aria-atomic="true">
        <ol className="math-division-list" aria-label="Divisioni di Euclide">
          {divisions.slice(0, step + 1).map((division, index) => (
            <li key={index} aria-current={index === step ? "step" : undefined}>
              <span className="math-label">{index + 1}</span>
              <strong className="math-expression">
                {division.dividend} = {division.quotient} × {division.divisor} +{" "}
                {division.remainder}
              </strong>
            </li>
          ))}
        </ol>
        {remainder === 0 ? (
          <>
            <strong className="math-readout">
              MCD({a}, {b}) = {divisor}
            </strong>
            <p className="math-tutorial-copy">
              Con resto zero, {divisor} divide {dividend}. Il MCD dell’ultima coppia è quindi{" "}
              {divisor}, e tutte le coppie precedenti hanno lo stesso MCD.
            </p>
          </>
        ) : (
          <p className="math-tutorial-copy">
            Ogni divisore comune di {dividend} e {divisor} divide anche il resto {remainder} ={" "}
            {dividend} − {quotient} × {divisor}. Vale anche il contrario, perché sommando di nuovo{" "}
            {quotient} × {divisor} al resto ottieni {dividend}. Possiamo quindi passare alla coppia
            ({divisor}, {remainder}).
          </p>
        )}
      </div>

      <div className="crypto-controls math-step-actions">
        <HudButton variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <ArrowLeft aria-hidden="true" /> Divisione precedente
        </HudButton>
        <HudButton disabled={remainder === 0} onClick={() => setStep(step + 1)}>
          Prossima divisione <ArrowRight aria-hidden="true" />
        </HudButton>
      </div>
      <p className="crypto-legend">
        Prova anche 35 e 12. Se l’ultimo divisore è 1, i due numeri sono coprimi.
      </p>
    </section>
  );
}

export function CoprimeLab() {
  const [modulus, setModulus] = useState(12);
  const [selected, setSelected] = useState(4);
  const candidates = residues(modulus)
    .slice(1)
    .map((value) => ({ value, divisor: gcd(value, modulus) }));
  const coprimes = candidates.filter(({ divisor }) => divisor === 1);
  const divisor = gcd(selected, modulus);

  return (
    <section className="crypto-stage math-stage" aria-label="Coprimi e funzione di Eulero">
      <h2 className="crypto-stage-label">Coprimi e funzione di Eulero</h2>
      <p className="math-tutorial-copy">
        Due numeri sono coprimi quando il loro MCD è 1. Per calcolare φ(n), scorri gli interi da 1 a
        n − 1 e conta quelli che sono coprimi con n. Seleziona una casella per controllare il suo
        MCD con n.
      </p>
      <div className="math-coprime-header">
        <NumberSelect
          label="Numero n"
          values={phiModuli}
          value={modulus}
          onChange={(next) => {
            setModulus(next);
            setSelected(Math.min(selected, next - 1));
          }}
        />
        <p className="math-coprime-legend">
          <span data-coprime="true">✓ Coprimo</span>
          <span>· MCD maggiore di 1</span>
        </p>
      </div>

      <div className="math-coprime-grid" role="group" aria-label="Candidati da 1 a n meno 1">
        {candidates.map(({ value, divisor }) => (
          <button
            key={value}
            type="button"
            aria-label={`Numero ${value}, ${divisor === 1 ? "coprimo" : "MCD maggiore di 1"}`}
            aria-pressed={selected === value}
            data-coprime={divisor === 1}
            onClick={() => setSelected(value)}
          >
            <strong>{value}</strong>
            <span aria-hidden="true">{divisor === 1 ? "✓" : "·"}</span>
          </button>
        ))}
      </div>

      <div className="math-number-result" aria-live="polite" aria-atomic="true">
        <strong className="math-readout">
          φ({modulus}) = {coprimes.length}
        </strong>
        <span className="math-expression">
          Coprimi con {modulus} · {coprimes.map(({ value }) => value).join(", ")}
        </span>
        <p className="math-tutorial-copy">
          <strong className="math-expression">
            MCD({selected}, {modulus}) = {divisor}
          </strong>{" "}
          {divisor === 1
            ? "Questa casella conta in φ(n)."
            : `${divisor} divide entrambi, quindi questa casella è esclusa dal conteggio.`}
        </p>
      </div>
      <p className="crypto-legend">
        Con n = 11 tutte le caselle contano. Un primo p ha come divisori positivi solo 1 e p, quindi
        ciascun intero da 1 a p − 1 è coprimo con p.
      </p>
    </section>
  );
}

export function MiniRsaLab() {
  const [stage, setStage] = useState(0);
  const [p, setP] = useState(5);
  const [q, setQ] = useState(11);
  const [e, setE] = useState(3);
  const [entry, setEntry] = useState("7");
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  const divisor = gcd(e, phi);
  const d =
    stage >= 2 && divisor === 1
      ? residues(phi).find((candidate) => modulo(e * candidate, phi) === 1)
      : undefined;
  const m = Number(entry);
  const validMessage = /^\d+$/.test(entry.trim()) && m < n;
  const cipher = stage >= 4 ? modularPower(m, e, n).result : undefined;
  const recovered =
    stage === 5 && cipher !== undefined && d !== undefined
      ? modularPower(cipher, d, n).result
      : undefined;
  const actions = [
    "Calcola n e φ(n)",
    "Trova l’inverso d",
    "Scegli il messaggio",
    "Cifra il messaggio",
    "Decifra il messaggio",
    "Ricomincia",
  ];
  const canContinue =
    (stage !== 0 || p !== q) && (stage !== 1 || divisor === 1) && (stage !== 3 || validMessage);

  function advance() {
    if (stage < rsaStages.length - 1) {
      setStage(stage + 1);
      return;
    }

    setStage(0);
    setP(5);
    setQ(11);
    setE(3);
    setEntry("7");
  }

  return (
    <section className="crypto-stage math-stage" aria-label="Mini-RSA">
      <h2 className="crypto-stage-label">Mini-RSA</h2>
      <p className="math-tutorial-copy">
        Costruisci una coppia di chiavi, cifra un numero e recuperalo. Questo esempio usa numeri
        piccoli e RSA senza padding ed è adatto solo alla didattica.
      </p>

      <ol className="math-rsa-stages" aria-label="Fasi di Mini-RSA">
        {rsaStages.map((label, index) => (
          <li
            key={label}
            aria-current={index === stage ? "step" : undefined}
            data-complete={index < stage}
          >
            <span>{index + 1}</span> {label}
          </li>
        ))}
      </ol>

      {stage >= 2 && (
        <div className="math-rsa-keys" aria-label="Chiavi di Mini-RSA">
          <p>
            Chiave pubblica{" "}
            <strong>
              (n = {n}, e = {e})
            </strong>
          </p>
          <p>
            Chiave privata{" "}
            <strong>
              (n = {n}, d = {d})
            </strong>
          </p>
        </div>
      )}

      <div className="math-rsa-work">
        <h3 aria-live="polite" className="math-rsa-step-title">
          {rsaStages[stage]}
        </h3>
        {stage === 0 && (
          <>
            <p className="math-tutorial-copy">
              Scegli due primi distinti p e q. Il prodotto sarà il modulo n. Conoscere i due fattori
              ci permette di contare i coprimi con n usando una formula.
            </p>
            <div className="crypto-controls math-settings">
              <NumberSelect
                label="Primo p"
                values={smallPrimes}
                value={p}
                onChange={(next) => {
                  setP(next);
                  setE(3);
                }}
              />
              <NumberSelect
                label="Primo q"
                values={smallPrimes}
                value={q}
                onChange={(next) => {
                  setQ(next);
                  setE(3);
                }}
              />
            </div>
            {p === q && (
              <p className="math-invalid" role="status">
                Scegli due primi diversi.
              </p>
            )}
          </>
        )}
        {stage === 1 && (
          <>
            <div className="math-number-result">
              <strong className="math-readout">
                n = {p} × {q} = {n}
              </strong>
              <strong className="math-readout">
                φ({n}) = {p - 1} × {q - 1} = {phi}
              </strong>
            </div>
            <p className="math-tutorial-copy">
              Tra 1 e n − 1 vanno esclusi i {q - 1} multipli di {p} e i {p - 1} multipli di {q}. I
              due gruppi sono disgiunti, perché il primo multiplo in comune è n. Rimangono (p − 1)(q
              − 1) coprimi con n.
            </p>
            <p className="math-tutorial-copy">
              Scegli l’esponente pubblico e tra 2 e φ(n) − 1. Cerca un valore con MCD(e, φ(n)) = 1.
              Così e è coprimo con φ(n) e avrà un inverso modulare da usare per decifrare.
            </p>
            <div className="math-rsa-input">
              <NumberSelect
                label="Esponente pubblico e"
                values={residues(phi).slice(2)}
                value={e}
                onChange={setE}
              />
            </div>
            <div className="math-number-result" data-invalid={divisor !== 1} aria-live="polite">
              <strong className="math-expression">
                MCD({e}, {phi}) = {divisor}
              </strong>
              <p className="math-tutorial-copy">
                {divisor === 1
                  ? "L’esponente è valido. L’inverso esiste."
                  : `Ogni prodotto e × d e ogni multiplo di φ(n) sono divisibili per ${divisor}. Anche il resto lo sarà, quindi il resto 1 è impossibile.`}
              </p>
            </div>
          </>
        )}
        {stage === 2 && d !== undefined && (
          <>
            <p className="math-tutorial-copy">
              Cerchiamo d come nel laboratorio sugli inversi. Proviamo i moltiplicatori da 1 a φ(n)
              − 1 finché e × d diviso per φ(n) lascia resto 1.
            </p>
            <p className="math-tutorial-copy">
              Con d = {d - 1}, il resto di {e} × {d - 1} modulo {phi} è {modulo(e * (d - 1), phi)}.
              Continuando con d = {d}, si trova il resto 1.
            </p>
            <div className="math-number-result">
              <strong className="math-readout">
                ({e} × {d}) mod {phi} = 1
              </strong>
              <span className="math-expression">
                {e} × {d} = {Math.floor((e * d) / phi)} × {phi} + 1
              </span>
            </div>
            <p className="math-tutorial-copy">
              Cifrare e poi decifrare moltiplica gli esponenti. Il prodotto e × d ha la forma 1 + k
              × φ(n), la relazione che ci permetterà di recuperare m.
            </p>
          </>
        )}
        {stage === 3 && (
          <>
            <p className="math-tutorial-copy">
              Usa un numero da 0 a {n - 1} come messaggio. Ogni posizione modulo n ha un solo
              rappresentante in questo intervallo. Se scegliessi m + n, avrebbe lo stesso resto di m
              e la cifratura darebbe lo stesso risultato.
            </p>
            <div className="math-rsa-input">
              <HudTextField
                label="Messaggio m"
                value={entry}
                inputMode="numeric"
                autoComplete="off"
                aria-invalid={!validMessage}
                onChange={(event) => setEntry(event.currentTarget.value)}
              />
            </div>
            {!validMessage && (
              <p className="math-invalid" role="status">
                Inserisci un intero tra 0 e {n - 1}.
              </p>
            )}
          </>
        )}
        {stage === 4 && (
          <>
            <p className="math-tutorial-copy">
              Chi cifra usa la chiave pubblica (n, e). Parti da 1 e moltiplica per m una volta per
              ogni unità dell’esponente e, prendendo il resto modulo n a ogni passaggio.
            </p>
            <RsaPower base={m} exponent={e} modulus={n} label="Cifrato c" />
            <p className="math-tutorial-copy">Il resto finale c è il numero da inviare.</p>
          </>
        )}
        {stage === 5 && cipher !== undefined && d !== undefined && (
          <>
            <p className="math-tutorial-copy">
              Chi riceve usa c come base e l’esponente privato d. Il modulo resta n. La seconda
              potenza applica d alla prima e ottiene lo stesso resto di m elevato a e × d.
            </p>
            <RsaPower base={cipher} exponent={d} modulus={n} label="Potenza di decifratura" />
            <output className="math-number-result" aria-label="Messaggio recuperato">
              <strong className="math-readout">m′ = {recovered}</strong>
              <span className="math-expression">Coincide con il messaggio iniziale m = {m}.</span>
            </output>
            <details className="math-details" open>
              <summary>Perché torna proprio m?</summary>
              <p className="math-tutorial-copy">
                Il prodotto e × d è 1 più un multiplo di φ(n), quindi anche 1 più un multiplo sia di
                p − 1 sia di q − 1. Modulo un primo p, se m è divisibile per p, tutte le sue potenze
                positive lasciano resto zero. Altrimenti, per il piccolo teorema di Fermat, m
                <sup>p − 1</sup> lascia resto 1. In entrambi i casi la potenza con esponente e × d
                lascia lo stesso resto di m modulo p. Lo stesso vale modulo q.
              </p>
              <p className="math-tutorial-copy">
                Per vedere da dove viene quel resto 1, moltiplica per m ciascuno dei resti da 1 a p
                − 1. Quando m è coprimo con p, questa operazione riordina le posizioni, come nel
                laboratorio sugli inversi. Il loro prodotto resta quindi congruente allo stesso
                prodotto moltiplicato per m<sup>p − 1</sup>. Siccome il prodotto è invertibile
                modulo p, puoi cancellarlo e ottenere il resto 1.
              </p>
              <p className="math-tutorial-copy">
                Due numeri con gli stessi resti modulo p e modulo q differiscono di un multiplo di
                entrambi. Poiché p e q sono primi distinti, la differenza è multipla di p × q. I due
                resti individuano quindi un unico m nell’intervallo da 0 a n − 1.
              </p>
            </details>
          </>
        )}
      </div>

      <div className="crypto-controls math-step-actions">
        <HudButton
          variant="secondary"
          aria-label="Passo precedente di Mini-RSA"
          disabled={stage === 0}
          onClick={() => setStage(stage - 1)}
        >
          <ArrowLeft aria-hidden="true" /> Indietro
        </HudButton>
        <HudButton disabled={!canContinue} onClick={advance}>
          {actions[stage]} <ArrowRight aria-hidden="true" />
        </HudButton>
      </div>
    </section>
  );
}

function RsaPower({
  base,
  exponent,
  modulus,
  label,
}: {
  base: number;
  exponent: number;
  modulus: number;
  label: string;
}) {
  const { trace, result } = modularPower(base, exponent, modulus);

  return (
    <>
      <output className="math-number-result" aria-label={label}>
        <span className="math-label">{label}</span>
        <strong className="math-readout">
          {base}
          <sup>{exponent}</sup> mod {modulus} = {result}
        </strong>
      </output>
      <details className="math-details">
        <summary>Segui i resti della potenza</summary>
        <ol className="math-division-list" aria-label="Calcoli della potenza">
          {trace.slice(1).map(({ power, previous, residue }) => (
            <li key={power}>
              <span className="math-label">{power}</span>
              <span className="math-expression">
                ({previous} × {base}) mod {modulus} = {residue}
              </span>
            </li>
          ))}
        </ol>
      </details>
    </>
  );
}

export function NumberSelect({
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
