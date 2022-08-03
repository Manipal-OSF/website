type ThemeMode = 'light' | 'dark' | '';

export const setTheme = (mode: ThemeMode = ''): void => {
  if (mode !== '') {
    document.documentElement.classList.add(mode);
    localStorage.theme = mode;
    return;
  }

  if (localStorage.theme !== 'dark') {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
  }
};
