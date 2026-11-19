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

  it("scopre i resti dei tentativi e ricava lo stesso inverso con Bézout", () => {
    render(<ModularMathLab />);
    const panel = openTab("Inversi");
    fireEvent.click(panel.getByRole("button", { name: "Prova 3 modulo 7" }));
    expect(panel.queryByRole("button", { name: "Moltiplicatore 5, resto 1" })).toBeNull();
    fireEvent.click(panel.getByRole("button", { name: "Moltiplicatore 5" }));
    expect(panel.getByText("5 è l’inverso di 3")).toBeVisible();
    expect(panel.getByText("1 = (−2) × 3 + 1 × 7")).toBeInTheDocument();

    fireEvent.click(panel.getByRole("button", { name: "Prova 3 modulo 9" }));
    expect(panel.getByText("Nessun inverso")).toBeVisible();
    expect(panel.getByText("MCD(3, 9) = 3")).toBeVisible();
  });

  it("verifica Eulero usando φ(n) e mostra il limite della coprimalità", () => {
    render(<ModularMathLab />);
    const panel = openTab("Fermat ed Eulero");
    const click = (name: string) => fireEvent.click(panel.getByRole("button", { name }));

    click("Prova 2 modulo 9");
    click("Moltiplica i coprimi");
    expect(panel.getByRole("button", { name: "Da 5 al resto 1" })).toBeVisible();
    click("Verifica la potenza");
    expect(panel.getByLabelText("Potenza di Eulero")).toHaveTextContent("mod 9 = 1");

    click("Prova 3 modulo 9");
    click("Moltiplica i coprimi");
    expect(panel.getByText("2 resti distinti su 6")).toBeVisible();
    click("Verifica la potenza");
    expect(panel.getByLabelText("Potenza di Eulero")).toHaveTextContent("mod 9 = 0");
  });

  it("incrocia due classi nel CRT e segnala i resti incompatibili", () => {
    render(<ModularMathLab />);
    const panel = openTab("CRT");
    const click = (name: string) => fireEvent.click(panel.getByRole("button", { name }));

    click("Applica il primo resto");
    expect(panel.queryByLabelText("Intersezione dei resti")).toBeNull();
    click("Incrocia i due resti");
    expect(panel.getByLabelText("Intersezione dei resti")).toHaveTextContent("x ≡ 8 (mod 15)");

    fireEvent.change(panel.getByLabelText("Secondo modulo"), { target: { value: "6" } });
    click("Applica il primo resto");
    click("Incrocia i due resti");
    expect(panel.getByLabelText("Intersezione dei resti")).toHaveTextContent("Nessuna soluzione");
  });

  it("avanza dall'orologio a Euclide e rivela il MCD all'ultima divisione", () => {
    render(<ModularMathLab />);
    fireEvent.click(screen.getByRole("button", { name: "Vai a Euclide" }));
    const panel = within(screen.getByRole("tabpanel", { name: "Euclide" }));

    expect(panel.getByText("48 = 2 × 18 + 12")).toBeVisible();
    expect(panel.queryByText("MCD(48, 18) = 6")).not.toBeInTheDocument();
    fireEvent.click(panel.getByRole("button", { name: "Prossima divisione" }));
    expect(panel.getByText("18 = 1 × 12 + 6")).toBeVisible();
    fireEvent.click(panel.getByRole("button", { name: "Prossima divisione" }));
    expect(panel.getByText("12 = 2 × 6 + 0")).toBeVisible();
    expect(panel.getByText("MCD(48, 18) = 6")).toBeVisible();
  });

  it("aggiorna φ e riconosce che due numeri composti possono essere coprimi", () => {
    render(<ModularMathLab />);
    const panel = openTab("Coprimi e φ");

    expect(panel.getByText("φ(12) = 4")).toBeVisible();
    fireEvent.change(panel.getByLabelText("Numero n"), { target: { value: "15" } });
    expect(panel.getByText("φ(15) = 8")).toBeVisible();
    fireEvent.click(panel.getByRole("button", { name: "Numero 4, coprimo" }));
    expect(panel.getByText("MCD(4, 15) = 1")).toBeVisible();
  });

  it("Mini-RSA blocca un esponente senza inverso e recupera anche un messaggio non coprimo con n", () => {
    render(<ModularMathLab />);
    const panel = openTab("Mini-RSA");
    const click = (name: string) => fireEvent.click(panel.getByRole("button", { name }));
    const change = (label: string, value: string) =>
      fireEvent.change(panel.getByLabelText(label), { target: { value } });

    change("Primo q", "5");
    expect(panel.getByRole("button", { name: "Calcola n e φ(n)" })).toBeDisabled();
    change("Primo q", "11");
    click("Calcola n e φ(n)");
    expect(panel.getByText("φ(55) = 4 × 10 = 40")).toBeVisible();
    change("Esponente pubblico e", "10");
    expect(panel.getByText("MCD(10, 40) = 10")).toBeVisible();
    expect(panel.getByRole("button", { name: "Trova l’inverso d" })).toBeDisabled();
    change("Esponente pubblico e", "3");
    click("Trova l’inverso d");
    expect(panel.getByText("(3 × 27) mod 40 = 1")).toBeVisible();
    click("Scegli il messaggio");
    change("Messaggio m", "5");
    click("Cifra il messaggio");
    expect(panel.getByLabelText("Cifrato c")).toHaveTextContent("mod 55 = 15");
    expect(panel.queryByLabelText("Messaggio recuperato")).not.toBeInTheDocument();
    click("Decifra il messaggio");
    expect(panel.getByLabelText("Messaggio recuperato")).toHaveTextContent("m′ = 5");
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
