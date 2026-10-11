// Run before the site renders so the theme matches Header's hydrated state.
export const themeScript = `
(function () {
  try {
    localStorage.removeItem('theme');
    var t = sessionStorage.getItem('theme');
    if (t !== 'light' && t !== 'dark') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`;
