import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Ban,
  FileKey,
  KeyRound,
  LockKeyhole,
  Monitor,
  Network,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TutorialFrame, type TutorialStep } from "./TutorialFrame";
import "./TrustLabs.css";

const tlsHops = {
  external: {
    host: "gestionale.example",
    otherHost: "report.example",
    session: "A",
    client: "Browser",
    server: "Reverse proxy",
    publicKey: ["pubblica effimera del browser", "pubblica effimera del proxy"],
    receivedAt: "Al reverse proxy",
  },
  internal: {
    host: "backend.example",
    otherHost: "archivio.example",
    session: "B",
    client: "Reverse proxy",
    server: "Backend",
    publicKey: ["nuova pubblica effimera del proxy", "pubblica effimera del backend"],
    receivedAt: "Al backend",
  },
} as const;

const request = "GET /api/documents/42";
type HopId = keyof typeof tlsHops;
type Hop = (typeof tlsHops)[HopId];
type ConnectionStatus = "waiting" | "active" | "blocked" | "success";

function buildSteps(hopId: HopId): readonly TutorialStep[] {
  const hop = tlsHops[hopId];

  return [
    {
      label: "Scambio",
      title:
        hopId === "external"
          ? "Il browser vuole leggere il contratto 42"
          : "Il proxy apre un nuovo collegamento",
      explanation: (
        <p>
          {hopId === "external"
            ? "Il browser ha una richiesta pronta per il gestionale. In questa prova la invierà dopo aver stabilito TLS 1.3 con il reverse proxy."
            : "Il proxy ha ricevuto e decifrato la richiesta dalla sessione A. Ora agisce come client e apre la sessione B con il backend. Per B crea un’altra coppia effimera."}{" "}
          Con ECDHE ciascuna parte invia il valore pubblico di una coppia di breve durata. Il valore
          privato resta presso chi lo ha generato.
        </p>
      ),
    },
    {
      label: "Certificato",
      title: "Dopo lo scambio, il server presenta la sua identità",
      explanation: (
        <p>
          Ognuno combina il valore pubblico ricevuto con il proprio valore privato e ricava lo
          stesso segreto. Da questo derivano le chiavi per proteggere i messaggi successivi
          dell’handshake. Il server invia il certificato e <code>CertificateVerify</code>, una firma
          che include l’impronta dei messaggi scambiati e dimostra il possesso della chiave privata
          del certificato. Scegli il nome che compare nel certificato.
        </p>
      ),
    },
    {
      label: "Identità",
      title: "Il client controlla la catena e il nome",
      explanation: (
        <p>
          Il client verifica la firma del server, la catena del certificato e le date di validità.
          Cerca inoltre il nome richiesto fra quelli elencati nel certificato (SAN). In questa prova
          catena, firma e date sono corrette. Osserva se il nome consente di proseguire.
        </p>
      ),
    },
    {
      label: "Finished",
      title: "Le due parti confermano l’integrità dello scambio",
      explanation: (
        <p>
          Il server manda il proprio <code>Finished</code> e il client lo verifica prima di
          rispondere con il suo. Ognuno calcola un HMAC sull’impronta dei messaggi precedenti,
          usando una chiave derivata per quel <code>Finished</code>. Se i controlli riescono, il
          traffico applicativo usa due chiavi distinte, una per direzione.
        </p>
      ),
    },
    {
      label: "Richiesta",
      title:
        hopId === "external" ? "La richiesta arriva al proxy" : "La richiesta arriva al backend",
      explanation: (
        <p>
          {hopId === "external"
            ? "Il browser invia la richiesta cifrata nella sessione A. Il reverse proxy termina il collegamento TLS, quindi può leggere la richiesta. Per inoltrarla al backend userà la sessione B."
            : "Il proxy cifra di nuovo la stessa richiesta con la chiave di invio della sessione B. Il backend la decifra e può verificare i permessi sul contratto 42."}
        </p>
      ),
    },
  ];
}

