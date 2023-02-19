import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDiscord,
  faGithub,
  faInstagram,
} from '@fortawesome/free-brands-svg-icons';
import Image from 'next/image';
import logo from '../public/logo.jpg';
const date = new Date().getFullYear()
const Footer = () => {
  return (
    <footer className='justify-center gap-2 md:justify-between footer text-secondary dark:text-secondary-dark'>
      <div className='flex items-center h-full'>
        <div className='w-6 h-6'>
          <Image
            className='rounded-full'
            src={logo}
            alt='logo'
            layout='responsive'
          />
        </div>
        <p>Copyright © {date} - All rights reserved</p>
      </div>
      <div className='flex h-full w-full items-center justify-center gap-2'>
        <a
          href='https://www.instagram.com/manipalosf/'
          target='_blank'
          rel='noopener noreferrer'
          className='link-hover link duration-300 hover:-translate-y-1'
          aria-label='Instagram'
        >
          <FontAwesomeIcon
            icon={faInstagram}
            size='lg'
            className='max-w-[1.4rem]'
          />
        </a>
        <a
          href='https://github.com/Manipal-OSF'
          target='_blank'
          rel='noopener noreferrer'
          className='link-hover link duration-300 hover:-translate-y-1'
          aria-label='Github'
        >
          <FontAwesomeIcon
            icon={faGithub}
            size='lg'
            className='max-w-[1.4rem]'
          />
        </a>
        <a
          href='https://discord.gg/wk52CxvSj8'
          target='_blank'
          rel='noopener noreferrer'
          className='link-hover link duration-300 hover:-translate-y-1'
          aria-label='Github'
        >
          <FontAwesomeIcon
            icon={faDiscord}
            size='lg'
            className='max-w-[1.4rem]'
          />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
