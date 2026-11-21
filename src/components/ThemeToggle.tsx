import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useColorTheme } from "@/hooks/useColorTheme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  collapsed?: boolean;
  className?: string;
}

export function ThemeToggle({ collapsed = false, className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useColorTheme();
  const nextTheme = theme === "dark" ? "chiaro" : "scuro";
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <Button
      type="button"
      variant="ghost"
      size={collapsed ? "icon" : "sm"}
      onClick={toggleTheme}
      aria-label={`Passa al tema ${nextTheme}`}
      className={cn(collapsed ? "" : "justify-start px-2", className)}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {collapsed ? null : <span>Tema {nextTheme}</span>}
    </Button>
  );
}
