export type ArchitectureLevel = 1 | 2 | 3;

export type ArchitectureNodeKind =
  | "client"
  | "gateway"
  | "compute"
  | "database"
  | "cache"
  | "storage"
  | "backup"
  | "temporary"
  | "logging";

export type ArchitectureNode = {
  id: string;
  label: string;
  kind: ArchitectureNodeKind;
  level: ArchitectureLevel;
  x: number;
  y: number;
  description: string;
  responsibilities: readonly string[];
  dataRole: "process" | "store" | "transmit";
};

export type ArchitectureConnection = {
  id: string;
  from: string;
  to: string;
  label: string;
  level: ArchitectureLevel;
  maxLevel?: ArchitectureLevel;
  protection?: string;
};

export type TrustBoundary = {
  id: string;
  label: string;
  description: string;
  level: ArchitectureLevel;
  x: number;
};

export type DataFlowEvent = {
  id: string;
  title: string;
  description: string;
  nodes: readonly string[];
  transfers: readonly { connection: string; direction: "forward" | "reverse" }[];
  payloadLabel: string;
  payload: string;
};

export type DataFlowConfig = {
  id: string;
  label: string;
  width: number;
  height: number;
  nodes: readonly ArchitectureNode[];
  connections: readonly ArchitectureConnection[];
  boundaries: readonly TrustBoundary[];
  events: readonly DataFlowEvent[];
};

export type DataFlowHighlight = {
  nodes?: readonly string[];
  secondaryNodes?: readonly string[];
  connections?: readonly string[];
  boundaries?: readonly string[];
};

export type DataFlowExplorerProps = {
  config: DataFlowConfig;
  level: ArchitectureLevel;
  mode?: "explore" | "simulate";
  highlight?: DataFlowHighlight;
  showTrustBoundaries?: boolean;
  focusNodeId?: string;
  className?: string;
};
