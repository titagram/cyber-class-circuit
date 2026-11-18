import { useId, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Ban,
  Check,
  Clock,
  FileKey,
  KeyRound,
  LockKeyhole,
  Monitor,
  Network,
  RotateCcw,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import "./TrustLabs.css";

const tlsHops = {
  external: {
    label: "Browser → Reverse proxy",
    host: "gestionale.example",
    otherHost: "report.example",
    session: "A",
    client: "Browser",
    server: "Reverse proxy",
  },
  internal: {
    label: "Proxy → Backend",
    host: "backend.example",
    otherHost: "archivio.example",
    session: "B",
    client: "Reverse proxy",
    server: "Backend",
  },
} as const;
type Hop = keyof typeof tlsHops;

const tlsSteps = [
  "Scambio effimero",
  "Verifica certificato",
  "Finished e chiavi",
  "Dati applicativi",
] as const;
type Step = 0 | 1 | 2 | 3;

type Connection = { step: Step; matches: boolean };
const initialConnections: Record<Hop, Connection> = {
  external: { step: 0, matches: true },
  internal: { step: 0, matches: true },
};

export function TlsHandshakeLab() {
  const hopStatusPrefix = useId();
  const [hopId, setHopId] = useState<Hop>("external");
  const [connections, setConnections] = useState(initialConnections);
  const hop = tlsHops[hopId];
  const { step, matches } = connections[hopId];
  const externalRequestSent = connections.external.step === 3;
  const internalRequestForwarded = connections.internal.step === 3;
  const requestReady = hopId === "external" || externalRequestSent;
  const reachedEnd = step === 3 || (step === 1 && !matches);

  function setScenario(nextMatches: boolean) {
    setConnections((current) => ({
      ...current,
      [hopId]: { step: 1, matches: nextMatches },
    }));
  }

  function selectStep(nextStep: Step) {
    setConnections((current) => ({
      ...current,
      [hopId]: { ...current[hopId], step: nextStep },
    }));
  }

  function hopControl(id: Hop) {
    const link = tlsHops[id];
    const connection = connections[id];
    const blocked = !connection.matches && connection.step >= 1;
    const established = connection.step >= 2;
    const Icon = blocked ? Ban : established ? LockKeyhole : KeyRound;

    return (
      <button
        type="button"
        className="tls-hop"
        aria-label={link.label}
        aria-describedby={`${hopStatusPrefix}-${id}`}
        aria-pressed={id === hopId}
        onClick={() => setHopId(id)}
        data-state={blocked ? "blocked" : established ? "success" : "active"}
      >
        <span className="tls-hop-key">
          <Icon aria-hidden="true" />
          <strong>{link.session}</strong>
        </span>
        <span id={`${hopStatusPrefix}-${id}`}>
          {blocked ? "Certificato rifiutato" : established ? `chiavi ${link.session}` : "Handshake"}
        </span>
      </button>
    );
  }

  return (
    <section className="crypto-stage trust-stage" aria-label="Laboratorio dell’handshake TLS">
      <header className="crypto-stage-label">TLS 1.3 · scegli un tratto</header>
      <div className="tls-topology" role="group" aria-label="Collegamento TLS osservato">
        <div
          className="crypto-node tls-actor"
          data-state={hopId === "external" ? "active" : undefined}
        >
          <Monitor aria-hidden="true" />
          <span>Browser</span>
        </div>
        {hopControl("external")}
        <div className="crypto-node tls-actor" data-state="active">
          <Network aria-hidden="true" />
          <span>Reverse proxy</span>
        </div>
        {hopControl("internal")}
        <div
          className="crypto-node tls-actor"
          data-state={hopId === "internal" ? "active" : undefined}
        >
          <Server aria-hidden="true" />
          <span>Backend</span>
        </div>
      </div>

      <div className="tls-steps" role="group" aria-label="Fasi dell’handshake TLS 1.3">
        {tlsSteps.map((label, index) => (
          <Button
            key={label}
            size="sm"
            variant={index === step ? "default" : "outline"}
            aria-current={index === step ? "step" : undefined}
            disabled={!matches && index > 1}
            onClick={() => selectStep(index as Step)}
          >
            <span aria-hidden="true">{index < step ? <Check /> : index + 1}</span>
            {label}
          </Button>
        ))}
      </div>

      <section className="tls-trace" aria-label="Stato dell’handshake" aria-live="polite">
        <div className="tls-trace-endpoints">
          <span>
            {hop.client} <small>Client</small>
          </span>
          <span>
            <small>Server</small> {hop.server}
          </span>
        </div>
        <div
          className="tls-signals"
          key={`${hopId}-${step}-${matches}-${step === 3 && requestReady}`}
        >
          {step === 0 && (
            <>
              <TlsSignal label="ClientHello · chiave effimera" icon={KeyRound} />
              <TlsSignal label="ServerHello · chiave effimera" icon={KeyRound} reverse />
            </>
          )}
          {step === 1 && (
            <>
              <TlsSignal label="Certificate · CertificateVerify" icon={FileKey} reverse />
              <div className="tls-hostnames" data-state={matches ? "success" : "blocked"}>
                <div>
                  <span>Host richiesto</span>
                  <code>{hop.host}</code>
                </div>
                <strong aria-hidden="true">{matches ? "=" : "≠"}</strong>
                <div>
                  <span>Nome nel certificato (SAN)</span>
                  <code>{matches ? hop.host : hop.otherHost}</code>
                </div>
              </div>
              <p className="tls-outcome" data-state={matches ? "success" : "blocked"}>
                {matches ? <BadgeCheck aria-hidden="true" /> : <Ban aria-hidden="true" />}
                {matches ? "Identità del server verificata" : "Handshake interrotto"}
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <TlsSignal label="Finished del server" icon={LockKeyhole} reverse />
              <TlsSignal label="Finished del client" icon={LockKeyhole} />
            </>
          )}
          {step === 3 &&
            (requestReady ? (
              <>
                <TlsSignal
                  label={`Record TLS cifrato · sessione ${hop.session}`}
                  icon={LockKeyhole}
                />
                <p className="tls-plaintext">
                  <span>In chiaro al {hop.server.toLowerCase()}</span>{" "}
                  <code>GET /api/documents/42</code>
                </p>
              </>
            ) : (
              <p className="tls-outcome">
                <Clock aria-hidden="true" /> Il backend attende il tratto Browser → Reverse proxy.
              </p>
            ))}
        </div>
      </section>

      <div className="tls-controls">
        <div className="crypto-controls" role="group" aria-label="Nome nel certificato">
          <span className="crypto-label">Nome nel certificato</span>
          <Button
            size="sm"
            variant={matches ? "default" : "outline"}
            aria-pressed={matches}
            onClick={() => setScenario(true)}
          >
            Nome corretto
          </Button>
          <Button
            size="sm"
            variant={matches ? "outline" : "default"}
            aria-pressed={!matches}
            onClick={() => setScenario(false)}
          >
            Nome diverso
          </Button>
        </div>
        <Button size="sm" onClick={() => selectStep(reachedEnd ? 0 : ((step + 1) as Step))}>
          {reachedEnd ? <RotateCcw aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          {reachedEnd ? "Ricomincia il tratto" : "Passo successivo"}
        </Button>
      </div>
      <p className="crypto-legend">
        {step === 0 &&
          "Con ECDHE entrambe le parti ricavano lo stesso segreto e proteggono il resto dell’handshake."}
        {step === 1 &&
          (matches
            ? "Il client controlla catena, scadenza e nome. CertificateVerify dimostra che il server possiede la chiave privata."
            : "La catena è fidata e il certificato è in corso di validità. La differenza di nome blocca questo tratto.")}
        {step === 2 &&
          "I due Finished confermano l’integrità dell’handshake. Ogni direzione ha la propria chiave di traffico."}
        {step === 3 &&
          (hopId === "external"
            ? internalRequestForwarded
              ? "Il proxy decifra la richiesta in ingresso e la cifra di nuovo per il tratto interno."
              : "Il proxy decifra la richiesta. Per seguirne l’inoltro, porta il tratto verso il backend a Dati applicativi."
            : requestReady &&
              "Il backend decifra i dati della sessione B e verifica i permessi sul contratto.")}
        {step === 3 &&
          !requestReady &&
          "La sessione interna è pronta. Invia prima i dati sul tratto dal browser."}
      </p>
    </section>
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
