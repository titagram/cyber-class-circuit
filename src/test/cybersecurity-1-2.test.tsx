import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cybersecurity12Slide } from "@/components/lessons/Cybersecurity12Slide";
describe("Input applicativi", () => {
  it("confronta l’esito a parità di ingresso e ripristina il riferimento cambiando caso", () => {
    render(<Cybersecurity12Slide />);
    const card = within(screen.getByRole("region", { name: "Analisi del percorso" }));
    for (const [name, variant, end] of [
      ["Percorso e ID", "Giulia senza lettura", "403 al browser"],
      ["Query di ricerca", "Nessun risultato", "Elenco vuoto"],
      ["Cambio lingua", "Lingua italiana", "it.json"],
      ["Login e cookie", "Credenziali errate", "401 al browser"],
      ["Upload e anteprima", "Scrittura negata", "403 al browser"],
      ["Operazione con sessione", "Token anti-CSRF assente", "Rifiuto prima della scrittura"],
      ["Intestazioni al proxy", "Host non pubblicato", "Rifiuto in ingresso"],
    ] as const) {
      fireEvent.click(screen.getByRole("button", { name }));
      expect(card.getByRole("button", { name: "Richiesta di riferimento" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      fireEvent.click(card.getByRole("button", { name: variant }));
      expect(within(card.getByRole("list")).getByText(end)).toBeVisible();
    }
  });
});
