import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IntegrityLab } from "@/components/lessons/chapter2/IntegrityLab";
import { integrityCases } from "@/content/lessons/chapter2-symmetric";

function click(name: string) {
  fireEvent.click(screen.getByRole("button", { name }));
}

function compareChangedAmount() {
  click("Passa alla ricezione");
  click("Cambia importo");
  click("Calcola l’impronta della copia");
  click("Confronta le impronte");
}

describe("Laboratorio SHA-256 e HMAC", () => {
  it("collega il carattere al byte di ingresso e alla differenza nell’impronta", () => {
    render(<IntegrityLab />);
    click("Posizione 26, carattere 1, esadecimale 31");
    expect(screen.getByLabelText("Byte UTF-8 selezionato")).toHaveTextContent("00110001");

    click("Calcola l’impronta originale");
    const block = screen.getByRole("region", { name: "Blocco SHA-256 da 512 bit" });
    const hex = (kind: string) =>
      [...block.querySelectorAll(`[data-sha-byte-kind="${kind}"]`)]
        .map((byte) => byte.textContent)
        .join("");
    expect(hex("message")).toHaveLength(94);
    expect(hex("padding")).toBe("800000000000000000");
    expect(hex("length")).toBe("0000000000000178");

    click("Passa alla ricezione");
    click("Cambia importo");
    const changed = screen.getByRole("group", { name: "Primo byte diverso" });
    expect(changed).toHaveTextContent("Byte 26");
    expect(changed).toHaveTextContent("0x31");
    expect(changed).toHaveTextContent("0x39");
    expect(changed).toHaveTextContent("1 bit diverso");
    click("Calcola l’impronta della copia");
    click("Confronta le impronte");
    expect(screen.getByRole("status")).toHaveTextContent("134 / 256 bit diversi");
  });

  it("mostra i due hash HMAC e usa il tag del mittente con una copia modificata", () => {
    render(<IntegrityLab />);
    click("Calcola l’impronta originale");
    compareChangedAmount();
    click("Ripeti con HMAC");
    click("Genera il tag del mittente");

    const passes = screen.getByRole("list", { name: "Passaggi HMAC-SHA-256" });
    const [inner, outer] = within(passes).getAllByRole("listitem");
    expect(inner).toHaveTextContent("Hash interno");
    expect(outer).toHaveTextContent("Hash esterno");

    click("Passa alla ricezione");
    click("Cambia importo");
    expect(screen.getByText(integrityCases[0].hmac)).toBeVisible();
    click("Ricalcola il tag sulla copia");
    expect(screen.getByText(integrityCases[1].hmac)).toBeVisible();
    click("Verifica il tag ricevuto");
    expect(screen.getByRole("status")).toHaveTextContent("Tag non valido");
    expect(screen.getByRole("status")).toHaveTextContent("119 / 256 bit diversi");
  });
});
