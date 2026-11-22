import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RequestArchitecture } from "@/components/lessons/RequestArchitecture";
import { RequestResponseLesson } from "@/components/lessons/RequestResponseLesson";
import { buildRequestTrace, requestLesson } from "@/content/lessons/request-response";
import { documentRequest, documentResponse } from "@/content/lessons/cybersecurity-1-3";
import { readRequest } from "@/content/lessons/cybersecurity-1-4";
import { getCourseChapters, getRequestParentId } from "@/lib/chapters";

describe("Request e response", () => {
  it("inserisce il capitolo dopo la 1.4 realmente assegnata, anche se il corso cambia", () => {
    const parent = {
      id: "slide-14",
      title: "1.4",
      position: 4,
      content: { lesson: "cybersecurity-1-4" },
    };
    const other = {
      id: "slide-15",
      title: "1.5",
      position: 5,
      content: { lesson: "cybersecurity-1-5" },
    };
    const rows = getCourseChapters("web", [other, parent]);
    expect(rows.map((r) => r.content)).toEqual([
      parent.content,
      { lesson: requestLesson.key },
      other.content,
    ]);
    expect(getRequestParentId(rows[1]?.id ?? "")).toBe(parent.id);
    expect(getCourseChapters("web", [other])).toEqual([other]);
    const stored = { ...other, id: "stored", position: 8, content: { lesson: requestLesson.key } };
    expect(getCourseChapters("web", [stored, other, parent])).toEqual([parent, stored, other]);
  });
  it("segue la stessa risorsa nel download e nella visualizzazione", () => {
    const trace = buildRequestTrace(false, true);
    expect(trace.some((step) => step.input === documentRequest)).toBe(true);
    expect(readRequest).toBe("GET /api/documents/42");
    expect(documentResponse).toContain("attachment; filename=42.pdf");
    expect(trace.some((step) => step.output.includes("inline; filename=42.pdf"))).toBe(true);
  });

  it("varia solo i tratti dipendenti da cache e permesso", () => {
    const normal = buildRequestTrace(false, true);
    const denied = buildRequestTrace(false, false);
    const decision = denied.findIndex((s) => s.to === "Autorizzazione");
    expect(denied.slice(0, decision)).toEqual(normal.slice(0, decision));
    expect(denied.some((s) => s.to === "Storage" || s.to === "Client storage")).toBe(false);
    expect(normal.at(-1)?.output).toContain("pagina 1");
    expect(denied.at(-1)?.output).toContain("403");
    expect(
      buildRequestTrace(true, true).some(
        (s) => s.from === "Resolver DNS" || s.to === "Resolver DNS",
      ),
    ).toBe(false);
  });
  it("mantiene i ruoli HTTP alla risposta e termina con la lettura di Giulia", () => {
    for (const allowed of [true, false]) {
      const trace = buildRequestTrace(false, allowed);
      const http = trace
        .filter((s) => s.phase === 2 && s.channel === "rete")
        .map((s) => [s.from, s.to]);
      expect(http).toEqual([
        ["Server HTTP", "Reverse proxy"],
        ["Reverse proxy", "Browser"],
        ["Server HTTP", "Reverse proxy"],
        ["Reverse proxy", "Browser"],
      ]);
      expect(trace.slice(-2).map((s) => [s.from, s.to, s.channel])).toEqual([
        ["Browser", "Schermo", "elaborazione locale"],
        ["Schermo", "Giulia", "interazione umana"],
      ]);
      expect(trace.find((s) => s.from === "Controller" && s.phase === 2)).toMatchObject({
        to: "Server HTTP",
        channel: "chiamata interna",
      });
    }
  });
  it("mantiene la mappa e orienta ogni scambio anche al ritorno", () => {
    const { rerender } = render(<RequestArchitecture step={buildRequestTrace(false, true)[0]} />);
    const map = screen.getByRole("figure", { name: "Architettura della richiesta" });
    for (const cached of [false, true]) {
      for (const allowed of [false, true]) {
        let entered = false;
        for (const step of buildRequestTrace(cached, allowed)) {
          if (step.to === "Server HTTP") entered = true;
          rerender(<RequestArchitecture step={step} />);
          expect(map).toHaveAttribute("data-expanded", String(entered));
          expect(map.querySelector('[data-role="source"]')).toHaveTextContent(step.from);
          expect(map.querySelector('[data-role="destination"]')).toHaveTextContent(step.to);
          expect(map.querySelector(".request-transfer path")?.getAttribute("d")).toMatch(/^M.+L/);
          expect(map.querySelector("figcaption code")?.textContent).toBe(step.payload);
          for (const node of ["Browser", "Reverse proxy", "Database", "Storage", "Resolver DNS"])
            expect(map.querySelector("svg")).toHaveTextContent(node);
        }
      }
    }
  });
  it("riproduce, ferma e salta al confronto dei permessi", () => {
    vi.useFakeTimers();
    try {
      render(<RequestResponseLesson />);
      fireEvent.click(screen.getByRole("button", { name: "Riproduci" }));
      act(() => vi.advanceTimersByTime(5500));
      expect(screen.getByText("Il resolver cerca un indirizzo", { selector: "h3" })).toBeVisible();
      fireEvent.click(screen.getByRole("button", { name: "Pausa" }));
      act(() => vi.advanceTimersByTime(5500));
      expect(screen.getByText("Il resolver cerca un indirizzo", { selector: "h3" })).toBeVisible();
      fireEvent.click(screen.getByLabelText("Indirizzo DNS già in cache"));
      fireEvent.click(screen.getByRole("button", { name: "Avanti" }));
      expect(screen.getByText("L’indirizzo è già disponibile", { selector: "h3" })).toBeVisible();
      fireEvent.click(screen.getByRole("button", { name: "Segui il caso negato" }));
      expect(screen.getByText("Decisione: lettura negata", { selector: "pre" })).toBeVisible();
      fireEvent.click(screen.getByRole("button", { name: "Avanti" }));
      expect(screen.getByRole("heading", { name: "La decisione torna al servizio" })).toBeVisible();
      fireEvent.click(screen.getByRole("button", { name: "Avanti" }));
      expect(
        screen.getByRole("heading", { name: "Il servizio interrompe la lettura" }),
      ).toBeVisible();
    } finally {
      vi.useRealTimers();
    }
  });
});
