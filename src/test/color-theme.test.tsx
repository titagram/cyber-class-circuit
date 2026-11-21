import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ColorThemeProvider, useColorTheme } from "@/hooks/useColorTheme";

function ThemeHarness() {
  const { theme } = useColorTheme();
  return (
    <>
      <output data-testid="current-theme">{theme}</output>
      <ThemeToggle />
    </>
  );
}

describe("Color theme", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = "dark";
    document.documentElement.style.colorScheme = "dark";
  });

  it("starts dark and switches the document to light mode", async () => {
    render(
      <ColorThemeProvider>
        <ThemeHarness />
      </ColorThemeProvider>,
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
    fireEvent.click(screen.getByRole("button", { name: "Passa al tema chiaro" }));

    await waitFor(() => expect(screen.getByTestId("current-theme")).toHaveTextContent("light"));
    expect(document.documentElement).not.toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("restores the saved light preference", async () => {
    window.localStorage.setItem("nr-color-theme", "light");

    render(
      <ColorThemeProvider>
        <ThemeHarness />
      </ColorThemeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("current-theme")).toHaveTextContent("light"));
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("saves a newly selected theme for the next visit", async () => {
    render(
      <ColorThemeProvider>
        <ThemeHarness />
      </ColorThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Passa al tema chiaro" }));

    await waitFor(() => expect(window.localStorage.getItem("nr-color-theme")).toBe("light"));
  });
});
