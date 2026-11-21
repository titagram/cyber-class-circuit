import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TransportDiagram } from "./TransportDiagram";
import { Button } from "@/components/ui/button";
import { HudNotice, HudPanel, HudTabPanel, HudTabs } from "@/design-system/nightrunner";
import { documentRequest, documentResponse } from "@/content/lessons/cybersecurity-1-3";
import {
  originalProtocols,
  tlsLesson,
  tlsLinks,
  type ConnectionProtocol,
  type TlsLinkId,
} from "@/content/lessons/cybersecurity-1-5";

import "./DataFlowLessons.css";

const tabsId = "cybersecurity-1-5-links";
const tabs = Object.entries(tlsLinks).map(([value, { label }]) => ({ value, label }));
const protocols = ["HTTP", "HTTPS"] as const;

export function Cybersecurity15Slide() {
  const [link, setLink] = useState<TlsLinkId>("browser-proxy");
  const [protocolByLink, setProtocolByLink] = useState(originalProtocols);
  const [atEndpoint, setAtEndpoint] = useState(false);
  const protocol = protocolByLink[link];
  const readable = protocol === "HTTP" || atEndpoint;

  return (
    <article className="max-w-[1180px]">
      <PageHeader title={tlsLesson.title} subtitle={tlsLesson.subtitle} />
      <HudPanel heading="Dove si può leggere il file 42.pdf?" className="min-w-0 space-y-4">
        <p className="text-muted-foreground">
          Scegli un tratto e cambia protocollo. Segui il simbolo dell’occhio per vedere da dove stai
          osservando la richiesta simulata.
        </p>
        <HudTabs
          id={tabsId}
          className="flow-lesson-tabs flex-wrap"
          label="Collegamento osservato"
          items={tabs}
          value={link}
          onValueChange={(value) => {
            if (value === link) return;
            setLink(value as TlsLinkId);
            setAtEndpoint(false);
          }}
        />
        {tabs.map(({ value }) => (
          <HudTabPanel key={value} tabsId={tabsId} value={value} activeValue={link}>
            {value === link && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div
                  className="flex flex-wrap items-center gap-2"
                  role="group"
                  aria-label="Protocollo sul collegamento"
                >
                  <span className="text-sm text-muted-foreground">Protocollo</span>
                  {protocols.map((option: ConnectionProtocol) => (
                    <Button
                      key={option}
                      type="button"
                      variant={protocol === option ? "default" : "outline"}
                      size="sm"
                      aria-pressed={protocol === option}
                      onClick={() => {
                        if (option === protocol) return;
                        setProtocolByLink((current) => ({ ...current, [link]: option }));
                        setAtEndpoint(false);
                      }}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                {protocol === "HTTPS" && (
                  <div
                    className="flex flex-wrap items-center gap-2"
                    role="group"
                    aria-label="Punto di osservazione"
                  >
                    <Button
                      type="button"
                      variant={atEndpoint ? "outline" : "default"}
                      size="sm"
                      aria-pressed={!atEndpoint}
                      onClick={() => setAtEndpoint(false)}
                    >
                      Sul collegamento
                    </Button>
                    <Button
                      type="button"
                      variant={atEndpoint ? "default" : "outline"}
                      size="sm"
                      aria-pressed={atEndpoint}
                      onClick={() => setAtEndpoint(true)}
                    >
                      All’endpoint TLS
                    </Button>
                  </div>
                )}
              </div>
            )}
          </HudTabPanel>
        ))}
        <TransportDiagram
          activeLink={link}
          protocolByLink={protocolByLink}
          atEndpoint={atEndpoint}
        />
        <section aria-label="Osservazione del traffico" aria-live="polite" className="space-y-3">
          {readable ? (
            <>
              <p>
                {atEndpoint
                  ? `Il ${tlsLinks[link].endpoint} termina TLS. Qui la richiesta è leggibile dopo la decifratura e la risposta prima della cifratura.`
                  : "Su questo tratto HTTP, intestazioni e contenuto sono leggibili in chiaro."}
              </p>
              {link === "browser-proxy" && protocol === "HTTP" && (
                <p className="text-sm text-muted-foreground">
                  Il cookie fittizio di questo esempio è privo dell’attributo Secure. Con Secure il
                  browser lo invia al sito di esempio solo tramite HTTPS.
                </p>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                <TrafficMessage label="Richiesta" message={documentRequest} />
                <TrafficMessage label="Risposta" message={documentResponse} />
              </div>
            </>
          ) : (
            <>
              <p>
                Il percorso HTTP, le intestazioni e il contenuto sono cifrati. Restano osservabili
                gli indirizzi IP, i tempi e le dimensioni del traffico.
              </p>
              <TrafficMessage
                label="Dati sul collegamento"
                message={"[dati applicativi cifrati da TLS]"}
              />
            </>
          )}
        </section>
        <HudNotice>
          HTTPS protegge riservatezza e integrità del traffico e consente al client di verificare
          l'identità del server tramite il certificato. Ogni collegamento ha una protezione propria.
          Il backend deve comunque verificare il diritto dell'utente di leggere il file.
        </HudNotice>
      </HudPanel>
    </article>
  );
}

function TrafficMessage({ label, message }: { label: string; message: string }) {
  return (
    <div className="min-w-0 border border-border border-l-2 border-l-accent bg-card px-4 py-3">
      <h3 className="mb-2 text-sm font-semibold text-accent">{label}</h3>
      <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
        {message}
      </pre>
    </div>
  );
}
