import { describe, expect, it } from "vitest";
import { canAccessAuthenticatedPath } from "@/lib/access";

describe("Accesso studente", () => {
  it("consente allo studente soltanto l'area studente e i capitoli", () => {
    expect(canAccessAuthenticatedPath("/area-studente", false)).toBe(true);
    expect(canAccessAuthenticatedPath("/capitoli/10000000-0000-4000-8000-000000000102", false)).toBe(true);
    expect(canAccessAuthenticatedPath("/classi", false)).toBe(false);
    expect(canAccessAuthenticatedPath("/studenti", false)).toBe(false);
    expect(canAccessAuthenticatedPath("/corsi", false)).toBe(false);
  });

  it("mantiene l'accesso amministratore alle pagine di gestione", () => {
    expect(canAccessAuthenticatedPath("/classi", true)).toBe(true);
    expect(canAccessAuthenticatedPath("/studenti", true)).toBe(true);
    expect(canAccessAuthenticatedPath("/corsi", true)).toBe(true);
  });
});
