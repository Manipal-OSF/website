import { faMoon } from '@fortawesome/free-regular-svg-icons';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useRef, useEffect, ReactElement, useState, FunctionComponent } from 'react';
import { setTheme } from '../services/theme';
import logo from '../public/logo.jpg';
import { Disclosure } from '@headlessui/react';
import Link from 'next/link';

const Links = (): ReactElement => {
  return (
    <>
      <li>
        <Link href='/'>
          <a className='link link-hover'>Home</a>
        </Link>
      </li>
      <li>
        <Link href='/about'>
          <a className='link link-hover'>About</a>
        </Link>
      </li>
      <li>
        <Link href='/syllabus'>
          <a className='link link-hover'>Syllabus</a>
        </Link>
      </li>
      <li>
        <Link href='/blog'>
          <a className='link link-hover'>Blog</a>
        </Link>
      </li>
    </>
  );
};

const Header = () => {
  let [checked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    setChecked(localStorage.theme === 'light' ? false : true);
    setTheme(localStorage.theme);
  }, []);

  return (
    <header className='grid items-center h-10 grid-cols-2 md:grid-cols-3 place-content-center dark:text-white'>
      <div className='hidden w-12 h-12 md:block'>
        <Image
          className='duration-500 rounded-3xl hover:rounded-lg'
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
              <Disclosure.Panel className='absolute text-gray-500 md:hidden'>
                <nav className='p-3 mt-5 border-2 border-black rounded-lg dark:text-white dark:border-white md:block place-self-center'>
                  <ul className='grid grid-flow-row gap-5 text-lg'>
                    <Links />
                  </ul>
                </nav>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>

      <nav className='hidden md:block place-self-center'>
        <ul className='grid grid-flow-col gap-5 text-lg'>
          <Links />
        </ul>
      </nav>

      <div className='flex items-center gap-2 place-content-end'>
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
