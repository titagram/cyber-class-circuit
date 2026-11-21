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

  it("presenta una sola verifica finale sul link valido e consente la correzione", () => {
    const { click, map } = open();
    click("3 · Altri attori esterni");
    click("Vai alla verifica finale");
    expect(map).toBeVisible();
    const check = within(screen.getByRole("region", { name: "Verifica finale" }));
    const submit = check.getByRole("button", { name: "Verifica lo scambio" });
    expect(submit).toBeDisabled();
    const fields = check.getAllByRole("combobox");
    const actor = check.getByLabelText("Chi agisce");
    [
      "Giulia",
      "Il token nel link",
      "Il gestore delle condivisioni",
      "Il collega riceve una copia",
    ].forEach((value, i) => {
      const field = fields[i];
      assert(field);
      fireEvent.change(field, { target: { value } });
    });
    fireEvent.click(submit);
    expect(check.getByRole("status")).toHaveTextContent("3/4");
    fireEvent.change(actor, { target: { value: "Il collega" } });
    fireEvent.click(submit);
    expect(check.getByRole("status")).toHaveTextContent("4/4");
  });
});

describe("Slide 1.5", () => {
  it("rende il contenuto leggibile solo sul tratto HTTP o all’endpoint TLS", () => {
    const Lesson = lessonRegistry["cybersecurity-1-5"];
    assert(Lesson, "La lezione deve essere registrata");
    render(<Lesson />);

    const observation = screen.getByRole("region", { name: "Osservazione del traffico" });
    const diagram = within(
      screen.getByRole("figure", { name: "Percorso della richiesta del file 42.pdf" }),
    );
    const externalLink = diagram.getByTestId("data-flow-connection-browser-proxy");
    const internalLink = diagram.getByTestId("data-flow-connection-proxy-backend");

    expect(externalLink).toHaveAttribute("data-protocol", "HTTPS");
    expect(within(externalLink).getByTestId("traffic-observer")).toBeVisible();
    expect(internalLink).toHaveAttribute("data-protocol", "HTTP");
    expect(within(observation).queryByText(/GET \/api\/documents\/42/)).not.toBeInTheDocument();
    expect(within(observation).getByText(/indirizzi IP/)).toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "Proxy → Backend" }));
    expect(internalLink).toHaveAttribute("data-highlighted", "true");
    expect(within(internalLink).getByTestId("traffic-observer")).toBeVisible();
    expect(within(observation).getByText(/GET \/api\/documents\/42/)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "HTTPS" }));
    expect(internalLink).toHaveAttribute("data-protocol", "HTTPS");
    expect(internalLink).toHaveTextContent("Cifrato TLS");
    expect(externalLink).toHaveAttribute("data-protocol", "HTTPS");
    expect(within(observation).queryByText(/GET \/api\/documents\/42/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "All’endpoint TLS" }));
    expect(within(internalLink).queryByTestId("traffic-observer")).not.toBeInTheDocument();
    const backend = diagram.getByTestId("data-flow-node-backend");
    expect(within(backend).getByTestId("traffic-observer")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "HTTPS" }));
    expect(within(backend).getByTestId("traffic-observer")).toBeVisible();
    expect(within(observation).getByText(/GET \/api\/documents\/42/)).toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "Browser → Reverse proxy" }));
    expect(within(observation).queryByText(/GET \/api\/documents\/42/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Proxy → Backend" }));
    expect(screen.getByRole("button", { name: "HTTPS" })).toHaveAttribute("aria-pressed", "true");
  });
});
