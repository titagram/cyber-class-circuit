import { fireEvent, render, screen, within } from "@testing-library/react";
import { assert, describe, expect, it } from "vitest";
import { lessonRegistry } from "@/components/lessons/registry";

describe("Slide 1.4", () => {
  it("collega gli anelli agli ingressi e distingue l’identità del servizio", () => {
    const Lesson = lessonRegistry["cybersecurity-1-4"];
    assert(Lesson);
    render(<Lesson />);
    fireEvent.click(screen.getByRole("button", { name: "Servizi interni" }));
    expect(screen.getByText(/Da Internet puoi interrogare/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Servizio backend" }));
    expect(screen.getByText(/limitano le chiavi/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Storage del file" }));
    expect(screen.getByText(/richiesta firmata/)).toBeVisible();
  });
  it("rende osservabile il nuovo ingresso sulla porta esistente", () => {
    const Lesson = lessonRegistry["cybersecurity-1-4"];
    assert(Lesson);
    render(<Lesson />);
    fireEvent.click(screen.getByRole("button", { name: "Attiva caricamento" }));
    expect(screen.getByText(/POST .api.documents · nome/)).toBeVisible();
    expect(screen.getByText("HTTPS · 443")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Nelle funzioni web" }));
    expect(screen.getByRole("status")).toHaveTextContent("Esatto");
    fireEvent.click(screen.getByRole("button", { name: "Disattiva caricamento" }));
    expect(screen.queryByRole("button", { name: "Carica file" })).not.toBeInTheDocument();
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
