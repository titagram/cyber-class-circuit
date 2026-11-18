import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cybersecurity12Slide } from "@/components/lessons/Cybersecurity12Slide";

function openIncidents() {
  render(<Cybersecurity12Slide />);
  fireEvent.click(screen.getByRole("tab", { name: "2 · Gli incidenti" }));
}

describe("Slide 1.2", () => {
  it("mantiene confrontabili l'importo originale e quello alterato nello scenario B", () => {
    openIncidents();

    fireEvent.click(screen.getByRole("button", { name: /B Violazione dell'integrità/ }));

    const panel = screen.getByRole("tabpanel", { name: "2 · Gli incidenti" });
    expect(within(panel).getByText("€ 125.000")).toBeVisible();
    expect(within(panel).getByText("€ 925.000")).toBeVisible();
    expect(within(screen.getByTestId("property-integrita")).getByText("Compromessa")).toBeVisible();
    expect(
      within(screen.getByTestId("property-riservatezza")).getByText("Non determinabile"),
    ).toBeVisible();
  });

  it("rende il documento indisponibile nello scenario C senza dichiarare alterato il contenuto", () => {
    openIncidents();

    fireEvent.click(screen.getByRole("button", { name: /C Violazione della disponibilità/ }));

    expect(screen.getByLabelText("Contratto di fornitura non disponibile")).toBeVisible();
    expect(within(screen.getByTestId("property-disponibilita")).getByText("Compromessa")).toBeVisible();
    expect(within(screen.getByTestId("property-integrita")).getByText("Non compromessa")).toBeVisible();
  });

  it("distingue provenienza dichiarata e verificata nello scenario D", () => {
    openIncidents();

    fireEvent.click(screen.getByRole("button", { name: /D Violazione dell'autenticità/ }));

    expect(screen.getByText("Provenienza dichiarata")).toBeVisible();
    expect(screen.getByText("Provenienza effettivamente verificata")).toBeVisible();
    expect(within(screen.getByTestId("property-autenticita")).getByText("Compromessa")).toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "3 · Le contromisure" }));
    expect(screen.getByText(/Autenticità non significa autorizzazione/)).toBeVisible();
  });

  it("ripristina lo stato originale e aggiorna il confronto con i controlli dello scenario scelto", () => {
    openIncidents();

    fireEvent.click(screen.getByRole("button", { name: /A Violazione della riservatezza/ }));
    expect(within(screen.getByTestId("property-riservatezza")).getByText("Compromessa")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /Ripristina documento originale/ }));
    expect(within(screen.getByTestId("property-riservatezza")).getByText("Non compromessa")).toBeVisible();
    expect(within(screen.getByTestId("property-autenticita")).getByText("Non determinabile")).toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "4 · Il confronto" }));
    fireEvent.click(screen.getByRole("button", { name: /B Violazione dell'integrità/ }));
    const summary = screen.getByLabelText("Sintesi del confronto");
    expect(within(summary).getByText("Integrità")).toBeVisible();
    expect(within(summary).getByText("Controlli applicativi")).toBeVisible();
  });
});
