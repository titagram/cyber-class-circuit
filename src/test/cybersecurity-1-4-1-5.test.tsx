import { fireEvent, render, screen, within } from "@testing-library/react";
import { assert, describe, expect, it } from "vitest";
import { lessonRegistry } from "@/components/lessons/registry";

describe("Slide 1.4", () => {
  it("sincronizza i nodi con lo scenario e mostra dove si ferma un accesso alla cache", () => {
    const Lesson = lessonRegistry["cybersecurity-1-4"];
    assert(Lesson, "La lezione deve essere registrata");
    render(<Lesson />);

    fireEvent.click(screen.getByRole("button", { name: "Ispeziona Cache Redis" }));
    const panel = within(screen.getByRole("tabpanel", { name: "Archivi e copie" }));
    expect(panel.getByRole("heading", { name: "Cache Redis" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Ispeziona Cache Redis" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(panel.getByText(/servizio interno/)).toBeVisible();
    expect(panel.queryByText("Controllo da verificare")).not.toBeInTheDocument();

    fireEvent.click(panel.getByRole("button", { name: "Segui il percorso" }));
    const link = screen.getByTestId("data-flow-connection-backend-cache");
    expect(link).toHaveAttribute("data-highlighted", "true");
    expect(link).toHaveAttribute("data-direction", "forward");
    expect(screen.getByText("Applicazione ↔ dati")).toHaveClass("df-boundary-label-active");

    fireEvent.click(panel.getByRole("button", { name: "Verifica il controllo" }));
    expect(panel.getByText("Accesso a Redis negato")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Ispeziona Object storage" }));
    expect(panel.getByRole("heading", { name: "Object storage" })).toBeVisible();
    expect(panel.queryByText("Accesso a Redis negato")).not.toBeInTheDocument();
    expect(panel.getByRole("button", { name: "Segui il percorso" })).toBeVisible();
    expect(link).toHaveAttribute("data-highlighted", "false");
  });

  it("permette di passare dalle icone al caso della rete senza una selezione residua", () => {
    const Lesson = lessonRegistry["cybersecurity-1-4"];
    assert(Lesson, "La lezione deve essere registrata");
    render(<Lesson />);

    fireEvent.click(screen.getByRole("button", { name: "Ispeziona Backend" }));
    fireEvent.click(screen.getByRole("tab", { name: "Collegamento di rete" }));
    const panel = within(screen.getByRole("tabpanel", { name: "Collegamento di rete" }));
    expect(screen.getByRole("button", { name: "Ispeziona Backend" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    fireEvent.click(panel.getByRole("button", { name: "Segui il percorso" }));
    expect(screen.getByTestId("data-flow-connection-browser-proxy")).toHaveAttribute(
      "data-highlighted",
      "true",
    );
    expect(screen.getByText("Utente ↔ servizio")).toHaveClass("df-boundary-label-active");
  });
});

describe("Slide 1.5", () => {
  it("rende il contenuto leggibile solo sul tratto HTTP o all’endpoint TLS", () => {
    const Lesson = lessonRegistry["cybersecurity-1-5"];
    assert(Lesson, "La lezione deve essere registrata");
    render(<Lesson />);

    const observation = screen.getByRole("region", { name: "Osservazione del traffico" });
    const diagram = within(
      screen.getByRole("figure", { name: "Percorso della richiesta del contratto 42" }),
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
