import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cybersecurity11Slide } from "@/components/lessons/Cybersecurity11Slide";

describe("Slide 1.1", () => {
  it("mostra i dettagli concreti dell'asset selezionato", () => {
    render(<Cybersecurity11Slide />);

    fireEvent.click(screen.getByRole("tab", { name: "2 · Gli asset" }));
    fireEvent.click(screen.getByRole("button", { name: "Documenti riservati" }));

    expect(screen.getByText(/Contratti, preventivi, relazioni/)).toBeVisible();
    expect(screen.getByText(/Divulgazione di segreti commerciali/)).toBeVisible();
  });

  it("spiega il fattore selezionato nel Crime Triangle", () => {
    render(<Cybersecurity11Slide />);

    fireEvent.click(screen.getByRole("tab", { name: "3 · Il triangolo" }));
    fireEvent.click(screen.getByRole("button", { name: /OPPORTUNITÀ/ }));

    expect(screen.getByText(/inclusa la facilità di accesso al bersaglio/)).toBeVisible();
    expect(screen.getByText(/Un endpoint pubblico accetta l'identificativo/)).toBeVisible();
  });

  it("elimina soltanto l'opportunità specifica nella situazione B", () => {
    render(<Cybersecurity11Slide />);

    fireEvent.click(screen.getByRole("tab", { name: "4 · Le opportunità" }));
    fireEvent.click(screen.getByRole("button", { name: "Situazione B — Controllo corretto" }));

    expect(screen.getByText(/Il backend verifica l'autorizzazione alla risorsa per ogni richiesta/)).toBeVisible();
    expect(
      screen.getByText(/Quella specifica opportunità viene eliminata, pur restando possibili altri percorsi di attacco/),
    ).toBeVisible();
    expect(
      screen.getByRole("img", {
        name: "Crime Triangle: l'opportunità specifica è attenuata e i suoi lati sono interrotti",
      }),
    ).toBeVisible();
  });
});
