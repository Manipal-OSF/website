import { socialLinks } from '@/lib/site';
import BrandIcon from '@/components/common/BrandIcon';
import Logo from './Logo';
import { iconButton } from './styles';

const year = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className='border-t'>
      <div className='mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row'>
        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
          <Logo className='size-5 shrink-0' />
          <p>Copyright © {year} - All rights reserved</p>
        </div>

        <div className='flex items-center gap-1'>
          {socialLinks.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              aria-label={label}
              className={iconButton}
            >
              <BrandIcon brand={label} className='size-4' />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
