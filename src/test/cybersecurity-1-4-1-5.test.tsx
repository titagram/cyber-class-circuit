import { fireEvent, render, screen, within } from "@testing-library/react";
import { assert, describe, expect, it } from "vitest";
import { lessonRegistry } from "@/components/lessons/registry";

describe("Slide 1.4", () => {
  function openPortal() {
    const Lesson = lessonRegistry["cybersecurity-1-4"];
    assert(Lesson);
    render(<Lesson />);
    const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
    const notebook = within(screen.getByRole("region", { name: "Taccuino di osservazione" }));
    const map = within(screen.getByRole("figure", { name: "Mappa a cipolla del portale" }));
    function verify(index: number) {
      const option = notebook.getAllByRole("radio")[index];
      assert(option);
      fireEvent.click(option);
      click("Verifica l’ipotesi");
    }
    return { click, notebook, map, verify };
  }

  it("costruisce la mappa solo dalle verifiche e distingue pagina, lingua e PDF", () => {
    const { click, notebook, map, verify } = openPortal();
    expect(map.queryAllByRole("button")).toHaveLength(0);
    expect(notebook.getByRole("button", { name: "Verifica l’ipotesi" })).toBeDisabled();
    verify(1);
    expect(notebook.getByRole("status")).toHaveTextContent("Ipotesi smentita");
    expect(map.getAllByRole("button")).toHaveLength(1);
    click("Catalogo");
    expect(notebook.getByText("GET /documenti")).toBeVisible();
    verify(1);
    click("Lingua: English");
    expect(notebook.getByText("GET /locales/en.json")).toBeVisible();
    expect(screen.getByRole("button", { name: "Catalogue" })).toBeVisible();
    verify(0);
    click("Open PDF");
    expect(notebook.getByText(/401 Unauthorized/)).toBeVisible();
    verify(1);
    expect(map.getAllByRole("button")).toHaveLength(2);
    click("Accedi come demo");
    click("Open PDF");
    expect(notebook.getByText(/403 Forbidden/)).toBeVisible();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(notebook.getByText(/Content-Type: application.pdf/)).toBeVisible();
    verify(1);
    expect(map.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByRole("region", { name: "Inventario delle superfici" })).toHaveTextContent(
      "Storage privato",
    );
  });

  it("mostra errori uniformi e un limite temporale deterministico", () => {
    const { click, notebook, verify } = openPortal();
    const select = (value: string) =>
      fireEvent.change(screen.getByLabelText("Credenziali simulate"), { target: { value } });
    for (const value of ["unknown", "password", "unknown"]) {
      select(value);
      click("Accedi come demo");
      expect(notebook.getByText(/401 Unauthorized/)).toHaveTextContent("Credenziali non valide");
    }
    select("valid");
    click("Accedi come demo");
    expect(notebook.getByText(/429 Too Many Requests/)).toBeVisible();
    verify(1);
    click("Avanza di 60 s nel simulatore");
    click("Accedi come demo");
    expect(notebook.getByText(/Set-Cookie/)).toBeVisible();
  });

  it("segue ricerca, nuova versione, anteprima, link revocato e ripristino", () => {
    const { click, notebook, verify } = openPortal();
    click("Cerca");
    expect(notebook.getByText("GET /api/search?q=bilancio")).toBeVisible();
    verify(1);
    expect(notebook.getByRole("status")).toHaveTextContent("parametro");
    click("Accedi come demo");
    click("Carica una versione di 42.pdf");
    expect(notebook.getByText(/versione 2/)).toBeVisible();
    verify(1);
    expect(screen.getByRole("button", { name: "Genera anteprima" })).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox"));
    click("Genera anteprima");
    expect(notebook.getByText(/image.png/)).toBeVisible();
    click("Crea link condiviso");
    click("Apri link come collega");
    expect(notebook.getByText(/200 OK/)).toBeVisible();
    click("Revoca il link");
    click("Apri link come collega");
    expect(notebook.getByText(/410 Gone/)).toBeVisible();
    click("Ripristina v1 come operatore demo");
    expect(notebook.getByText(/ripristinata: 1/)).toBeVisible();
    click("Apri PDF");
    expect(notebook.getByText(/versione 1/)).toBeVisible();
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
