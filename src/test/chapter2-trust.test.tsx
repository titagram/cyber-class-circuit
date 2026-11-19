import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  KeyLifecycleLab,
  SignatureLab,
  TlsHandshakeLab,
} from "@/components/lessons/chapter2/TrustAndLifecycleLabs";

const button = (name: string) => screen.getByRole("button", { name });
const click = (name: string) => fireEvent.click(button(name));
const select = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("Tutorial di firma, TLS e ciclo di vita delle chiavi", () => {
  it("rifiuta un contratto modificato anche con un certificato attendibile", () => {
    render(<SignatureLab />);
    expect(screen.queryByText("Firma valida", { exact: true })).not.toBeInTheDocument();
    click("Firma il contratto");
    click("Importo modificato");
    click("Verifica la firma");
    expect(screen.getByText("Firma non valida", { exact: true })).toBeVisible();
    click("Verifica il certificato");
    expect(screen.getByText("Identità del certificato confermata")).toBeVisible();
    click("Valuta l’approvazione");
    expect(screen.getByText("Approvazione respinta")).toBeVisible();
    expect(screen.getByText(/Il documento è cambiato dopo la firma/)).toBeVisible();
  });

  it("richiede un’identità attesa e un permesso applicativo anche con una firma valida", () => {
    render(<SignatureLab />);

    select("Firmatario", "beta");
    click("Firma il contratto");
    click("Verifica la firma");
    expect(screen.getByText("Firma valida", { exact: true })).toBeVisible();
    click("Verifica il certificato");
    expect(screen.getByText("Firmatario atteso diverso")).toBeVisible();
    click("Valuta l’approvazione");
    expect(screen.getByText("Approvazione respinta")).toBeVisible();

    click("Prova un altro caso");
    click("Firma il contratto");
    click("Verifica la firma");
    click("Verifica il certificato");
    click("Revoca il permesso");
    click("Valuta l’approvazione");
    expect(screen.getByText("Approvazione respinta")).toBeVisible();

    click("Passo precedente");
    click("Concedi il permesso");
    click("Valuta l’approvazione");
    expect(screen.getByText("Approvazione accettata")).toBeVisible();
  });

  it("blocca la richiesta se il nome del certificato è diverso e ripete la verifica", () => {
    render(<TlsHandshakeLab />);
    expect(screen.queryByRole("button", { name: "Apri la sessione B" })).not.toBeInTheDocument();

    click("Scambia i valori effimeri");
    click("Nome diverso");
    click("Verifica il certificato");
    expect(screen.getByText("Handshake interrotto")).toBeVisible();
    expect(button("Scambia i Finished")).toBeDisabled();
    expect(screen.queryByRole("region", { name: "Richiesta ricevuta" })).not.toBeInTheDocument();

    click("Prova un altro nome");
    click("Scambia i valori effimeri");
    click("Nome corretto");
    click("Verifica il certificato");
    click("Scambia i Finished");
    expect(screen.getByText("Finished del server")).toBeVisible();
    expect(screen.getByText("Finished del client")).toBeVisible();
    expect(screen.queryByRole("region", { name: "Richiesta ricevuta" })).not.toBeInTheDocument();
  });

  it("consegna la GET prima al proxy, poi al backend con chiavi indipendenti", () => {
    render(<TlsHandshakeLab />);
    const handshake = () => {
      click("Scambia i valori effimeri");
      click("Verifica il certificato");
      click("Scambia i Finished");
    };
    handshake();
    click("Invia la richiesta sul tratto A");
    expect(
      within(screen.getByRole("region", { name: "Richiesta ricevuta" })).getByText(/proxy/i),
    ).toBeVisible();
    click("Apri la sessione B");
    expect(screen.queryByRole("region", { name: "Richiesta ricevuta" })).not.toBeInTheDocument();
    handshake();
    click("Inoltra la richiesta sul tratto B");
    const received = within(screen.getByRole("region", { name: "Richiesta ricevuta" }));
    expect(received.getByText(/backend/i)).toBeVisible();
    expect(received.getByText("GET /api/documents/42")).toBeVisible();
    expect(screen.getByText("Chiavi A")).toBeVisible();
    expect(screen.getByText("Chiavi B")).toBeVisible();
  });

  it("mantiene la versione della KEK nel backup dopo il rewrap e verifica i due ripristini", () => {
    render(<KeyLifecycleLab />);
    expect(screen.queryByRole("button", { name: "Recupera dal backup" })).not.toBeInTheDocument();
    click("Archivia le copie");
    click("Ruota la KEK");
    expect(button("Prepara il ripristino")).toBeDisabled();
    click("Ricifra la DEK dello storage");
    const storage = within(screen.getByRole("region", { name: "Object storage" }));
    const backup = within(screen.getByRole("region", { name: "Backup storico" }));
    expect(storage.getByText("DEK-A cifrata con KEK v2")).toBeVisible();
    expect(storage.getByText("CT-42A")).toBeVisible();
    expect(backup.getByText("DEK-A cifrata con KEK v1")).toBeVisible();

    click("Prepara il ripristino");
    click("Disattiva KEK v1");
    click("Apri la prova di ripristino");
    click("Recupera dallo storage");
    expect(screen.getByText("Storage · Contratto recuperato")).toBeVisible();
    click("Recupera dal backup");
    expect(screen.getByText("Backup · KEK v1 disattivata")).toBeVisible();

    click("Cambia le condizioni");
    click("Riattiva KEK v1");
    click("Apri la prova di ripristino");
    click("Recupera dal backup");
    expect(screen.getByText("Backup · Contratto recuperato")).toBeVisible();
  });

  it("mostra il cambio della DEK e blocca il ripristino senza permesso KMS", () => {
    render(<KeyLifecycleLab />);
    click("Archivia le copie");
    click("Ruota la KEK");
    click("Cifra il file con una nuova DEK");
    const storage = within(screen.getByRole("region", { name: "Object storage" }));
    const backup = within(screen.getByRole("region", { name: "Backup storico" }));
    expect(storage.getByText("DEK-B cifrata con KEK v2")).toBeVisible();
    expect(storage.getByText("CT-42B")).toBeVisible();
    expect(backup.getByText("CT-42A")).toBeVisible();

    click("Prepara il ripristino");
    click("Revoca accesso al KMS");
    click("Apri la prova di ripristino");
    click("Recupera dallo storage");
    expect(screen.getByText("Storage · Accesso al KMS negato")).toBeVisible();
    const recoveryPath = within(screen.getByRole("list", { name: "Percorso di recupero" }));
    expect(recoveryPath.getByText("Permesso negato")).toBeVisible();
    expect(recoveryPath.getByText("KEK v2 non raggiunta")).toBeVisible();
  });
});
