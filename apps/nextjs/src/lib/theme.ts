export type Theme = 'light' | 'dark';

// The theme follows the system unless overridden for the current session.
export const THEME_STORAGE_KEY = 'theme';
export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

// Inlined before the site renders so the theme matches useTheme's state.
export const themeScript = `
(function () {
  try {
    localStorage.removeItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var t = sessionStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (t !== 'light' && t !== 'dark') {
      t = window.matchMedia(${JSON.stringify(
        DARK_SCHEME_QUERY,
      )}).matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`;
