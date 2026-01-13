import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Colors } from "../constants/Colors";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  colors: typeof Colors.light;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [theme, setTheme] = useState<Theme>("light");

  // Tema değiştirme fonksiyonu - useCallback ile memoize edildi
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  // Türetilmiş değerler - useMemo ile memoize edildi
  const colors = useMemo(() => Colors[theme], [theme]);
  const isDarkMode = theme === "dark";

  // Context value - useMemo ile memoize edildi (S6481 düzeltmesi)
  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme,
      colors,
      toggleTheme,
      isDarkMode,
    }),
    [theme, colors, toggleTheme, isDarkMode],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
