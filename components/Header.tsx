import { Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { Disclosure } from '@headlessui/react';
import Links, { Route } from './Links';

type Theme = 'light' | 'dark';

const systemQuery = '(prefers-color-scheme: dark)';
const systemTheme = (): Theme =>
  window.matchMedia(systemQuery).matches ? 'dark' : 'light';

const applyTheme = (t: Theme) =>
  document.documentElement.setAttribute('data-theme', t);

const Header = () => {
  const state = useState<Route>(Route.Home);
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Read the theme set by _document after hydration to keep server markup stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'dark'
        : 'light'
    );
    const mq = window.matchMedia(systemQuery);
    const onChange = () => {
      try {
        sessionStorage.removeItem('theme');
      } catch {}
      const t = systemTheme();
      applyTheme(t);
      setTheme(t);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      if (next === systemTheme()) sessionStorage.removeItem('theme');
      else sessionStorage.setItem('theme', next);
    } catch {}
    setTheme(next);
  };

  return (
    <div className='text-foreground mx-auto grid h-14 w-full max-w-5xl grid-cols-3 items-center px-4'>
      <div className='hidden h-10 w-10 md:block'>
        <Logo />
      </div>

      <div className='md:hidden'>
        <Disclosure>
          {({ open }: { open: boolean }) => (
            <>
              <Disclosure.Button
                className='text-muted-foreground hover:text-foreground hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors'
                aria-label={open ? 'Close menu' : 'Open menu'}
              >
                {open ? <X className='size-4' /> : <Menu className='size-4' />}
              </Disclosure.Button>
              <Disclosure.Panel className='absolute z-50 md:hidden'>
                <nav className='bg-background mt-3 rounded-lg border p-3'>
                  <ul className='grid grid-flow-row gap-4 text-base'>
                    <Links state={state} />
                  </ul>
                </nav>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>

      <span className='text-center md:hidden'>
        {Object.values(Route)[state[0]].toString()}
      </span>

      <nav className='hidden place-self-center md:block'>
        <ul className='text-muted-foreground grid grid-flow-col gap-5 text-sm'>
          <Links state={state} />
        </ul>
      </nav>
      <div className='flex items-center justify-end'>
        <button
          type='button'
          onClick={toggleTheme}
          aria-label={
            theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
          }
          className='text-muted-foreground hover:text-foreground hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors'
        >
          {theme === null ? (
            <span className='size-4' />
          ) : theme === 'dark' ? (
            <Sun className='size-4' />
          ) : (
            <Moon className='size-4' />
          )}
        </button>
      </div>
    </div>
  );
};

export default Header;
