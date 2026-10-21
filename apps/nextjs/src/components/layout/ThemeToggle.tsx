'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { iconButton } from './styles';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type='button'
      onClick={toggleTheme}
      aria-label={
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      }
      className={iconButton}
    >
      {theme === null ? (
        <span className='size-4' />
      ) : theme === 'dark' ? (
        <Sun className='size-4' />
      ) : (
        <Moon className='size-4' />
      )}
    </button>
  );
};

export default ThemeToggle;
