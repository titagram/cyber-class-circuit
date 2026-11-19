import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Ban,
  FileText,
  KeyRound,
  LockKeyhole,
  LockKeyholeOpen,
  Package,
  Server,
  Shield,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { aeadCases, aeadEnvelope } from "@/content/lessons/chapter2-symmetric";
import { TutorialFrame, type TutorialStep } from "./TutorialFrame";
import "./SymmetricLabs.css";
import "./AuthenticatedEncryptionLab.css";

const steps = [
  {
    label: "Prepara",
    title: "Il browser prepara il contratto 42",
    explanation: (
      <p>
        Il browser deve inviare al server il contratto 42 del tenant Alfa, lo spazio riservato al
        cliente Alfa. Il testo in chiaro è il documento ancora leggibile. Browser e server hanno già
        la stessa chiave segreta, che useranno rispettivamente per proteggere e aprire il documento.
      </p>
    ),
  },
  {
    label: "Cifra",
    title: "Il browser cifra il contratto e crea la busta",
    explanation: (
      <p>
        Il browser usa AES-GCM, una cifratura autenticata con dati associati (AEAD). La cifratura
        protegge l’importo dalla lettura. Il <strong>tag</strong> è un valore calcolato con la
        chiave segreta che permette al server di controllare il testo cifrato e i dati associati
        (AAD), qui il tenant Alfa e il numero del documento.
      </p>
    ),
  },
  {
    label: "Trasmetti",
    title: "Il server riceve la busta e ricostruisce il contesto",
    explanation: (
      <p>
        La busta trasporta nonce, testo cifrato e tag. La chiave resta presso browser e server. Per
        ricostruire gli stessi dati associati, il server usa il tenant della sessione e il numero
        del documento richiesto. Scegli un caso e confronta ciò che parte con ciò che il server
        userà.
      </p>
    ),
  },
  {
    label: "Verifica",
    title: "Il server verifica prima di consegnare il contratto",
    explanation: (
      <p>
        Il server usa chiave, nonce, testo cifrato e contesto ricostruito per calcolare il tag
        atteso. Se coincide con quello ricevuto, consegna il testo in chiaro. Se differisce, scarta
        la busta. In questo esercizio i valori del confronto sono calcolati in anticipo usando
        AES-GCM.
      </p>
    ),
  },
] as const satisfies readonly TutorialStep[];

const nextLabels = ["Cifra il contratto", "Invia la busta", "Passa al controllo del tag"] as const;
const packetFields = [
  { id: "nonce", label: "Nonce" },
  { id: "ciphertext", label: "Testo cifrato (ciphertext)" },
  { id: "tag", label: "Tag" },
] as const;

type Sample = (typeof aeadCases)[number];

function DiagramLink({
  state = "active",
}: {
  state?: "active" | "waiting" | "success" | "blocked";
}) {
  const Icon = state === "blocked" ? Ban : ArrowRight;
  return (
    <div className="aead-lesson-link" data-state={state} aria-hidden="true">
      <Icon />
    </div>
  );
}

