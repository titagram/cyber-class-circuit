import { useState } from "react";
import { Button } from "@/components/ui/button";

const tlsHops = {
  external: {
    label: "Browser → Reverse proxy",
    client: "Browser",
    server: "Reverse proxy",
    host: "gestionale.example",
    otherHost: "report.example",
    session: "A",
  },
  internal: {
    label: "Proxy → Backend",
    client: "Reverse proxy",
    server: "Backend",
    host: "backend.example",
    otherHost: "archivio.example",
    session: "B",
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
  const [hopId, setHopId] = useState<Hop>("external");
  const [connections, setConnections] = useState(initialConnections);
  const hop = tlsHops[hopId];
  const { step, matches } = connections[hopId];
  const externalRequestSent = connections.external.step === 3;
  const internalRequestForwarded = connections.internal.step === 3;

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

  let payloadNote: string;
  if (hopId === "internal" && !externalRequestSent) {
    payloadNote =
      "La sessione interna è pronta. Il backend attende il tratto Browser → Reverse proxy: la richiesta deve ancora partire dal browser.";
  } else if (hopId === "external" && !internalRequestForwarded) {
    payloadNote =
      "Il proxy può leggere la richiesta. Passa al tratto Proxy → Backend e seleziona Dati applicativi per seguirne l’inoltro.";
  } else {
    payloadNote =
      "Il proxy decifra la richiesta in ingresso e la cifra di nuovo sulla sessione interna. Il backend riceve la richiesta dal proxy.";
  }

  return (
    <div className="space-y-4">
      <div className="crypto-grid" role="group" aria-label="Collegamento TLS osservato">
        {(Object.keys(tlsHops) as Hop[]).map((id) => {
          const link = tlsHops[id];
          const connection = connections[id];
          const blocked = !connection.matches && connection.step >= 1;
          const established = connection.step >= 2;
          return (
            <div key={id} className="crypto-card space-y-2">
              <Button
                size="sm"
                variant={id === hopId ? "default" : "outline"}
                aria-pressed={id === hopId}
                onClick={() => setHopId(id)}
              >
                {link.label}
              </Button>
              <p
                className="crypto-status"
                data-tone={blocked ? "warning" : established ? "good" : undefined}
              >
                {blocked
                  ? "Certificato rifiutato"
                  : established
                    ? `Sessione attiva · chiavi ${link.session}`
                    : "Handshake in corso"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="crypto-controls" role="group" aria-label="Nome nel certificato">
        <span className="crypto-label">Certificato del server</span>
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

      <div className="crypto-controls" role="group" aria-label="Fasi dell’handshake TLS 1.3">
        {tlsSteps.map((label, index) => (
          <Button
            key={label}
            size="sm"
            variant={index === step ? "default" : "outline"}
            aria-current={index === step ? "step" : undefined}
            disabled={!matches && index > 1}
            onClick={() => selectStep(index as Step)}
          >
            {label}
          </Button>
        ))}
      </div>

      <section
        className="crypto-card space-y-3"
        aria-label="Stato dell’handshake"
        aria-live="polite"
      >
        <h3 className="crypto-label">
          {tlsSteps[step]} · {hop.label}
        </h3>
        {step === 0 ? (
          <>
            <p className="crypto-readout">
              {hop.client} · ClientHello con chiave pubblica effimera
            </p>
            <p className="crypto-readout">
              {hop.server} · ServerHello con chiave pubblica effimera
            </p>
            <p>
              Con ECDHE ciascuna parte combina la propria chiave privata effimera con la chiave
              pubblica dell’altra e calcola lo stesso segreto condiviso. Da questo segreto derivano
              le chiavi che proteggono i messaggi successivi dell’handshake.
            </p>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <p className="crypto-readout">Host richiesto · {hop.host}</p>
            <p className="crypto-readout">
              Nome DNS nel certificato (SAN) · {matches ? hop.host : hop.otherHost}
            </p>
            <p className="crypto-status" data-tone={matches ? "good" : "warning"}>
              {matches ? "Identità del server verificata" : "Handshake interrotto"}
            </p>
            <p>
              {matches
                ? "Catena fidata, certificato in corso di validità e nome corrispondente. Il client usa la chiave pubblica del certificato per verificare CertificateVerify, la firma del server sui messaggi precedenti dell’handshake."
                : "La catena è fidata e il certificato è in corso di validità. Il nome atteso manca dal certificato, quindi il client interrompe il collegamento e blocca la richiesta su questo tratto."}
            </p>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <p className="crypto-readout">
              Finished verificati · traffico {hop.session} in entrambe le direzioni
            </p>
            <p>
              Client e server verificano i messaggi Finished per confermare i segreti derivati e
              l’integrità dell’handshake. Per i dati applicativi ogni direzione ha le proprie chiavi
              simmetriche, derivate per questa sessione.
            </p>
          </>
        ) : null}
        {step === 3 ? (
          <>
            {hopId === "external" || externalRequestSent ? (
              <div className="crypto-grid">
                <div className="space-y-1">
                  <p className="crypto-label">Sul collegamento</p>
                  <p className="crypto-readout">[record TLS cifrato e autenticato]</p>
                </div>
                <div className="space-y-1">
                  <p className="crypto-label">Al {hop.server.toLowerCase()}</p>
                  <p className="crypto-readout">GET /api/documents/42</p>
                </div>
              </div>
            ) : null}
            <p>{payloadNote}</p>
          </>
        ) : null}
      </section>

      <p className="text-sm text-muted-foreground">
        La simulazione mostra un handshake TLS 1.3 completo con autenticazione del server. Il
        reverse proxy termina la prima sessione e agisce da client nella seconda. Il backend
        verifica ancora l’autorizzazione dell’utente ad aprire il contratto.
      </p>
    </div>
  );
}
