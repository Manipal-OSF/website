import Image from 'next/image';
import logo from '../public/logo.jpg';

const Footer = () => {
  return (
    <footer className='items-center justify-between footer'>
      <div className='items-center grid-flow-col'>
        <div className='w-6 h-6'>
          <Image className='rounded-full' src={logo} alt='logo' layout='responsive' />
        </div>
        <p>Copyright © 2022 - All rights reserved</p>
      </div>
      <div className='grid-flow-col'>
        <a href='#' className='link link-hover'>
          insta
        </a>
        <a href='#' className='link link-hover'>
          github
        </a>
        <a href='#' className='link link-hover'>
          site
        </a>
      </div>
    </footer>
  );
};

export default Footer;
