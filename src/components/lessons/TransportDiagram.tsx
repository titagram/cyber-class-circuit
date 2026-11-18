import { ArrowRight, Eye, FileText, LockKeyhole, Monitor, Network, ServerCog } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  tlsLinks,
  type ConnectionProtocol,
  type TlsLinkId,
} from "@/content/lessons/cybersecurity-1-5";

type TransportDiagramProps = {
  activeLink: TlsLinkId;
  protocolByLink: Record<TlsLinkId, ConnectionProtocol>;
  atEndpoint: boolean;
};

export function TransportDiagram({
  activeLink,
  protocolByLink,
  atEndpoint,
}: TransportDiagramProps) {
  const protocol = protocolByLink[activeLink];
  const endpoint = tlsLinks[activeLink].endpoint;

  return (
    <figure className="transport-diagram" aria-label="Percorso della richiesta del contratto 42">
      <div className="transport-path">
        <TransportNode id="browser" label="Browser" icon={Monitor} />
        <TransportLink
          id="browser-proxy"
          protocol={protocolByLink["browser-proxy"]}
          active={activeLink === "browser-proxy"}
          observed={!atEndpoint && activeLink === "browser-proxy"}
        />
        <TransportNode
          id="proxy"
          label="Reverse proxy"
          icon={Network}
          observed={atEndpoint && activeLink === "browser-proxy"}
        />
        <TransportLink
          id="proxy-backend"
          protocol={protocolByLink["proxy-backend"]}
          active={activeLink === "proxy-backend"}
          observed={!atEndpoint && activeLink === "proxy-backend"}
        />
        <TransportNode
          id="backend"
          label="Backend"
          icon={ServerCog}
          observed={atEndpoint && activeLink === "proxy-backend"}
        />
      </div>
      <figcaption className="transport-caption" aria-live="polite">
        <Eye aria-hidden="true" />
        {atEndpoint
          ? `Al ${endpoint} · richiesta leggibile dopo la decifratura`
          : protocol === "HTTPS"
            ? "Sul collegamento · contenuto cifrato da TLS"
            : "Sul collegamento · contenuto in chiaro"}
      </figcaption>
    </figure>
  );
}

function ObservationMarker() {
  return (
    <span className="transport-observer" data-testid="traffic-observer">
      <Eye aria-hidden="true" />
      <span className="sr-only">Punto di osservazione</span>
    </span>
  );
}

function TransportNode({
  id,
  label,
  icon: Icon,
  observed = false,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  observed?: boolean;
}) {
  return (
    <div className="transport-node" data-observed={observed} data-testid={`data-flow-node-${id}`}>
      {observed && <ObservationMarker />}
      <Icon aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function TransportLink({
  id,
  protocol,
  active,
  observed,
}: {
  id: TlsLinkId;
  protocol: ConnectionProtocol;
  active: boolean;
  observed: boolean;
}) {
  const encrypted = protocol === "HTTPS";
  const PacketIcon = encrypted ? LockKeyhole : FileText;
  return (
    <div
      role="group"
      aria-label={tlsLinks[id].label}
      className="transport-link"
      data-protocol={protocol}
      data-highlighted={active}
      data-testid={`data-flow-connection-${id}`}
    >
      <strong className="transport-protocol">{protocol}</strong>
      <div className="transport-track">
        <ArrowRight className="transport-arrow" aria-hidden="true" />
        <span className="transport-packet" key={protocol}>
          <PacketIcon aria-hidden="true" />
        </span>
        {observed && <ObservationMarker />}
      </div>
      <span className="transport-packet-label">{encrypted ? "Cifrato TLS" : "In chiaro"}</span>
    </div>
  );
}
