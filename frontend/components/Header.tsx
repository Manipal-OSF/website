import { faMoon } from '@fortawesome/free-regular-svg-icons';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import {
  useEffect,
  useState,
} from 'react';
import { setTheme } from '../services/theme';
import logo from '../public/logo.jpg';
import { Disclosure } from '@headlessui/react';
import Links, { Route } from './Links';

const Header = () => {
  let [checked, setChecked] = useState<boolean>(false);
  let state = useState<Route>(Route.Home);

  useEffect(() => {
    setChecked(localStorage.theme === 'light' ? false : true);
    setTheme(localStorage.theme);
  }, []);

  return (
    <header className='grid h-10 grid-cols-3 place-content-center items-center dark:text-white md:grid-cols-3'>
      <div className='hidden h-12 w-12 md:block'>
        <Image
          className='rounded-3xl duration-500 hover:rounded-lg'
          src={logo}
          alt='logo'
          layout='responsive'
        />
      </div>

      <div className='md:hidden'>
        <Disclosure>
          {({ open }: { open: boolean }) => (
            <>
              <Disclosure.Button className='max-w-sm'>
                <FontAwesomeIcon
                  size='lg'
                  icon={faBars}
                  className={`${
                    open ? ' rotate-90 duration-150' : 'duration-150'
                  }`}
                ></FontAwesomeIcon>
              </Disclosure.Button>
              <Disclosure.Panel className='absolute z-50 text-gray-500 md:hidden'>
                <nav className='mt-5 place-self-center rounded-lg border-2 border-black bg-white p-3 dark:border-white dark:bg-black dark:text-white md:block'>
                  <ul className='grid grid-flow-row gap-5 text-lg'>
                    <Links state={state} />
                  </ul>
                </nav>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>

      <span className='text-center md:hidden'>
        {/* Make more readable */}
        {Object.values(Route)[state[0]].toString()}
      </span>

      <nav className='hidden place-self-center md:block'>
        <ul className='grid grid-flow-col gap-5 text-lg'>
          <Links state={state} />
        </ul>
      </nav>

      <div className='flex place-content-end items-center gap-2'>
        <FontAwesomeIcon icon={faMoon} size='lg' className='max-w-[1.4rem]' />
        <input
          className='toggle'
          checked={checked}
          type='checkbox'
          aria-label='Theme switcher'
          onChange={() => {
            setChecked(!checked);
            setTheme();
          }}
        />
      </div>
    </header>
  );
};

export default Header;
