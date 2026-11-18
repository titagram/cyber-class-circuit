import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  KeyLifecycleLab,
  SignatureLab,
  TlsHandshakeLab,
} from "@/components/lessons/chapter2/TrustAndLifecycleLabs";

describe("Simulazioni di fiducia e ciclo di vita", () => {
  it("separa la validità della firma dall'identità del firmatario", () => {
    render(<SignatureLab />);
    const signature = within(screen.getByRole("region", { name: "Verifica della firma" }));

    expect(signature.getByText("Firma valida")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Importo modificato" }));
    expect(signature.getByText("Firma non valida")).toBeVisible();
    expect(screen.getByText("Identità del certificato confermata")).toBeVisible();

    fireEvent.change(screen.getByLabelText("Firmatario"), { target: { value: "beta" } });
    fireEvent.click(screen.getByRole("button", { name: "Firma versione corrente" }));
    expect(signature.getByText("Firma non valida")).toBeVisible();
    fireEvent.change(screen.getByLabelText("Chiave pubblica di verifica"), {
      target: { value: "beta" },
    });
    expect(signature.getByText("Firma valida")).toBeVisible();
    expect(screen.getByText("Firmatario atteso diverso")).toBeVisible();

    fireEvent.change(screen.getByLabelText("Certificato presentato"), {
      target: { value: "unknown-ca" },
    });
    expect(signature.getByText("Firma valida")).toBeVisible();
    expect(screen.getByText("Autorità non riconosciuta")).toBeVisible();
    fireEvent.change(screen.getByLabelText("Certificato presentato"), {
      target: { value: "expired" },
    });
    expect(screen.getByText("Certificato scaduto")).toBeVisible();
  });

  it("blocca il traffico dopo un errore di nome e tiene distinte le due sessioni", () => {
    render(<TlsHandshakeLab />);
    const button = (name: string) => screen.getByRole("button", { name });

    fireEvent.click(button("Nome diverso"));
    expect(screen.getByText("Handshake interrotto")).toBeVisible();
    expect(button("Dati applicativi")).toBeDisabled();

    fireEvent.click(button("Proxy → Backend"));
    expect(button("Dati applicativi")).toBeEnabled();
    fireEvent.click(button("Dati applicativi"));
    expect(screen.getByText(/attende il tratto Browser/)).toBeVisible();
    expect(screen.queryByText(/GET \/api\/documents\/42/)).not.toBeInTheDocument();

    fireEvent.click(button("Browser → Reverse proxy"));
    fireEvent.click(button("Nome corretto"));
    fireEvent.click(button("Finished e chiavi"));
    fireEvent.click(button("Proxy → Backend"));
    expect(screen.queryByText(/GET \/api\/documents\/42/)).not.toBeInTheDocument();

    fireEvent.click(button("Browser → Reverse proxy"));
    fireEvent.click(button("Dati applicativi"));
    fireEvent.click(button("Proxy → Backend"));
    expect(screen.getByText(/GET \/api\/documents\/42/)).toBeVisible();
    expect(screen.getByText(/chiavi A/)).toBeVisible();
    expect(screen.getByText(/chiavi B/)).toBeVisible();

    fireEvent.click(button("Browser → Reverse proxy"));
    fireEvent.click(button("Nome diverso"));
    expect(button("Finished e chiavi")).toBeDisabled();
    expect(screen.queryByText(/GET \/api\/documents\/42/)).not.toBeInTheDocument();
  });

  it("mantiene la chiave storica nel backup e applica l'accesso al KMS", () => {
    render(<KeyLifecycleLab />);
    const button = (name: string) => screen.getByRole("button", { name });
    const storage = within(screen.getByRole("region", { name: "Object storage" }));
    const backup = within(screen.getByRole("region", { name: "Backup storico" }));

    fireEvent.click(button("Ruota la KEK"));
    expect(storage.getByText("DEK-A cifrata con KEK v1")).toBeVisible();
    fireEvent.click(button("Ricifra la DEK dello storage"));
    expect(storage.getByText("DEK-A cifrata con KEK v2")).toBeVisible();
    expect(storage.getByText(/CT-42A/)).toBeVisible();
    expect(backup.getByText("DEK-A cifrata con KEK v1")).toBeVisible();

    fireEvent.click(button("Disattiva KEK v1"));
    fireEvent.click(button("Recupera dallo storage"));
    expect(screen.getByText("Storage · Contratto recuperato")).toBeVisible();
    fireEvent.click(button("Recupera dal backup"));
    expect(screen.getByText("Backup · KEK v1 disattivata")).toBeVisible();
    fireEvent.click(button("Riattiva KEK v1"));
    fireEvent.click(button("Recupera dal backup"));
    expect(screen.getByText("Backup · Contratto recuperato")).toBeVisible();

    fireEvent.click(button("Revoca accesso al KMS"));
    fireEvent.click(button("Recupera dallo storage"));
    expect(screen.getByText("Storage · Accesso al KMS negato")).toBeVisible();
    expect(button("Cifra il file con una nuova DEK")).toBeDisabled();
    fireEvent.click(button("Ripristina accesso al KMS"));
    fireEvent.click(button("Cifra il file con una nuova DEK"));
    expect(storage.getByText("DEK-B cifrata con KEK v2")).toBeVisible();
    expect(storage.getByText(/CT-42B/)).toBeVisible();
    expect(backup.getByText(/CT-42A/)).toBeVisible();
  });
});
