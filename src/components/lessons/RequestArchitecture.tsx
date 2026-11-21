import { useId } from "react";
import type { Hop, TraceNode } from "@/content/lessons/request-response";
import "./RequestArchitecture.css";

type NodeName = TraceNode | "Backend";
type Point = readonly [number, number];
type Box = { center: Point; width: number };
const box = (x: number, y: number, width: number): Box => ({ center: [x, y], width });
const halfHeight = 13;
const boxes: Record<NodeName, Box> = {
  Giulia: box(51, 23, 62),
  "Cache DNS": box(162, 23, 90),
  "Resolver DNS": box(299, 23, 110),
  Schermo: box(51, 78, 74),
  Browser: box(162, 78, 90),
  "Reverse proxy": box(354, 78, 118),
  Backend: box(217, 148, 210),
  Controller: box(84, 182, 114),
  Sessione: box(219, 182, 100),
  Router: box(354, 182, 110),
  "Servizio file": box(84, 245, 114),
  Autorizzazione: box(219, 245, 120),
  Repository: box(84, 308, 114),
  "Client storage": box(354, 308, 122),
  Database: box(84, 386, 112),
  Storage: box(354, 386, 112),
};
type Link = { from: NodeName; to: NodeName; bends: Point[] };
const link = (from: NodeName, to: NodeName, ...bends: Point[]): Link => ({ from, to, bends });
const external = [
  link("Giulia", "Browser", [51, 49], [145, 49], [145, 78]),
  link("Cache DNS", "Browser"),
  link("Resolver DNS", "Browser", [299, 49], [181, 49], [181, 78]),
  link("Browser", "Schermo"),
  link("Browser", "Reverse proxy"),
];
const modules = [
  link("Reverse proxy", "Router"),
  link("Router", "Sessione"),
  link("Sessione", "Controller"),
  link("Controller", "Servizio file"),
  link("Servizio file", "Autorizzazione"),
  link("Servizio file", "Repository"),
  link("Repository", "Database"),
  link("Servizio file", "Client storage", [145, 245], [145, 268], [354, 268]),
  link("Client storage", "Storage"),
  link("Controller", "Reverse proxy", [84, 108], [330, 108], [330, 78]),
];
const folded = [
  link("Reverse proxy", "Backend", [354, 113], [217, 113]),
  link("Backend", "Database", [84, 148]),
  link("Backend", "Storage", [354, 148]),
];
const externalNames: NodeName[] = [
  "Giulia",
  "Cache DNS",
  "Resolver DNS",
  "Schermo",
  "Browser",
  "Reverse proxy",
];
const inside: NodeName[] = [
  "Router",
  "Sessione",
  "Controller",
  "Servizio file",
  "Autorizzazione",
  "Repository",
  "Client storage",
];

// End each wire on the box outline. Elbows can enter a node off-centre.
function wire(edge: Link, layout: Record<NodeName, Box>): Point[] {
  const points = [layout[edge.from].center, ...edge.bends, layout[edge.to].center];
  function trim(name: NodeName) {
    const {
      center: [cx, cy],
      width,
    } = layout[name];
    const isInside = ([x, y]: Point) =>
      Math.abs(x - cx) <= width / 2 && Math.abs(y - cy) <= halfHeight;
    while (points.length > 2 && isInside(points[1]!)) points.shift();
    const [x, y] = points[0]!;
    const [nextX, nextY] = points[1]!;
    points[0] =
      x === nextX
        ? [x, cy + Math.sign(nextY - y) * halfHeight]
        : [cx + (Math.sign(nextX - x) * width) / 2, y];
  }
  trim(edge.from);
  points.reverse();
  trim(edge.to);
  return points.reverse();
}
const line = (points: Point[]) =>
  points.map(([x, y], i) => (i ? "L" : "M") + x + " " + y).join(" ");

export function RequestArchitecture({ step }: { step: Hop }) {
  const marker = useId();
  const expanded = step.phase > 0 || step.to === "Router";
  const layout = expanded
    ? boxes
    : { ...boxes, Database: box(84, 210, 112), Storage: box(354, 210, 112) };
  const edges = [...external, ...(expanded ? modules : folded)];
  const active = edges.find(
    (e) => (e.from === step.from && e.to === step.to) || (e.from === step.to && e.to === step.from),
  );
  const points = active ? wire(active, layout) : [];
  if (active?.to === step.from) points.reverse();
  const path = line(points);
  const names: NodeName[] = [
    ...externalNames,
    ...(expanded ? inside : ["Backend" as const]),
    "Database",
    "Storage",
  ];
  return (
    <figure
      className="request-architecture"
      aria-label="Architettura della richiesta"
      data-expanded={expanded}
    >
      <div className="request-map-frame">
        <svg
          viewBox={"0 0 438 " + (expanded ? 410 : 235)}
          role="img"
          aria-label={step.from + " → " + step.to + " · " + step.payload}
        >
          <defs>
            <marker
              id={marker}
              markerUnits="userSpaceOnUse"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <path d="M0 0 L10 5 L0 10 Z" fill="var(--nr-cyan)" />
            </marker>
          </defs>
          {expanded && (
            <g className="request-backend">
              <rect x="6" y="121" width="426" height="214" rx="6" />
              <text x="22" y="141" className="request-enclosure-title">
                Backend
              </text>
              <text x="222" y="160">
                Ingresso HTTP
              </text>
              <text x="222" y="223">
                Logica applicativa
              </text>
              <text x="222" y="289">
                Accesso ai dati
              </text>
            </g>
          )}
          <text x="219" y={expanded ? 362 : 190} className="request-data-label">
            Servizi dati privati
          </text>
          {edges.map((e) => (
            <path key={e.from + e.to} d={line(wire(e, layout))} className="request-wire" />
          ))}
          {names.map((name) => {
            const {
              center: [x, y],
              width,
            } = layout[name];
            return (
              <g
                key={name}
                transform={"translate(" + x + " " + y + ")"}
                className="request-node"
                data-module={inside.includes(name)}
                data-role={
                  name === step.from ? "source" : name === step.to ? "destination" : "idle"
                }
              >
                <rect x={-width / 2} y={-halfHeight} width={width} height={halfHeight * 2} rx="4" />
                <text textAnchor="middle" dy="0.34em">
                  {name}
                </text>
              </g>
            );
          })}
          <g
            key={step.title + step.payload}
            data-from={step.from}
            data-to={step.to}
            className="request-transfer"
          >
            <path d={path} markerEnd={"url(#" + marker + ")"} />
            <circle r="4" style={{ offsetPath: 'path("' + path + '")' }} />
          </g>
        </svg>
      </div>
      <figcaption>
        <strong>
          {step.from} → {step.to}
        </strong>
        <small>{step.channel}</small>
        <code>{step.payload}</code>
      </figcaption>
    </figure>
  );
}
