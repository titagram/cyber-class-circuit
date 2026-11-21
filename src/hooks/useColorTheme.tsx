import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ColorTheme = "dark" | "light";

const THEME_STORAGE_KEY = "nr-color-theme";

interface ColorThemeContextValue {
  theme: ColorTheme;
  toggleTheme: () => void;
}

const ColorThemeContext = createContext<ColorThemeContextValue | null>(null);

function readStoredTheme(): ColorTheme | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ColorTheme>("dark");

  useEffect(() => {
    const stored = readStoredTheme();
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const value = useMemo<ColorThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () => {
        setTheme((current) => {
          const next = current === "dark" ? "light" : "dark";
          try {
            window.localStorage.setItem(THEME_STORAGE_KEY, next);
          } catch {
            // The selected theme still applies when storage is unavailable.
          }
          return next;
        });
      },
    }),
    [theme],
  );

  return <ColorThemeContext.Provider value={value}>{children}</ColorThemeContext.Provider>;
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (!context) throw new Error("useColorTheme must be used within ColorThemeProvider");
  return context;
}
