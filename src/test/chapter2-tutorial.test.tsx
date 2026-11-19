import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthenticatedEncryptionLab } from "@/components/lessons/chapter2/AuthenticatedEncryptionLab";
import { IntegrityLab } from "@/components/lessons/chapter2/IntegrityLab";

const button = (name: string) => screen.getByRole("button", { name });
const click = (name: string) => fireEvent.click(button(name));

describe("Tutorial di cifratura e integrità", () => {
  it("segue la busta fino al controllo e consegna il contratto solo dopo un esito positivo", () => {
    render(<AuthenticatedEncryptionLab />);
    expect(
      screen.getByRole("heading", { name: "Il browser prepara il contratto 42" }),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Verifica sul server" })).not.toBeInTheDocument();

    click("Cifra il contratto");
    expect(screen.getByRole("button", { name: "Blocco 1 · 16 byte" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByLabelText("Primo byte in esadecimale")).toHaveTextContent("43 ⊕ 8d = ce");
    click("Blocco 2 · 16 byte");
    expect(screen.getByLabelText("Primo byte in esadecimale")).toHaveTextContent("6f ⊕ 83 = ec");
    click("Invia la busta");
    click("AAD del tenant errato");
    click("Passa al controllo del tag");
    expect(screen.queryByLabelText("Testo in chiaro restituito")).not.toBeInTheDocument();
    click("Verifica sul server");
    expect(screen.getByText("Rifiutato", { exact: true })).toBeVisible();
    expect(screen.getByText("Tag ricevuto", { exact: true })).toBeVisible();
    expect(screen.getByText("Tag atteso", { exact: true })).toBeVisible();
    expect(screen.getByText("I due tag sono diversi.")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Esito per il contratto 42" })).toHaveFocus();
    expect(screen.queryByLabelText("Testo in chiaro restituito")).not.toBeInTheDocument();

    click("Prova un altro caso");
    click("Messaggio originale");
    click("Passa al controllo del tag");
    click("Verifica sul server");
    expect(screen.getByText("I due tag coincidono.")).toBeVisible();
    expect(screen.getByLabelText("Testo in chiaro restituito")).toBeVisible();
  });

  it("chiede una copia prima del ricalcolo e riparte dall’originale passando a HMAC", () => {
    render(<IntegrityLab />);
    expect(screen.queryByRole("button", { name: /^Byte 1,/ })).not.toBeInTheDocument();

    click("Calcola l’impronta originale");
    click("Passa alla ricezione");
    expect(button("Calcola l’impronta della copia")).toBeDisabled();
    click("Cambia importo");
    click("Calcola l’impronta della copia");
    expect(screen.queryByRole("button", { name: /^Byte 1,/ })).not.toBeInTheDocument();
    click("Confronta le impronte");
    expect(screen.getByRole("button", { name: /^Byte 1,/ })).toBeVisible();
    expect(screen.getByText("Impronte diverse", { exact: true })).toBeVisible();

    click("Ripeti con HMAC");
    expect(
      screen.getByRole("heading", {
        name: "Riparti dallo stesso contratto con una chiave condivisa",
      }),
    ).toHaveFocus();
    expect(screen.queryByRole("button", { name: /^Byte 1,/ })).not.toBeInTheDocument();
    click("Genera il tag del mittente");
    click("Passa alla ricezione");
    expect(button("Ricalcola il tag sulla copia")).toBeDisabled();
  });
});
