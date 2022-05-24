import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faInstagram } from '@fortawesome/free-brands-svg-icons';
import Image from 'next/image';
import logo from '../public/logo.jpg';

const Footer = () => {
  return (
    <footer className='justify-center gap-2 md:justify-between footer'>
      <div className='flex items-center h-full'>
        <div className='w-6 h-6'>
          <Image className='rounded-full' src={logo} alt='logo' layout='responsive' />
        </div>
        <p>Copyright © 2022 - All rights reserved</p>
      </div>
      <div className='flex items-center justify-center w-full h-full'>
        <a href='#' className='link link-hover' aria-label='Instagram'>
          <FontAwesomeIcon icon={faInstagram} size='lg' />
        </a>
        <a href='#' className='link link-hover' aria-label='Github'>
          <FontAwesomeIcon icon={faGithub} size='lg' />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