function Packet({ ciphertext = aeadEnvelope.ciphertext }: { ciphertext?: string }) {
  const changed = ciphertext !== aeadEnvelope.ciphertext;

  return (
    <dl className="aead-lesson-fields">
      {packetFields.map(({ id, label }) => (
        <div key={id} data-changed={id === "ciphertext" && changed}>
          <dt>{label}</dt>
          <dd>
            {id === "ciphertext" && changed ? (
              <code>
                <mark className="crypto-symmetric-mark">{ciphertext.slice(0, 2)}</mark>
                {ciphertext.slice(2)}
              </code>
            ) : (
              <code>{aeadEnvelope[id]}</code>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function AAD({ label, value = aeadEnvelope.aad }: { label: string; value?: string }) {
  const changed = value !== aeadEnvelope.aad;
  const tenant = new URLSearchParams(value).get("tenant") ?? "";
  const tenantOffset = value.indexOf(tenant, "tenant=".length);

  return (
    <div className="aead-lesson-aad" data-changed={changed}>
      <span>{label}</span>
      <code>
        {changed ? (
          <>
            {value.slice(0, tenantOffset)}
            <mark className="crypto-symmetric-mark">{tenant}</mark>
            {value.slice(tenantOffset + tenant.length)}
          </>
        ) : (
          value
        )}
      </code>
    </div>
  );
}

function PrepareContract() {
  return (
    <div className="crypto-stage aead-lesson-stage">
      <div className="aead-lesson-flow">
        <section className="crypto-node aead-lesson-node">
          <h3>
            <FileText aria-hidden="true" /> Browser
          </h3>
          <pre className="crypto-readout" aria-label="Testo in chiaro del contratto">
            {aeadEnvelope.plaintext}
          </pre>
          <p className="aead-lesson-key">
            <KeyRound aria-hidden="true" /> Chiave segreta già condivisa
          </p>
        </section>
        <DiagramLink state="waiting" />
        <section className="crypto-node aead-lesson-node">
          <h3>
            <Server aria-hidden="true" /> Server
          </h3>
          <p className="aead-lesson-copy">In attesa del contratto 42.</p>
          <p className="aead-lesson-key">
            <KeyRound aria-hidden="true" /> La stessa chiave segreta
          </p>
        </section>
      </div>
    </div>
  );
}

function EncryptContract() {
  return (
    <div className="crypto-stage aead-lesson-stage">
      <div className="aead-lesson-flow">
        <section className="crypto-node aead-lesson-node">
          <h3>
            <LockKeyhole aria-hidden="true" /> Ingresso di AES-GCM
          </h3>
          <pre className="crypto-readout" aria-label="Testo in chiaro prima della cifratura">
            {aeadEnvelope.plaintext}
          </pre>
          <p className="aead-lesson-key">
            <KeyRound aria-hidden="true" /> Chiave segreta condivisa
          </p>
          <div className="aead-lesson-aad">
            <span>Nonce scelto dal browser</span>
            <code>{aeadEnvelope.nonce}</code>
          </div>
          <AAD label="Dati associati (AAD)" />
        </section>
        <DiagramLink />
        <section className="crypto-node aead-lesson-node">
          <h3>
            <Package aria-hidden="true" /> Busta prodotta
          </h3>
          <Packet />
        </section>
      </div>
      <div className="aead-lesson-example">
        <h3>Segui il primo byte</h3>
        <p>
          AES genera una maschera usando la chiave, il nonce e un contatore che avanza per ogni
          blocco. Qui il primo byte del contratto è la <code>C</code> (<code>43</code> in
          esadecimale). La maschera inizia con <code>{aeadEnvelope.maskFirstByte}</code>. Il simbolo
          ⊕ indica lo XOR, che dà 1 quando i due bit sono diversi e 0 quando sono uguali.
        </p>
        <pre className="crypto-readout" aria-label="Primo byte in esadecimale">
          {`43 ⊕ ${aeadEnvelope.maskFirstByte} = ${aeadEnvelope.ciphertext.slice(0, 2)}`}
        </pre>
        <p>
          Il <strong>nonce</strong> è pubblico e viaggia nella busta. Riusarlo con la stessa chiave
          ripeterebbe la maschera e indebolirebbe la cifratura. L’AAD rimane leggibile e il tag ne
          protegge l’integrità.
        </p>
      </div>
    </div>
  );
}

const transferNotes = {
  original: "Arriva la busta originale e il server ricostruisce i dati associati per Alfa.",
  ciphertext: "Il primo byte del testo cifrato cambia da d2 a d3. Tag e contesto restano identici.",
  aad: "La busta arriva identica. Il server ricostruisce i dati associati per Beta, quindi cambia solo il contesto della verifica.",
} as const;

function TransportContract({
  sample,
  onSampleChange,
}: {
  sample: Sample;
  onSampleChange: (next: Sample) => void;
}) {
  return (
    <div className="crypto-stage aead-lesson-stage">
      <div className="aead-lesson-controls" role="group" aria-label="Caso di trasmissione AES-GCM">
        {aeadCases.map((option) => (
          <Button
            key={option.id}
            type="button"
            size="sm"
            variant={sample.id === option.id ? "default" : "outline"}
            aria-pressed={sample.id === option.id}
            onClick={() => onSampleChange(option)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <div className="aead-lesson-flow">
        <section className="crypto-node aead-lesson-node">
          <h3>
            <Package aria-hidden="true" /> Busta inviata dal browser
          </h3>
          <Packet />
          <AAD label="Contesto usato per creare la busta" />
        </section>
        <DiagramLink />
        <section className="crypto-node aead-lesson-node">
          <h3>
            <Server aria-hidden="true" /> Busta ricevuta dal server
          </h3>
          <Packet ciphertext={sample.receivedCiphertext} />
          <AAD label="Contesto ricostruito sul server" value={sample.serverAad} />
        </section>
      </div>
      <p className="aead-lesson-note" role="status">
        {transferNotes[sample.id]}
      </p>
    </div>
  );
}

function VerifyContract({ sample, verified }: { sample: Sample; verified: boolean }) {
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const accepted = sample.expectedTag === aeadEnvelope.tag;
  const outcome = verified ? (accepted ? "success" : "blocked") : "waiting";
  const GateIcon = verified ? (accepted ? ShieldCheck : ShieldX) : Shield;
  const DocumentIcon = outcome === "success" ? LockKeyholeOpen : LockKeyhole;

  useEffect(() => {
    if (verified) resultHeading.current?.focus();
  }, [verified]);

  return (
    <div className="crypto-stage aead-lesson-stage">
      <div className="aead-lesson-flow" data-nodes="3">
        <section className="crypto-node aead-lesson-node">
          <h3>
            <Package aria-hidden="true" /> Busta ricevuta
          </h3>
          <Packet ciphertext={sample.receivedCiphertext} />
        </section>
        <DiagramLink />
        <section className="crypto-node aead-lesson-node" data-state={outcome}>
          <h3>
            <GateIcon aria-hidden="true" /> Controllo AES-GCM
          </h3>
          <p className="aead-lesson-key">
            <KeyRound aria-hidden="true" /> Chiave segreta condivisa
          </p>
          <AAD label="Contesto ricostruito sul server" value={sample.serverAad} />
          {verified && (
            <dl className="aead-lesson-fields">
              <div>
                <dt>Tag ricevuto</dt>
                <dd>
                  <code>{aeadEnvelope.tag}</code>
                </dd>
              </div>
              <div data-changed={!accepted}>
                <dt>Tag atteso</dt>
                <dd>
                  <code>{sample.expectedTag}</code>
                </dd>
              </div>
            </dl>
          )}
        </section>
        <DiagramLink state={outcome} />
        <section className="crypto-node aead-lesson-node" data-state={outcome}>
          <h3 ref={resultHeading} tabIndex={-1}>
            <DocumentIcon aria-hidden="true" /> Esito per il contratto 42
          </h3>
          <div className="aead-lesson-result" role="status" aria-atomic="true">
            {verified ? (
              <>
                <p className="crypto-status" data-tone={accepted ? "good" : "warning"}>
                  {accepted ? "Accettato" : "Rifiutato"}
                </p>
                <p>{accepted ? "I due tag coincidono." : "I due tag sono diversi."}</p>
                {accepted ? (
                  <pre className="crypto-readout" aria-label="Testo in chiaro restituito">
                    {aeadEnvelope.plaintext}
                  </pre>
                ) : (
                  <p>Nessun testo in chiaro restituito.</p>
                )}
                <p>
                  {sample.id === "aad"
                    ? "La busta è identica. Il tag è stato calcolato per Alfa e il controllo con i dati di Beta fallisce."
                    : sample.explanation}
                </p>
              </>
            ) : (
              <p>In attesa di verifica del tag.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export function AuthenticatedEncryptionLab() {
  const [activeStep, setActiveStep] = useState(0);
  const [sample, setSample] = useState<Sample>(aeadCases[0]);
  const [verified, setVerified] = useState(false);

  function changeStep(nextStep: number) {
    if (nextStep === activeStep) return;
    setVerified(false);
    setActiveStep(nextStep);
  }

  const actions =
    activeStep === 3 &&
    (verified ? (
      <>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setSample(aeadCases[0]);
            changeStep(0);
          }}
        >
          Ricomincia la lezione
        </Button>
        <Button type="button" size="sm" onClick={() => changeStep(2)}>
          Prova un altro caso
        </Button>
      </>
    ) : (
      <Button type="button" size="sm" onClick={() => setVerified(true)}>
        Verifica sul server
      </Button>
    ));

  return (
    <TutorialFrame
      steps={steps}
      activeStep={activeStep}
      onStepChange={changeStep}
      nextLabel={nextLabels[activeStep] ?? "Passo successivo"}
      actions={actions}
    >
      {activeStep === 0 && <PrepareContract />}
      {activeStep === 1 && <EncryptContract />}
      {activeStep === 2 && <TransportContract sample={sample} onSampleChange={setSample} />}
      {activeStep === 3 && <VerifyContract sample={sample} verified={verified} />}
    </TutorialFrame>
  );
}
