'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface UserPreferences {
  themeColor: string;
  workspaceTitle: string;
  setThemeColor: (color: string) => void;
  setWorkspaceTitle: (title: string) => void;
}

const ThemeCtx = createContext<UserPreferences>({
  themeColor: 'teal',
  workspaceTitle: '我的工作台',
  setThemeColor: () => {},
  setWorkspaceTitle: () => {},
});

export function useUserPreferences() {
  return useContext(ThemeCtx);
}

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [themeColor, setThemeColor] = useState('teal');
  const [workspaceTitle, setWorkspaceTitle] = useState('我的工作台');
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('wb:theme') || localStorage.getItem('user_theme_color');
      if (savedTheme) setThemeColor(savedTheme);

      const savedTitle = localStorage.getItem('wb:workspace_title');
      if (savedTitle) setWorkspaceTitle(savedTitle);
    } catch {}
    setHydrated(true);
  }, []);

  const handleSetThemeColor = useCallback((color: string) => {
    setThemeColor(color);
    try { localStorage.setItem('wb:theme', color); localStorage.setItem('user_theme_color', color); } catch {}
  }, []);

  const handleSetWorkspaceTitle = useCallback((title: string) => {
    setWorkspaceTitle(title);
    try { localStorage.setItem('wb:workspace_title', title); } catch {}
  }, []);

  // Prevent SSR hydration mismatch — render children only after hydration
  if (!hydrated) return <>{children}</>;

  return (
    <ThemeCtx.Provider value={{ themeColor, workspaceTitle, setThemeColor: handleSetThemeColor, setWorkspaceTitle: handleSetWorkspaceTitle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

/** Tailwind-safe theme color dictionary — no dynamic class拼接 */
export const THEME_MAP: Record<string, {
  text: string; bg: string; border: string; ring: string;
  badgeBg: string; badgeText: string; btnBg: string; btnHover: string;
  dot: string; hoverBg: string; shadowColor: string;
  from: string; to: string; fromLight: string;
  iconBg: string; iconText: string; progressFrom: string; progressTo: string;
  activeBg: string; activeText: string;
}> = {
  teal:    { text: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-600', ring: 'ring-teal-200', badgeBg: 'bg-teal-100', badgeText: 'text-teal-700', btnBg: 'bg-teal-600', btnHover: 'hover:bg-teal-700', dot: 'bg-teal-500', hoverBg: 'hover:bg-teal-50', shadowColor: 'shadow-teal-500/10', from: 'from-teal-500', to: 'to-teal-600', fromLight: 'from-teal-400', iconBg: 'bg-teal-100', iconText: 'text-teal-600', progressFrom: 'from-teal-400', progressTo: 'to-teal-600', activeBg: 'bg-teal-50', activeText: 'text-teal-700' },
  blue:    { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-600', ring: 'ring-blue-200', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700', btnBg: 'bg-blue-600', btnHover: 'hover:bg-blue-700', dot: 'bg-blue-500', hoverBg: 'hover:bg-blue-50', shadowColor: 'shadow-blue-500/10', from: 'from-blue-500', to: 'to-blue-600', fromLight: 'from-blue-400', iconBg: 'bg-blue-100', iconText: 'text-blue-600', progressFrom: 'from-blue-400', progressTo: 'to-blue-600', activeBg: 'bg-blue-50', activeText: 'text-blue-700' },
  purple:  { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-600', ring: 'ring-purple-200', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700', btnBg: 'bg-purple-600', btnHover: 'hover:bg-purple-700', dot: 'bg-purple-500', hoverBg: 'hover:bg-purple-50', shadowColor: 'shadow-purple-500/10', from: 'from-purple-500', to: 'to-purple-600', fromLight: 'from-purple-400', iconBg: 'bg-purple-100', iconText: 'text-purple-600', progressFrom: 'from-purple-400', progressTo: 'to-purple-600', activeBg: 'bg-purple-50', activeText: 'text-purple-700' },
  orange:  { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-600', ring: 'ring-orange-200', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700', btnBg: 'bg-orange-600', btnHover: 'hover:bg-orange-700', dot: 'bg-orange-500', hoverBg: 'hover:bg-orange-50', shadowColor: 'shadow-orange-500/10', from: 'from-orange-500', to: 'to-orange-600', fromLight: 'from-orange-400', iconBg: 'bg-orange-100', iconText: 'text-orange-600', progressFrom: 'from-orange-400', progressTo: 'to-orange-600', activeBg: 'bg-orange-50', activeText: 'text-orange-700' },
  red:     { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-600', ring: 'ring-red-200', badgeBg: 'bg-red-100', badgeText: 'text-red-700', btnBg: 'bg-red-600', btnHover: 'hover:bg-red-700', dot: 'bg-red-500', hoverBg: 'hover:bg-red-50', shadowColor: 'shadow-red-500/10', from: 'from-red-500', to: 'to-red-600', fromLight: 'from-red-400', iconBg: 'bg-red-100', iconText: 'text-red-600', progressFrom: 'from-red-400', progressTo: 'to-red-600', activeBg: 'bg-red-50', activeText: 'text-red-700' },
  slate:   { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-600', ring: 'ring-slate-200', badgeBg: 'bg-slate-100', badgeText: 'text-slate-700', btnBg: 'bg-slate-600', btnHover: 'hover:bg-slate-700', dot: 'bg-slate-500', hoverBg: 'hover:bg-slate-50', shadowColor: 'shadow-slate-500/10', from: 'from-slate-500', to: 'to-slate-600', fromLight: 'from-slate-400', iconBg: 'bg-slate-100', iconText: 'text-slate-600', progressFrom: 'from-slate-400', progressTo: 'to-slate-600', activeBg: 'bg-slate-50', activeText: 'text-slate-700' },
};

export function getTheme(key?: string) {
  return THEME_MAP[key || 'teal'] || THEME_MAP.teal;
}
