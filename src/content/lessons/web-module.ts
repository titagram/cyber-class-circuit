export const webTitles: Record<string, string> = {
  "cybersecurity-1-1": "1.1 — Il perimetro di una webapp",
  "cybersecurity-1-2": "1.2 — Dagli input ai controlli applicativi",
  "cybersecurity-1-5": "1.5 — Chi può ottenere il contenuto di 42.pdf?",
};

export type ReviewCase = {
  name: string;
  route: readonly string[];
  input: string;
  decision: string;
  risk: string;
  control: string;
  implementation?: string;
  evidence: string;
  variant?: { label: string; input: string; route: readonly string[]; decision: string };
};
