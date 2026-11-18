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

    fireEvent.click(within(panel).getByRole("button", { name: "Livello 3" }));
    expect(within(panel).getByTestId("data-flow-node-backup")).toBeVisible();
    expect(within(panel).getByTestId("data-flow-node-temp")).toBeVisible();
    expect(within(panel).getByText("tenant-alfa/contracts/42.pdf")).toBeVisible();

    fireEvent.click(within(panel).getByRole("button", { name: "Livello 1" }));
    expect(within(panel).queryByTestId("data-flow-node-backup")).not.toBeInTheDocument();
    expect(within(panel).queryByTestId("data-flow-node-storage")).not.toBeInTheDocument();
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
