import Logo from './Logo';
import NavLinks from './NavLinks';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <header className='bg-background/50 sticky top-0 z-50 border-b backdrop-blur-sm'>
      <div className='text-foreground mx-auto grid h-14 w-full max-w-5xl grid-cols-3 items-center px-4'>
        <Logo className='size-9 md:size-10' />
        <nav className='place-self-center'>
          <ul className='text-muted-foreground grid grid-flow-col gap-4 text-sm sm:gap-5'>
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
