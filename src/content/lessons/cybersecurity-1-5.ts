export const tlsLesson = {
  title: "1.5 — HTTP e HTTPS: che cosa vede la rete?",
  subtitle:
    "Segui la richiesta del contratto 42 sui due collegamenti e confronta ciò che è leggibile.",
};

export const tlsLinks = {
  "browser-proxy": {
    label: "Browser → Reverse proxy",
    endpoint: "reverse proxy",
  },
  "proxy-backend": {
    label: "Proxy → Backend",
    endpoint: "backend",
  },
} as const;

export type TlsLinkId = keyof typeof tlsLinks;
export type ConnectionProtocol = "HTTP" | "HTTPS";

export const originalProtocols: Record<TlsLinkId, ConnectionProtocol> = {
  "browser-proxy": "HTTPS",
  "proxy-backend": "HTTP",
};
