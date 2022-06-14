import { faMoon } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { MutableRefObject, useEffect, useRef } from 'react';
import { setTheme } from '../backend/theme';
import logo from '../public/logo.jpg';

const Header = () => {
  let checked = useRef(false);

  useEffect(() => {
    if (localStorage.theme === 'light') {
      checked.current = false;
    } else {
      checked.current = true;
    }
  }, []);

  return (
    <header className='grid items-center h-10 grid-cols-3 place-content-center dark:text-white'>
      <div className='w-12 h-12'>
        <Image
          className='rounded-full'
          src={logo}
          alt='logo'
          layout='responsive'
        />
      </div>
      <nav className='place-self-center'>
        <ul className='grid grid-flow-col gap-5 text-lg'>
          <li>
            <a className='link link-hover' href='#'>
              Home
            </a>
          </li>
          <li>
            <a className='link link-hover' href='#'>
              About
            </a>
          </li>
          <li>
            <a className='link link-hover' href='#'>
              Syllabus
            </a>
          </li>
          <li>
            <a className='link link-hover' href='#'>
              Blog
            </a>
          </li>
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
