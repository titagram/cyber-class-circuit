import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cybersecurity11Slide } from "@/components/lessons/Cybersecurity11Slide";
describe("Perimetro web", () => {
  it("distingue ingressi pubblici, amministrativi, dipendenze e integrazioni", () => {
    render(<Cybersecurity11Slide />);
    const card = within(screen.getByRole("region", { name: "Analisi del percorso" }));
    for (const [name, input] of [
      ["Sito pubblico", "GET /documenti"],
      ["API del file", "GET /api/documents/42"],
      ["Link condiviso", "GET /s/demo-2"],
      ["Console operativa", "POST /admin/restores"],
      ["Dipendenze private", "Identità di servizio"],
      ["Integrazione opzionale", "POST /integrations/imports"],
    ] as const) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(name) }));
      expect(card.getByRole("heading", { name })).toBeVisible();
      expect(card.getByText(input, { exact: false, selector: "code" })).toBeVisible();
      expect(card.getByRole("list")).toBeVisible();
    }
  });
});
