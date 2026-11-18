import { fireEvent, render, screen, within } from "@testing-library/react";
import { assert, describe, expect, it } from "vitest";
import { lessonRegistry } from "@/components/lessons/registry";

describe("Slide 1.4", () => {
  it("collega la prospettiva sulla rete a un confine e quella sullo storage a un nodo", () => {
    const Lesson = lessonRegistry["cybersecurity-1-4"];
    assert(Lesson, "La lezione deve essere registrata");
    render(<Lesson />);

    fireEvent.click(screen.getByRole("tab", { name: "Collegamento di rete" }));
    expect(screen.getByTestId("data-flow-connection-browser-proxy")).toHaveAttribute(
      "data-highlighted",
      "true",
    );
    expect(screen.getByText("Utente ↔ servizio")).toHaveClass("df-boundary-label-active");
    expect(screen.getByText("Controllo da verificare")).toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "Archivi e copie" }));
    expect(screen.getByTestId("data-flow-node-backup")).toHaveAttribute("data-highlighted", "true");
    expect(screen.getByTestId("data-flow-connection-browser-proxy")).toHaveAttribute(
      "data-highlighted",
      "false",
    );
  });
});

describe("Slide 1.5", () => {
  it("rende il contenuto leggibile solo sul tratto HTTP o all’endpoint TLS", () => {
    const Lesson = lessonRegistry["cybersecurity-1-5"];
    assert(Lesson, "La lezione deve essere registrata");
    render(<Lesson />);

    const observation = screen.getByRole("region", { name: "Osservazione del traffico" });
    expect(within(observation).queryByText(/GET \/api\/documents\/42/)).not.toBeInTheDocument();
    expect(within(observation).getByText(/indirizzi IP/)).toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "Proxy → Backend" }));
    expect(screen.getByTestId("data-flow-connection-proxy-backend")).toHaveAttribute(
      "data-highlighted",
      "true",
    );
    expect(within(observation).getByText(/GET \/api\/documents\/42/)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "HTTPS" }));
    expect(within(observation).queryByText(/GET \/api\/documents\/42/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "All’endpoint TLS" }));
    expect(within(observation).getByText(/GET \/api\/documents\/42/)).toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "Browser → Reverse proxy" }));
    expect(within(observation).queryByText(/GET \/api\/documents\/42/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Proxy → Backend" }));
    expect(screen.getByRole("button", { name: "HTTPS" })).toHaveAttribute("aria-pressed", "true");
  });
});
