import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/hooks/useAuth";
import { ColorThemeProvider, useColorTheme } from "@/hooks/useColorTheme";
import { Toaster } from "@/components/ui/sonner";
import { HudTheme } from "@/design-system/nightrunner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-mono text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Pagina non trovata</h2>
        <div className="mt-6">
          <Link to="/" className="nr-button inline-flex px-4 py-2" data-variant="primary">
            Torna alla home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">La pagina non si è caricata</h1>
        <p className="mt-2 text-sm text-muted-foreground">Qualcosa è andato storto. Riprova.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="nr-button mt-6 inline-flex px-4 py-2"
          data-variant="primary"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cybersecurity 101" },
      { name: "description", content: "Piattaforma didattica Cybersecurity 101: classi, studenti e corsi." },
      { property: "og:title", content: "Cybersecurity 101" },
      { property: "og:description", content: "Piattaforma didattica Cybersecurity 101: classi, studenti e corsi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="it" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ThemedApp() {
  const { theme } = useColorTheme();
  return (
    <HudTheme gradientIntensity={65} mode={theme} className="nr-app">
      <AuthProvider>
        <Outlet />
        <Toaster richColors theme={theme} />
      </AuthProvider>
    </HudTheme>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ColorThemeProvider>
        <ThemedApp />
      </ColorThemeProvider>
    </QueryClientProvider>
  );
}
