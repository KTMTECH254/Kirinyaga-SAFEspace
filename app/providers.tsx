'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: string | null;
  setTheme: (theme: string | null) => void;
  resolvedTheme: string | null;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<string | null>('system');
  const resolvedTheme = useMemo(() => {
    if (theme === 'light' || theme === 'dark') return theme;
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }, [theme]);

  const setTheme = (nextTheme: string | null) => setThemeState(nextTheme ?? 'system');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    window.localStorage.setItem('theme', theme ?? 'system');
  }, [resolvedTheme, theme]);

  const isDark = resolvedTheme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
