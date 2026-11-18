import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ModularMathLab } from "@/components/lessons/chapter2/ModularMathLab";

function openTab(name: string) {
  fireEvent.mouseDown(screen.getByRole("tab", { name }), { button: 0 });
  return within(screen.getByRole("tabpanel", { name }));
}

describe("Laboratorio di matematica crittografica", () => {
  it("normalizza i resti negativi anche dopo aver cambiato modulo", () => {
    render(<ModularMathLab />);
    const panel = within(screen.getByRole("tabpanel", { name: "Resti" }));

    fireEvent.change(panel.getByLabelText("Numero intero"), { target: { value: "-1" } });
    fireEvent.click(panel.getByRole("button", { name: "Vai" }));
    expect(panel.getByText("-1 mod 12 = 11")).toBeVisible();
    expect(panel.getByRole("button", { name: "Posizione 11" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.change(panel.getByLabelText("Modulo"), { target: { value: "7" } });
    expect(panel.getByText("-1 mod 7 = 6")).toBeVisible();
    fireEvent.click(panel.getByRole("button", { name: "Avanza di un giro" }));
    expect(panel.getByText("6 mod 7 = 6")).toBeVisible();
  });

  it("disattiva i salti fuori dall'intervallo degli interi esatti", () => {
    render(<ModularMathLab />);
    const panel = within(screen.getByRole("tabpanel", { name: "Resti" }));

    fireEvent.change(panel.getByLabelText("Numero intero"), {
      target: { value: "-9007199254740991" },
    });
    fireEvent.click(panel.getByRole("button", { name: "Vai" }));
    fireEvent.change(panel.getByLabelText("Modulo"), { target: { value: "3" } });
    expect(panel.getByRole("button", { name: "Posizione 1" })).toBeDisabled();
    expect(panel.getByRole("button", { name: "Posizione 2" })).toBeEnabled();
  });

  it("distingue un inverso da un prodotto che non può dare resto 1", () => {
    render(<ModularMathLab />);
    const panel = openTab("Inversi");

    fireEvent.click(panel.getByRole("button", { name: "Moltiplicatore 5, resto 1" }));
    expect(panel.getByText("5 è l’inverso di 5")).toBeVisible();
    fireEvent.change(panel.getByLabelText("Fattore a"), { target: { value: "6" } });
    expect(panel.getByText("Nessun inverso")).toBeVisible();
    expect(panel.getByText("MCD(6, 12) = 6")).toBeVisible();
    expect(panel.queryByRole("button", { name: /resto 1$/ })).not.toBeInTheDocument();
  });

  it("esplora i nodi della potenza, ricalcola i resti e gestisce l'esponente zero", () => {
    render(<ModularMathLab />);
    const panel = openTab("Potenze");

    fireEvent.click(panel.getByRole("button", { name: "Passo successivo" }));
    expect(panel.getByRole("button", { name: "Esponente 1, resto 3" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(panel.getByRole("button", { name: "Esponente 4, resto 4" }));
    expect(panel.getByText("(6 × 3) mod 7 = 4")).toBeVisible();
    fireEvent.change(panel.getByLabelText("Esponente"), { target: { value: "0" } });
    expect(panel.getByText("1 mod 7 = 1")).toBeVisible();
    expect(panel.getByRole("button", { name: "Passo successivo" })).toBeDisabled();
  });

  it("mostra solo i valori pubblici prima della derivazione e riparte al cambio degli esponenti", () => {
    render(<ModularMathLab />);
    const panel = openTab("Diffie–Hellman");

    fireEvent.click(panel.getByRole("button", { name: "Invia i valori pubblici" }));
    const channel = within(panel.getByRole("region", { name: "Canale pubblico" }));
    expect(channel.getByText("A = 8")).toBeVisible();
    expect(channel.getByText("B = 19")).toBeVisible();
    expect(panel.queryByText("Segreto condiviso = 2")).not.toBeInTheDocument();

    fireEvent.click(panel.getByRole("button", { name: "Calcola il segreto" }));
    expect(panel.getByText("Segreto condiviso = 2")).toBeVisible();
    fireEvent.change(panel.getByLabelText("Esponente privato di Bob"), {
      target: { value: "11" },
    });
    expect(panel.getByRole("button", { name: "Invia i valori pubblici" })).toBeVisible();
    expect(panel.queryByText(/Segreto condiviso =/)).not.toBeInTheDocument();
  });
});
