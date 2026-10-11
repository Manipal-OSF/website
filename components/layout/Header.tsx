import Logo from './Logo';
import MobileNav from './MobileNav';
import NavLinks from './NavLinks';
import SectionName from './SectionName';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <header className='bg-background/50 sticky top-0 z-50 border-b backdrop-blur-sm'>
      <div className='text-foreground mx-auto grid h-14 w-full max-w-5xl grid-cols-3 items-center px-4'>
        <Logo className='hidden size-10 md:block' />
        <div className='md:hidden'>
          <MobileNav />
        </div>
        <SectionName className='text-center md:hidden' />
        <nav className='hidden place-self-center md:block'>
          <ul className='text-muted-foreground grid grid-flow-col gap-5 text-sm'>
            <NavLinks />
          </ul>
        </nav>
        <div className='flex items-center justify-end'>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
