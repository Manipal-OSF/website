import Image from 'next/image';
import logo from '../public/logo.jpg';

const Header = () => {
  return (
    <header className='flex flex-row items-center justify-between h-10'>
      <div className='w-12 h-12'>
        <Image className='rounded-full' src={logo} alt='logo' layout='responsive' />
      </div>
      <nav>
        <ul className='grid grid-flow-col gap-5'>
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
    </header>
  );
};

export default Header;
