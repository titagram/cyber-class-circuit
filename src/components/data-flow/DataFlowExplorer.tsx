import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArchiveRestore,
  Database,
  FileClock,
  FolderArchive,
  MemoryStick,
  Monitor,
  Network,
  Pause,
  Play,
  RotateCcw,
  ScrollText,
  ServerCog,
  SkipForward,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  ArchitectureConnection,
  ArchitectureNode,
  ArchitectureNodeKind,
  DataFlowExplorerProps,
} from "./types";
import "./DataFlowExplorer.css";

const nodeIcons: Record<ArchitectureNodeKind, LucideIcon> = {
  client: Monitor,
  gateway: Network,
  compute: ServerCog,
  database: Database,
  cache: MemoryStick,
  storage: FolderArchive,
  backup: ArchiveRestore,
  temporary: FileClock,
  logging: ScrollText,
};

const roleLabels: Record<ArchitectureNode["dataRole"], string> = {
  process: "Elabora dati",
  store: "Conserva dati",
  transmit: "Trasmette dati",
};

const EVENT_DURATION_MS = 3200;

export function DataFlowExplorer({
  config,
  level,
  mode = "explore",
  highlight,
  showTrustBoundaries = false,
  focusNodeId,
  className = "",
}: DataFlowExplorerProps) {
  const mapScroll = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [eventIndex, setEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const visibleNodes = useMemo(
    () => config.nodes.filter((node) => node.level <= level),
    [config.nodes, level],
  );
  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);
  const visibleConnections = useMemo(
    () =>
      config.connections.filter(
        (connection) =>
          connection.level <= level &&
          (!connection.maxLevel || level <= connection.maxLevel) &&
          visibleNodeIds.has(connection.from) &&
          visibleNodeIds.has(connection.to),
      ),
    [config.connections, level, visibleNodeIds],
  );
  const visibleBoundaries = useMemo(
    () => config.boundaries.filter((boundary) => boundary.level <= level),
    [config.boundaries, level],
  );

  const activeEvent = mode === "simulate" ? config.events[eventIndex] : undefined;
  const activeNodes = new Set(activeEvent?.nodes ?? highlight?.nodes ?? []);
  const secondaryNodes = new Set(highlight?.secondaryNodes ?? []);
  const transfers = new Map(
    activeEvent?.transfers.map(({ connection, direction }) => [connection, direction]),
  );
  const activeConnections = new Set(activeEvent ? transfers.keys() : highlight?.connections);
  const activeBoundaries = new Set(highlight?.boundaries ?? []);
  const selectedNode = visibleNodes.find((node) => node.id === selectedNodeId);

  useEffect(() => {
    if (!focusNodeId) return;
    const map = mapScroll.current;
    const node = visibleNodes.find(({ id }) => id === focusNodeId);
    if (map && node && map.scrollWidth > map.clientWidth) {
      map.scrollLeft = (node.x / config.width) * map.scrollWidth - map.clientWidth / 2;
    }
  }, [config.width, focusNodeId, visibleNodes]);

  useEffect(() => {
    if (!isPlaying || mode !== "simulate" || config.events.length < 2) return;
    if (eventIndex >= config.events.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setEventIndex((current) => Math.min(current + 1, config.events.length - 1));
    }, EVENT_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [config.events.length, eventIndex, isPlaying, mode]);

  function togglePlayback() {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (eventIndex >= config.events.length - 1) setEventIndex(0);
    setIsPlaying(true);
  }

  function selectEvent(index: number) {
    setIsPlaying(false);
    setEventIndex(index);
  }

  function resetSimulation() {
    setIsPlaying(false);
    setEventIndex(0);
    setSelectedNodeId(null);
  }

  return (
    <section className={`df-explorer ${className}`} aria-label={config.label}>
      <div className="df-map-shell">
        <div
          ref={mapScroll}
          className="df-map-scroll"
          tabIndex={0}
          role="region"
          aria-label={`${config.label}. Scorri orizzontalmente per esplorare la mappa su schermi piccoli.`}
          data-testid="data-flow-map"
          data-playing={mode === "simulate" && isPlaying}
        >
          <div className="df-map">
            <svg
              className="df-map-svg"
              viewBox={`0 0 ${config.width} ${config.height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {showTrustBoundaries &&
                visibleBoundaries.map((boundary) => (
                  <g key={boundary.id}>
                    <line
                      x1={boundary.x}
                      y1={20}
                      x2={boundary.x}
                      y2={config.height - 20}
                      className={`df-boundary${activeBoundaries.has(boundary.id) ? " df-boundary-active" : ""}`}
                    />
                    <text
                      x={boundary.x}
                      y={14}
                      className={`df-boundary-label${activeBoundaries.has(boundary.id) ? " df-boundary-label-active" : ""}`}
                    >
                      {boundary.label}
                    </text>
                  </g>
                ))}
              {visibleConnections.map((connection) => {
                const direction = transfers.get(connection.id);
                const reverse = direction === "reverse";
                const from = config.nodes.find(
                  (node) => node.id === (reverse ? connection.to : connection.from),
                )!;
                const to = config.nodes.find(
                  (node) => node.id === (reverse ? connection.from : connection.to),
                )!;
                const active = activeConnections.has(connection.id);
                const midpointX = (from.x + to.x) / 2;
                const midpointY = (from.y + to.y) / 2;
                const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
                return (
                  <g key={connection.id}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      className={`df-connection${active ? " df-connection-active" : ""}`}
                      data-testid={`data-flow-connection-${connection.id}`}
                      data-highlighted={active ? "true" : "false"}
                      data-direction={direction}
                    />
                    {direction && (
                      <path
                        d="M -4 -5 L 2 0 L -4 5"
                        transform={`translate(${midpointX} ${midpointY}) rotate(${angle})`}
                        className="df-transfer-arrow"
                      />
                    )}
                    <text x={midpointX} y={midpointY - 10} className="df-connection-label">
                      {connection.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {visibleNodes.map((node) => {
              const Icon = nodeIcons[node.kind];
              const active = activeNodes.has(node.id);
              const secondary = secondaryNodes.has(node.id);
              return (
                <button
                  key={node.id}
                  type="button"
                  className={`df-node${active ? " df-node-active" : ""}${secondary ? " df-node-secondary" : ""}${selectedNodeId === node.id ? " df-node-selected" : ""}`}
                  style={{ left: `${(node.x / config.width) * 100}%`, top: `${(node.y / config.height) * 100}%` }}
                  aria-pressed={selectedNodeId === node.id}
                  aria-label={`Ispeziona ${node.label}`}
                  data-testid={`data-flow-node-${node.id}`}
                  data-highlighted={active || secondary ? "true" : "false"}
                  onClick={() => setSelectedNodeId((current) => (current === node.id ? null : node.id))}
                >
                  <Icon aria-hidden="true" />
                  <span>{node.label}</span>
                  <small>{roleLabels[node.dataRole]}</small>
                </button>
              );
            })}
          </div>
        </div>
        <div className="df-map-footer">
          <span className="df-map-instruction">Seleziona un componente per ispezionarlo.</span>
          <span className="df-scroll-hint">Scorri la mappa per vedere tutti i componenti →</span>
          <div className="df-map-legend" aria-label="Legenda della mappa">
            <span>
              <i className="df-legend-mark df-legend-active" /> Evidenziato
            </span>
            {secondaryNodes.size > 0 && (
              <span>
                <i className="df-legend-mark df-legend-secondary" /> Conservazione o possibile copia
              </span>
            )}
            {showTrustBoundaries && (
              <span>
                <i className="df-legend-boundary" /> Confine di fiducia
              </span>
            )}
          </div>
        </div>
      </div>

      {selectedNode && <NodeInspector node={selectedNode} onClose={() => setSelectedNodeId(null)} />}

      {mode === "simulate" && activeEvent && (
        <section className="df-simulation" aria-label="Segui una richiesta">
          <div className="df-simulation-heading">
            <h3>Segui una richiesta</h3>
            <span>Passo {eventIndex + 1} di {config.events.length}</span>
          </div>

          <ol className="df-event-timeline" aria-label="Passaggi della richiesta">
            {config.events.map((event, index) => (
              <li key={event.id}>
                <button
                  type="button"
                  aria-current={index === eventIndex ? "step" : undefined}
                  onClick={() => selectEvent(index)}
                >
                  <span className="df-event-number">{index + 1}</span>
                  {event.title}
                </button>
              </li>
            ))}
          </ol>

          <div className="df-simulation-controls">
            <Button onClick={togglePlayback} disabled={config.events.length < 2}>
              {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              {isPlaying ? "Pausa" : eventIndex === config.events.length - 1 ? "Riproduci di nuovo" : eventIndex > 0 ? "Riprendi" : "Avvia"}
            </Button>
            <Button
              variant="outline"
              onClick={() => selectEvent(Math.min(eventIndex + 1, config.events.length - 1))}
              disabled={eventIndex >= config.events.length - 1}
            >
              <SkipForward aria-hidden="true" /> Passaggio successivo
            </Button>
            <Button
              variant="outline"
              onClick={resetSimulation}
              disabled={eventIndex === 0 && !isPlaying && !selectedNodeId}
            >
              <RotateCcw aria-hidden="true" /> Ripristina
            </Button>
          </div>

          <div className="df-event-detail" aria-live="polite">
            <span>Evento {eventIndex + 1}</span>
            <h4>{activeEvent.title}</h4>
            <p>{activeEvent.description}</p>
            <div className="df-payload">
              <span>{activeEvent.payloadLabel}</span>
              <pre>{activeEvent.payload}</pre>
            </div>
          </div>
        </section>
      )}
    </section>
  );
}

function NodeInspector({ node, onClose }: { node: ArchitectureNode; onClose: () => void }) {
  return (
    <aside className="df-node-inspector" aria-label={`Dettaglio: ${node.label}`} aria-live="polite">
      <div className="df-node-inspector-heading">
        <div>
          <span className="lesson-label">{roleLabels[node.dataRole]}</span>
          <h4>{node.label}</h4>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label={`Chiudi dettaglio ${node.label}`}>
          <X aria-hidden="true" />
        </Button>
      </div>
      <p>{node.description}</p>
      <ul>
        {node.responsibilities.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}
      </ul>
    </aside>
  );
}

export function getConnection(config: DataFlowExplorerProps["config"], id: string): ArchitectureConnection | undefined {
  return config.connections.find((connection) => connection.id === id);
}
