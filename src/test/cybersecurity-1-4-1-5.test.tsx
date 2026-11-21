import { fireEvent, render, screen, within } from "@testing-library/react";
import { assert, describe, expect, it } from "vitest";
import { lessonRegistry } from "@/components/lessons/registry";

describe("Slide 1.4", () => {
  it("cambia solo sessione e permesso sulla stessa lettura", () => {
    const Lesson = lessonRegistry["cybersecurity-1-4"];
    assert(Lesson);
    render(<Lesson />);
    const status = screen.getByRole("status", { name: "Esito della richiesta" });
    const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
    const storage = screen.getByRole("button", { name: "Storage privato" });
    const permit = screen.getByRole("button", { name: "Con lettura" });
    const request = screen.getAllByText("GET /api/documents/42")[0];
    expect(permit).toBeDisabled();
    expect(status).toHaveTextContent("401 Unauthorized");
    expect(status).toHaveTextContent("Non valutato");
    click("Sessione di Giulia");
    expect(status).toHaveTextContent("403 Forbidden");
    expect(storage).toHaveTextContent("Nessuna chiamata");
    click("Storage privato");
    expect(screen.getByRole("region", { name: "Interfaccia selezionata" })).toHaveTextContent(
      "API dello storage è privata",
    );
    expect(status).toHaveTextContent("403 Forbidden");
    click("Con lettura");
    expect(status).toHaveTextContent("200 OK");
    expect(storage).toHaveTextContent("Byte restituiti");
    expect(status).toHaveTextContent("propria identità tecnica");
    expect(request).toHaveTextContent("GET /api/documents/42");
    click("Senza sessione");
    expect(permit).toBeDisabled();
    expect(status).toHaveTextContent("401 Unauthorized");
    click("Sessione di Giulia");
    expect(status).toHaveTextContent("200 OK");
    click("Senza lettura");
    expect(status).toHaveTextContent("403 Forbidden");
  });
  it("aggiunge e rimuove un ramo alla volta e mostra l’effetto della revoca", () => {
    const Lesson = lessonRegistry["cybersecurity-1-4"];
    assert(Lesson);
    render(<Lesson />);
    const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
    const map = within(screen.getByRole("figure", { name: "Mappa delle funzioni di 42.pdf" }));
    const detail = screen.getByRole("region", { name: "Percorso selezionato" });
    expect(map.getByRole("button", { name: "Anteprima" })).toBeDisabled();
    click("Attiva caricamento");
    expect(map.getByText(/Nome e byte del PDF/)).toBeVisible();
    click("Nelle funzioni web");
    expect(screen.getByRole("status", { name: "Risposta sul caricamento" })).toHaveTextContent(
      "Esatto",
    );
    click("Genera anteprima");
    expect(detail).toHaveTextContent("interpreta la prima pagina");
    expect(map.getByText(/Storage → Generatore → Browser/)).toBeVisible();
    click("Attiva link condiviso");
    expect(detail).toHaveTextContent("token sia valido");
    click("Revoca il link");
    expect(map.getByText("Nessun byte al destinatario")).toBeVisible();
    click("Attiva ripristino");
    expect(map.getByText("Backup → Servizio di ripristino → Storage")).toBeVisible();
    expect(detail).toHaveTextContent("versione corrente");
    click("Link condiviso");
    expect(detail).toHaveTextContent("trova la revoca");
    click("Prova con un nuovo link");
    expect(map.getByText("Token al gestore · PDF al destinatario")).toBeVisible();
    for (const undo of [
      "Disattiva ripristino",
      "Disattiva condivisione",
      "Disattiva anteprima",
      "Disattiva caricamento",
    ])
      click(undo);
    expect(map.getByRole("button", { name: "Caricamento" })).toBeDisabled();
    expect(detail).toHaveTextContent("sola lettura");
  });
});

describe("Slide 1.5", () => {
  it("rende il contenuto leggibile solo sul tratto HTTP o all’endpoint TLS", () => {
    const Lesson = lessonRegistry["cybersecurity-1-5"];
    assert(Lesson, "La lezione deve essere registrata");
    render(<Lesson />);

    const observation = screen.getByRole("region", { name: "Osservazione del traffico" });
    const diagram = within(
      screen.getByRole("figure", { name: "Percorso della richiesta del file 42.pdf" }),
    );
    const externalLink = diagram.getByTestId("data-flow-connection-browser-proxy");
    const internalLink = diagram.getByTestId("data-flow-connection-proxy-backend");

    expect(externalLink).toHaveAttribute("data-protocol", "HTTPS");
    expect(within(externalLink).getByTestId("traffic-observer")).toBeVisible();
    expect(internalLink).toHaveAttribute("data-protocol", "HTTP");
    expect(within(observation).queryByText(/GET \/api\/documents\/42/)).not.toBeInTheDocument();
    expect(within(observation).getByText(/indirizzi IP/)).toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "Proxy → Backend" }));
    expect(internalLink).toHaveAttribute("data-highlighted", "true");
    expect(within(internalLink).getByTestId("traffic-observer")).toBeVisible();
    expect(within(observation).getByText(/GET \/api\/documents\/42/)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "HTTPS" }));
    expect(internalLink).toHaveAttribute("data-protocol", "HTTPS");
    expect(internalLink).toHaveTextContent("Cifrato TLS");
    expect(externalLink).toHaveAttribute("data-protocol", "HTTPS");
    expect(within(observation).queryByText(/GET \/api\/documents\/42/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "All’endpoint TLS" }));
    expect(within(internalLink).queryByTestId("traffic-observer")).not.toBeInTheDocument();
    const backend = diagram.getByTestId("data-flow-node-backend");
    expect(within(backend).getByTestId("traffic-observer")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "HTTPS" }));
    expect(within(backend).getByTestId("traffic-observer")).toBeVisible();
    expect(within(observation).getByText(/GET \/api\/documents\/42/)).toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "Browser → Reverse proxy" }));
    expect(within(observation).queryByText(/GET \/api\/documents\/42/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Proxy → Backend" }));
    expect(screen.getByRole("button", { name: "HTTPS" })).toHaveAttribute("aria-pressed", "true");
  });
});
