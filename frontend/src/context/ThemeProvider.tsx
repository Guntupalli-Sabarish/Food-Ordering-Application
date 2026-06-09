import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  /** The raw user preference stored: light | dark | system */
  mode: ThemeMode;
  /** The resolved effective theme applied to the DOM */
  theme: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  theme: "light",
  setMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

const getSystemTheme = (): "light" | "dark" =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const resolveTheme = (mode: ThemeMode): "light" | "dark" => {
  if (mode === "system") return getSystemTheme();
  return mode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("theme-mode");
    if (stored === "dark" || stored === "light" || stored === "system") return stored;
    // Migrate old "theme" key
    const legacy = localStorage.getItem("theme");
    if (legacy === "dark") return "dark";
    if (legacy === "light") return "light";
    return "system";
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => resolveTheme(mode));

  // Listen for system preference changes while in "system" mode
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  // Apply theme class to document root
  useEffect(() => {
    const resolved = resolveTheme(mode);
    setTheme(resolved);
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme-mode", mode);
  }, [mode]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
