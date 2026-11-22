import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { assert, describe, expect, it, vi } from "vitest";
import { lessonRegistry } from "@/components/lessons/registry";

describe("Slide 1.4", () => {
  function open() {
    const Lesson = lessonRegistry["cybersecurity-1-4"];
    assert(Lesson);
    render(<Lesson />);
    const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
    const trace = screen.getByRole("region", { name: "Ultimo scambio" });
    const map = screen.getByRole("figure", { name: "Mappa a cipolla del portale" });
    return { click, trace, map };
  }

  it("rivela subito attore, richiesta, risposta ed effetto per ogni ingresso pubblico", () => {
    const { click, trace, map } = open();
    for (const label of ["Chi agisce", "Cosa invia", "Chi risponde", "Cosa cambia"])
      expect(within(trace).getByText(label)).toBeVisible();
    expect(trace).toHaveTextContent("GET /");
    for (const [action, request, response] of [
      ["Apri il catalogo", "GET /documenti", "text/html"],
      ["Cambia lingua", "GET /locales/en.json", "Download"],
      ["Cambia lingua", "GET /locales/it.json", "Scarica"],
      ["Cerca nel catalogo", "GET /api/search?q=42.pdf", "nome e ID"],
      ["Scarica senza sessione", "GET /api/documents/42", "401 Unauthorized"],
    ] as const) {
      click(action);
      expect(trace).toHaveTextContent(request);
      expect(trace).toHaveTextContent(response);
    }
    fireEvent.change(screen.getByLabelText("Termine da cercare"), { target: { value: "x & y" } });
    click("Cerca nel catalogo");
    expect(trace).toHaveTextContent("q=x%20%26%20y");
    expect(trace).toHaveTextContent("elenco vuoto");
    expect(map).toHaveTextContent("Ingressi osservati (5)");
    expect(screen.queryByRole("region", { name: "Verifica finale" })).toBeNull();
  });

  it("mostra l’effetto del login, dei permessi e della stessa lettura via API", () => {
    const { click, trace, map } = open();
    fireEvent.change(screen.getByLabelText("Credenziali simulate"), {
      target: { value: "invalid" },
    });
    for (let i = 0; i < 3; i++) click("Accedi come Giulia");
    click("Accedi come Giulia");
    expect(trace).toHaveTextContent("429 Too Many Requests");
    click("Avanza di 60 s");
    fireEvent.change(screen.getByLabelText("Credenziali simulate"), { target: { value: "valid" } });
    click("Accedi come Giulia");
    expect(trace).toHaveTextContent("Set-Cookie");
    click("2 · Giulia con sessione");
    expect(trace).toHaveTextContent("403 Forbidden");
    fireEvent.click(screen.getByLabelText("Permesso di lettura su 42.pdf"));
    expect(trace).toHaveTextContent("200 OK · application/pdf");
    expect(map).toHaveTextContent("Metadati e storage");
    click("3 · Altri attori esterni");
    click("Scarica tramite API");
    expect(trace).toHaveTextContent("GET /api/documents/42");
    expect(trace).toHaveTextContent("Bearer api-demo");
    expect(trace).toHaveTextContent("Programma esterno autorizzato");
    expect(map).toHaveTextContent("Ingressi osservati (4)");
  });

  it("anima il download e distingue il modulo che decide dal servizio consultato", () => {
    vi.useFakeTimers();
    try {
      const { click, map } = open();
      const next = () => click("Passaggio successivo");
      const caption = () => within(map).getByText(/^[0-9]+\/[0-9]+ ·/).parentElement!;
      click("Scarica senza sessione");
      expect(caption()).toHaveTextContent("Esterno · Richiesta");
      act(() => vi.advanceTimersByTime(2600));
      expect(caption()).toHaveTextContent("Reverse proxy");
      next();
      expect(caption()).toHaveTextContent("Anello 2 · Download fermatoGestore di sessione");
      expect(caption()).toHaveTextContent("401 Unauthorized");
      act(() => vi.advanceTimersByTime(6000));
      expect(caption()).toHaveTextContent("Gestore di sessione");
      next();
      next();
      expect(caption()).toHaveTextContent("Esterno · RispostaBrowser di Giulia");
      click("Rivedi");
      expect(caption()).toHaveTextContent("1/5");
      click("Riprova con sessione, senza permesso");
      next();
      next();
      next();
      expect(caption()).toHaveTextContent("Anello 3 · RichiestaDatabase dei metadati");
      next();
      expect(caption()).toHaveTextContent("Anello 2 · Download fermatoModulo di autorizzazione");
      expect(caption()).toHaveTextContent("403 Forbidden");
      click("Concedi la lettura e riprova");
      next();
      next();
      next();
      next();
      expect(caption()).toHaveTextContent("Anello 2 · Lettura consentita");
      next();
      expect(caption()).toHaveTextContent("Anello 3 · RichiestaStorage privato");
      next();
      next();
      next();
      expect(caption()).toHaveTextContent("200 OK · application/pdf");
      expect(caption()).toHaveTextContent("Autorizzata all’anello 2");
      expect(screen.getByRole("button", { name: "Passaggio successivo" })).toBeDisabled();
      click("Passaggio precedente");
      expect(caption()).toHaveTextContent("Reverse proxy");
      click("Scarica 42.pdf");
      expect(caption()).toHaveTextContent("1/9");
    } finally {
      vi.useRealTimers();
    }
  });

  it("segue lo stesso link dal registro al download e localizza il diniego dopo la revoca", () => {
    const { click, trace, map } = open();
    function journey() {
      const caption = () => within(map).getByText(/^[0-9]+\/[0-9]+ ·/).parentElement!.textContent!;
      const steps = [caption()];
      const advance = within(map).getByRole("button", { name: "Passaggio successivo" });
      while (!advance.hasAttribute("disabled") && steps.length < 20) {
        fireEvent.click(advance);
        steps.push(caption());
      }
      expect(advance).toBeDisabled();
      return steps.join("\n");
    }
    click("2 · Giulia con sessione");
    click("Crea un link");
    const created = journey();
    expect(created).toContain("Registro dei linkRegistra il token di /s/demo-2");
    expect(created).toContain("201 Created");
    click("Il collega apre il link");
    const request = within(trace).getByText(/GET \/s\/demo-2/).textContent;
    const downloaded = journey();
    expect(downloaded).toMatch(/Anello 3 · RichiestaRegistro dei link.*stato attivo/);
    expect(downloaded).toContain("Anello 2 · Lettura consentitaGestore delle condivisioni");
    expect(downloaded).toContain("Anello 3 · RichiestaStorage privato");
    expect(downloaded).toContain("200 OK · application/pdf · versione 1");
    click("Giulia revoca questo link");
    const revoked = journey();
    expect(revoked).toContain("Cambia lo stato di /s/demo-2 da attivo a revocato");
    expect(revoked).toContain("204 No Content");
    click("Il collega riprova con lo stesso link");
    expect(within(trace).getByText(/GET \/s\/demo-2/).textContent).toBe(request);
    const refused = journey();
    expect(refused).toMatch(/Anello 3 · RichiestaRegistro dei link.*revocato/);
    expect(refused).toContain("Anello 2 · Download fermatoGestore delle condivisioni");
    expect(refused).not.toContain("RichiestaStorage privato");
    expect(refused).toContain("410 Gone");
    expect(refused).toContain("Fermata all’anello 2 · Gestore delle condivisioni");
    expect(map.querySelector('.portal-decision-pin[data-phase="stop"]')).toBeVisible();
  });

  it("propaga versione e revoca fra scene senza far ripartire il portale", () => {
    const { click, trace } = open();
    click("2 · Giulia con sessione");
    click("Carica una nuova versione");
    expect(trace).toHaveTextContent("v1 a v2");
    click("Genera anteprima");
    expect(trace).toHaveTextContent("403 Forbidden");
    fireEvent.click(screen.getByRole("checkbox"));
    click("Genera anteprima");
    expect(trace).toHaveTextContent("image/png");
    click("Crea un link");
    expect(trace).toHaveTextContent("/s/demo-2");
    click("3 · Altri attori esterni");
    expect(trace).toHaveTextContent("GET /s/demo-2");
    expect(trace).toHaveTextContent("application/pdf · versione 2");
    click("Ripristina dal backup");
    expect(trace).toHaveTextContent("sostituisce v2");
    click("2 · Giulia con sessione");
    expect(trace).toHaveTextContent("application/pdf · versione 1");
    click("Revoca il link");
    click("3 · Altri attori esterni");
    expect(trace).toHaveTextContent("410 Gone");
  });

  it("collega gli ingressi osservati alle verifiche nel codice", () => {
    const { click, map } = open();
    click("3 · Altri attori esterni");
    click("Vai alla verifica finale");
    const review = within(screen.getByRole("region", { name: "Verifica finale" }));
    expect(review.getByText(/Controllare token, stato e operazione/)).toBeVisible();
    expect(review.getByText(/GET \/s\/demo-1/)).toBeVisible();
    expect(map).toBeVisible();
  });
});

describe("Slide 1.5", () => {
  it("distingue richiesta revocata, copia già salvata e visibilità degli altri soggetti", () => {
    const Lesson = lessonRegistry["cybersecurity-1-5"];
    assert(Lesson);
    render(<Lesson />);
    const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
    const card = within(screen.getByRole("region", { name: "Evidenza sul file" }));
    expect(card.getByText(/200 OK/, { selector: "code" })).toBeVisible();
    click("Dopo la revoca");
    expect(card.getByText(/410 Gone/, { selector: "code" })).toBeVisible();
    expect(card.getByRole("list")).toHaveTextContent("Gestore link · diniego");
    for (const [name, artifact] of [
      ["Download sul dispositivo", "Richieste al portale: 0"],
      ["Proxy e servizio file", "Byte PDF inoltrati: 0"],
      ["Storage e backup", "copia della versione 1"],
      ["Anteprima", "image/png"],
      ["Database, cache e log", "status=410"],
    ] as const) {
      click(name);
      expect(card.getByText(artifact, { exact: false, selector: "code" })).toBeVisible();
    }
    click("Prima della revoca");
    expect(card.getByText(/status=200/, { selector: "code" })).toBeVisible();
  });
});