export function TlsHandshakeLab() {
  const [hopId, setHopId] = useState<HopId>("external");
  const [step, setStep] = useState(0);
  const [matches, setMatches] = useState(true);
  const hop = tlsHops[hopId];
  const failed = step === 2 && !matches;
  const steps = buildSteps(hopId);
  const nextLabels = [
    "Scambia i valori effimeri",
    "Verifica il certificato",
    "Scambia i Finished",
    hopId === "external" ? "Invia la richiesta sul tratto A" : "Inoltra la richiesta sul tratto B",
  ];
  const currentStatus = failed ? "blocked" : step >= 3 ? "success" : "active";

  function switchHop(nextHop: HopId, nextStep: number) {
    setHopId(nextHop);
    setStep(nextStep);
    setMatches(true);
  }

  const actions = failed ? (
    <Button variant="outline" onClick={() => setStep(0)}>
      Prova un altro nome
    </Button>
  ) : step === 4 ? (
    <Button onClick={() => switchHop(hopId === "external" ? "internal" : "external", 0)}>
      {hopId === "external" ? "Apri la sessione B" : "Ricomincia il percorso"}
      <ArrowRight aria-hidden="true" />
    </Button>
  ) : hopId === "internal" && step === 0 ? (
    <Button variant="outline" onClick={() => switchHop("external", 4)}>
      <ArrowLeft aria-hidden="true" /> Torna alla sessione A
    </Button>
  ) : null;

  return (
    <TutorialFrame
      steps={steps}
      activeStep={step}
      onStepChange={setStep}
      canAdvance={!failed}
      nextLabel={nextLabels[step] ?? "Passo successivo"}
      actions={actions}
    >
      <div className="crypto-stage trust-stage">
        <div className="tls-topology" role="group" aria-label="Collegamenti TLS">
          <div
            className="crypto-node tls-actor"
            data-state={hopId === "external" ? "active" : undefined}
          >
            <Monitor aria-hidden="true" />
            <span>Browser</span>
          </div>
          <TlsHop
            session="A"
            current={hopId === "external"}
            status={hopId === "external" ? currentStatus : "success"}
          />
          <div className="crypto-node tls-actor" data-state="active">
            <Network aria-hidden="true" />
            <span>Reverse proxy</span>
          </div>
          <TlsHop
            session="B"
            current={hopId === "internal"}
            status={hopId === "internal" ? currentStatus : "waiting"}
          />
          <div
            className="crypto-node tls-actor"
            data-state={hopId === "internal" ? "active" : undefined}
          >
            <Server aria-hidden="true" />
            <span>Backend</span>
          </div>
        </div>

        <section className="tls-trace" aria-label={`Sessione TLS ${hop.session}`}>
          <div className="tls-trace-endpoints">
            <span>
              {hop.client} <small>Client</small>
            </span>
            <span>
              <small>Server</small> {hop.server}
            </span>
          </div>

          <div className="tls-signals" key={`${hopId}-${step}`}>
            {step === 0 && (
              <>
                <p className="tls-plaintext">
                  Richiesta in attesa <code>{request}</code>
                </p>
                <div className="tls-hostnames">
                  <div>
                    <span>Client</span>
                    <code>Coppia effimera locale</code>
                  </div>
                  <KeyRound aria-hidden="true" />
                  <div>
                    <span>Server</span>
                    <code>Coppia effimera locale</code>
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <TlsSignal label={`ClientHello · ${hop.publicKey[0]}`} icon={KeyRound} />
                <TlsSignal label={`ServerHello · ${hop.publicKey[1]}`} icon={KeyRound} reverse />
                <TlsSignal label="Certificate · CertificateVerify" icon={FileKey} reverse />
                <HostComparison hop={hop} matches={matches} />
                <div
                  className="crypto-controls tls-certificate-controls"
                  role="group"
                  aria-label="Nome nel certificato"
                >
                  <Button
                    variant={matches ? "default" : "outline"}
                    aria-pressed={matches}
                    onClick={() => setMatches(true)}
                  >
                    Nome corretto
                  </Button>
                  <Button
                    variant={matches ? "outline" : "default"}
                    aria-pressed={!matches}
                    onClick={() => setMatches(false)}
                  >
                    Nome diverso
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <HostComparison hop={hop} matches={matches} checked />
                <p className="tls-outcome" data-state={matches ? "success" : "blocked"}>
                  {matches ? <BadgeCheck aria-hidden="true" /> : <Ban aria-hidden="true" />}
                  {matches ? "Identità del server verificata" : "Handshake interrotto"}
                </p>
                {failed && (
                  <p className="crypto-legend">
                    Il nome richiesto manca nel certificato. La richiesta rimane in attesa.
                  </p>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <TlsSignal label="Finished del server" icon={LockKeyhole} reverse />
                <TlsSignal label="Finished del client" icon={LockKeyhole} />
                <div
                  className="tls-key-directions"
                  aria-label={`Chiavi di traffico della sessione ${hop.session}`}
                >
                  <p className="trust-data">
                    <KeyRound aria-hidden="true" /> <code>{hop.session}₁</code>
                    {hop.client} → {hop.server}
                  </p>
                  <p className="trust-data">
                    <KeyRound aria-hidden="true" /> <code>{hop.session}₂</code>
                    {hop.server} → {hop.client}
                  </p>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <TlsSignal label={`Record TLS cifrato con ${hop.session}₁`} icon={LockKeyhole} />
                <section className="tls-plaintext" aria-label="Richiesta ricevuta">
                  <span>{hop.receivedAt}, in chiaro</span> <code>{request}</code>
                </section>
              </>
            )}
          </div>
        </section>
      </div>
    </TutorialFrame>
  );
}

function TlsHop({
  session,
  current,
  status,
}: {
  session: Hop["session"];
  current: boolean;
  status: ConnectionStatus;
}) {
  const Icon = status === "blocked" ? Ban : status === "success" ? LockKeyhole : KeyRound;
  const labels = {
    active: "Handshake",
    blocked: "Interrotta",
    success: `Chiavi ${session}`,
    waiting: "In attesa",
  };

  return (
    <div className="tls-hop" aria-current={current ? "step" : undefined} data-state={status}>
      <span className="tls-hop-key">
        <Icon aria-hidden="true" /> <strong>{session}</strong>
      </span>
      <span>{labels[status]}</span>
    </div>
  );
}

function HostComparison({
  hop,
  matches,
  checked = false,
}: {
  hop: Hop;
  matches: boolean;
  checked?: boolean;
}) {
  return (
    <div
      className="tls-hostnames"
      data-state={checked ? (matches ? "success" : "blocked") : undefined}
    >
      <div>
        <span>Host richiesto</span>
        <code>{hop.host}</code>
      </div>
      {checked && <strong aria-hidden="true">{matches ? "=" : "≠"}</strong>}
      <div>
        <span>Nome nel certificato (SAN)</span>
        <code>{matches ? hop.host : hop.otherHost}</code>
      </div>
    </div>
  );
}

function TlsSignal({
  label,
  icon: Icon,
  reverse = false,
}: {
  label: string;
  icon: typeof KeyRound;
  reverse?: boolean;
}) {
  const Arrow = reverse ? ArrowLeft : ArrowRight;
  return (
    <div className="tls-signal" data-reverse={reverse}>
      <span className="tls-signal-marker">
        <Icon aria-hidden="true" />
      </span>
      <span className="tls-signal-label">{label}</span>
      <Arrow className="tls-signal-direction" aria-hidden="true" />
      <span className="sr-only">{reverse ? "dal server al client" : "dal client al server"}</span>
    </div>
  );
}
