import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Cybersecurity13Slide } from "@/components/lessons/Cybersecurity13Slide";

afterEach(() => {
  vi.useRealTimers();
});

function openMoment(name: string) {
  render(<Cybersecurity13Slide />);
  fireEvent.click(screen.getByRole("tab", { name }));
}

describe("Slide 1.3", () => {
  it("segue il download e mostra una copia locale insieme all’originale", () => {
    vi.useFakeTimers();
    render(<Cybersecurity13Slide />);
    const computer = within(screen.getByRole("region", { name: "Computer di Giulia" }));
    const original = within(screen.getByRole("region", { name: "Server" })).getByText("42.pdf");
    expect(computer.getByText("42.pdf")).toBeVisible();
    expect(computer.queryByText("Cartella Download")).not.toBeInTheDocument();
    fireEvent.click(computer.getByRole("button", { name: "Scarica PDF" }));
    expect(screen.getByRole("status")).toHaveTextContent("browser chiede al server");
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByRole("status")).toHaveTextContent("server invia i byte");
    expect(computer.queryByText("Cartella Download")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2200));
    expect(computer.getByText("Cartella Download")).toBeVisible();
    expect(computer.getAllByText("42.pdf")).toHaveLength(2);
    expect(original).toBeVisible();
    fireEvent.click(computer.getByRole("button", { name: "Rivedi dall’inizio" }));
    expect(computer.queryByText("Cartella Download")).not.toBeInTheDocument();
    expect(original).toBeVisible();
  });

  it("mostra solo Browser, Backend e Database nell'architettura essenziale", () => {
    openMoment("2 · L'essenziale");
    const panel = screen.getByRole("tabpanel", { name: "2 · L'essenziale" });

    expect(within(panel).getByTestId("data-flow-node-browser")).toBeVisible();
    expect(within(panel).getByTestId("data-flow-node-backend")).toBeVisible();
    expect(within(panel).getByTestId("data-flow-node-database")).toBeVisible();
    expect(within(panel).queryByTestId("data-flow-node-proxy")).not.toBeInTheDocument();
    expect(within(panel).queryByTestId("data-flow-node-storage")).not.toBeInTheDocument();
  });

  it("espande e riduce liberamente i livelli senza perdere la distinzione tra metadati e file", () => {
    openMoment("3 · L'architettura");
    const panel = screen.getByRole("tabpanel", { name: "3 · L'architettura" });

    const current = () =>
      within(within(panel).getByRole("region", { name: "Dettagli dell’architettura" }));
    expect(current().getByText("tenant-alfa/contracts/42.pdf")).toBeVisible();
    fireEvent.click(within(panel).getByRole("button", { name: "Livello 3" }));
    expect(current().getByRole("heading", { name: "Backup e file temporanei" })).toBeVisible();
    for (const label of [
      "Browser",
      "Reverse proxy",
      "Backend",
      "Database",
      "Cache Redis",
      "Object storage",
      "Backup",
      "File temporanei",
      "Sistemi di logging",
    ]) {
      fireEvent.click(within(panel).getByRole("button", { name: "Ispeziona " + label }));
      expect(current().getByRole("heading", { name: label })).toBeVisible();
    }
    expect(current().getByText(/registrare l’ID 42 e l’esito/)).toBeVisible();
    fireEvent.click(current().getByRole("button", { name: "Torna al riepilogo del livello" }));
    expect(current().getByRole("heading", { name: "Backup e file temporanei" })).toBeVisible();
    fireEvent.click(within(panel).getByRole("button", { name: "Ispeziona Backup" }));
    fireEvent.click(within(panel).getByRole("button", { name: "Livello 1" }));
    expect(within(panel).queryByTestId("data-flow-node-backup")).not.toBeInTheDocument();
    expect(current().getByRole("heading", { name: "Chi chiede il file?" })).toBeVisible();
    expect(current().queryByRole("heading", { name: "Backup" })).not.toBeInTheDocument();
  });

  it("permette passaggi diretti, avanzamento e ripristino della richiesta", () => {
    openMoment("4 · La richiesta");
    const panel = screen.getByRole("tabpanel", { name: "4 · La richiesta" });

    fireEvent.click(within(panel).getByRole("button", { name: /4 Database · restituisce i metadati/ }));
    expect(within(panel).getByText("file: tenant-alfa/contracts/42.pdf", { exact: false })).toBeVisible();
    expect(within(panel).getByTestId("data-flow-connection-backend-database")).toHaveAttribute("data-highlighted", "true");

    fireEvent.click(within(panel).getByRole("button", { name: /Passaggio successivo/ }));
    expect(within(panel).getByRole("heading", { name: "Object storage · restituisce il file" })).toBeVisible();

    fireEvent.click(within(panel).getByRole("button", { name: /Ripristina/ }));
    expect(within(panel).getByRole("heading", { name: "Browser · genera la richiesta" })).toBeVisible();
    expect(within(panel).getByText("GET /api/documents/42 HTTP/1.1", { exact: false })).toBeVisible();
  });

  it("avanza automaticamente soltanto durante la riproduzione e conserva l'ispezione dei nodi", () => {
    vi.useFakeTimers();
    openMoment("4 · La richiesta");
    const panel = screen.getByRole("tabpanel", { name: "4 · La richiesta" });

    fireEvent.click(within(panel).getByRole("button", { name: "Ispeziona Browser" }));
    expect(within(panel).getByRole("complementary", { name: "Dettaglio: Browser" })).toBeVisible();
    fireEvent.click(within(panel).getByRole("button", { name: "Avvia" }));
    act(() => vi.advanceTimersByTime(3300));
    expect(within(panel).getByRole("heading", { name: "Reverse proxy · riceve e inoltra" })).toBeVisible();
    expect(within(panel).getByRole("complementary", { name: "Dettaglio: Browser" })).toBeVisible();

    fireEvent.click(within(panel).getByRole("button", { name: "Pausa" }));
    act(() => vi.advanceTimersByTime(7000));
    expect(within(panel).getByRole("heading", { name: "Reverse proxy · riceve e inoltra" })).toBeVisible();
  });

  it("mostra il ritorno verso il browser e ferma il flusso visivo in pausa", () => {
    openMoment("4 · La richiesta");
    const panel = screen.getByRole("tabpanel", { name: "4 · La richiesta" });
    fireEvent.click(within(panel).getByRole("button", { name: "Avvia" }));
    expect(within(panel).getByTestId("data-flow-map")).toHaveAttribute("data-playing", "true");

    fireEvent.click(within(panel).getByRole("button", { name: "Pausa" }));
    expect(within(panel).getByTestId("data-flow-map")).toHaveAttribute("data-playing", "false");

    fireEvent.click(within(panel).getByRole("button", { name: /Risposta · torna verso il browser/ }));
    expect(within(panel).getByTestId("data-flow-connection-browser-proxy")).toHaveAttribute(
      "data-direction",
      "reverse",
    );
    expect(within(panel).getByTestId("data-flow-connection-backend-storage")).toHaveAttribute(
      "data-highlighted",
      "false",
    );
  });

  it("sincronizza i tratti in transito con la mappa e il riquadro sotto", () => {
    const name = "5 · Gli stati del dato";
    openMoment(name);
    const panel = within(screen.getByRole("tabpanel", { name }));
    const detail = within(panel.getByRole("region", { name: "Dati in transito" }));
    function selectLeg(label: string, edge: string, result: RegExp) {
      fireEvent.click(detail.getByRole("button", { name: label }));
      expect(detail.getByRole("heading", { name: label })).toBeVisible();
      expect(detail.getByText(result)).toBeVisible();
      expect(panel.getByTestId("data-flow-connection-" + edge)).toHaveAttribute("data-highlighted", "true");
    }

    selectLeg("Backend ↔ Database", "backend-database", /Il database restituisce i metadati/);
    selectLeg("Backend ↔ Object storage", "backend-storage", /Lo storage invia al backend i byte/);
    expect(panel.getByTestId("data-flow-connection-backend-database")).toHaveAttribute("data-highlighted", "false");

    fireEvent.click(panel.getByRole("button", { name: "Ispeziona Backup" }));
    expect(detail.getByRole("heading", { name: "Database ↔ Backup" })).toBeVisible();
    selectLeg("Object storage ↔ Backup", "storage-backup", /L’archivio conserva una copia del PDF/);
    fireEvent.click(detail.getByRole("button", { name: "Torna alla panoramica" }));
    expect(detail.getByRole("heading", { name: "Dati in transito" })).toBeVisible();
    expect(panel.getByRole("button", { name: "Ispeziona Backup" })).toHaveAttribute("aria-pressed", "false");
  });

  it("distingue transito, riposo e uso senza rendere persistente la memoria", () => {
    openMoment("5 · Gli stati del dato");
    const panel = screen.getByRole("tabpanel", { name: "5 · Gli stati del dato" });

    fireEvent.click(within(panel).getByRole("button", { name: "Data at rest" }));
    expect(within(panel).getByTestId("data-flow-node-storage")).toHaveAttribute("data-highlighted", "true");
    expect(within(panel).getByTestId("data-flow-node-browser")).toHaveAttribute("data-highlighted", "false");

    fireEvent.click(within(panel).getByRole("button", { name: "Data in use" }));
    expect(within(panel).getByTestId("data-flow-node-backend")).toHaveAttribute("data-highlighted", "true");
    expect(within(panel).getByTestId("data-flow-node-browser")).toHaveAttribute("data-highlighted", "true");
    expect(within(panel).getByText(/Essere presenti in memoria non significa essere necessariamente salvati/)).toBeVisible();
  });

  it("sincronizza la scheda del tratto con tutti i nodi, i rami e la panoramica", () => {
    openMoment("7 · I confini di fiducia");
    const panel = within(screen.getByRole("tabpanel", { name: "7 · I confini di fiducia" }));
    const card = within(panel.getByRole("region", { name: "Un tratto alla volta" }));
    for (const [node, leg] of [
      ["Browser", "browser-proxy"],
      ["Reverse proxy", "proxy-backend"],
      ["Backend", "backend-database"],
      ["Database", "backend-database"],
      ["Cache Redis", "backend-cache"],
      ["Object storage", "backend-storage"],
      ["Sistemi di logging", "backend-logs"],
      ["File temporanei", "backend-temp"],
      ["Backup", "database-backup"],
    ] as const) {
      const icon = panel.getByRole("button", { name: "Ispeziona " + node });
      fireEvent.click(icon);
      expect(icon).toHaveAttribute("aria-pressed", "true");
      expect(card.getByRole("heading", { name: node })).toBeVisible();
      expect(panel.getByTestId("data-flow-connection-" + leg)).toHaveAttribute(
        "data-highlighted",
        "true",
      );
    }
    fireEvent.click(card.getByRole("button", { name: "Object storage ↔ Backup" }));
    expect(
      card.getByRole("heading", { name: "Quali permessi proteggono la copia del file?" }),
    ).toBeVisible();
    expect(panel.getByTestId("data-flow-connection-database-backup")).toHaveAttribute(
      "data-highlighted",
      "false",
    );
    expect(panel.getByTestId("data-flow-connection-storage-backup")).toHaveAttribute(
      "data-highlighted",
      "true",
    );
    fireEvent.click(card.getByRole("button", { name: "Torna alla panoramica" }));
    expect(panel.getByRole("button", { name: "Ispeziona Backup" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(card.getByText(/Se proteggo la comunicazione/)).toBeVisible();
  });

  it("distingue le copie presenti da quelle possibili e valuta TLS per ogni tratto", () => {
    openMoment("6 · Le copie");
    const copies = screen.getByRole("tabpanel", { name: "6 · Le copie" });
    const cache = within(copies).getByRole("heading", { name: "Cache" }).closest("section")!;
    const storage = within(copies).getByRole("heading", { name: "Object storage" }).closest("section")!;
    expect(within(cache).getByText("Copia possibile")).toBeVisible();
    expect(within(storage).getByText("Presente nello scenario")).toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "7 · I confini di fiducia" }));
    const trust = screen.getByRole("tabpanel", { name: "7 · I confini di fiducia" });
    expect(within(trust).getByText("TLS attivo; termina sul reverse proxy")).toBeVisible();
    expect(within(trust).getAllByText("Da valutare: dipende dalla configurazione interna")).toHaveLength(1);
    expect(within(trust).getByText(/I collegamenti interni non sono necessariamente insicuri/)).toBeVisible();
  });
});
