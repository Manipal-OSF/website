import { useCallback, useEffect, useState } from 'react';
import { DARK_SCHEME_QUERY, THEME_STORAGE_KEY, type Theme } from '@/lib/theme';

const systemTheme = (): Theme =>
  window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light';

const applyTheme = (theme: Theme) =>
  document.documentElement.setAttribute('data-theme', theme);

// Storage can throw in private windows or with site data blocked.
function storeOverride(theme: Theme | null) {
  try {
    if (theme) sessionStorage.setItem(THEME_STORAGE_KEY, theme);
    else sessionStorage.removeItem(THEME_STORAGE_KEY);
  } catch {}
}

// Returns null until hydrated, since the server cannot know the theme.
export function useTheme() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Read the theme set by themeScript after hydration to keep markup stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'dark'
        : 'light'
    );
    const media = window.matchMedia(DARK_SCHEME_QUERY);
    const onSystemChange = () => {
      storeOverride(null);
      const next = systemTheme();
      applyTheme(next);
      setTheme(next);
    };
    media.addEventListener('change', onSystemChange);
    return () => media.removeEventListener('change', onSystemChange);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storeOverride(next === systemTheme() ? null : next);
    setTheme(next);
  }, [theme]);

  return { theme, toggleTheme };
}
