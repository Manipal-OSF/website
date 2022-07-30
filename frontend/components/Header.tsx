import { faMoon } from '@fortawesome/free-regular-svg-icons';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useRef, useEffect } from 'react';
import { setTheme } from '../backend/theme';
import logo from '../public/logo.jpg';
import { Disclosure } from '@headlessui/react';
import Link from 'next/link';

const Links = () => {
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
  let checked = useRef(false);

  useEffect(() => {
    localStorage.theme === 'light' ? false : true;
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
        <FontAwesomeIcon icon={faMoon} size='lg' />
        <input
          className='toggle'
          defaultChecked={checked.current}
          type='checkbox'
          aria-label='Theme switcher'
          onChange={() => {
            setTheme();
          }}
        />
      </div>
    </header>
  );
};

export default Header;