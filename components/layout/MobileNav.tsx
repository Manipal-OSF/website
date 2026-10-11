'use client';

import { Disclosure } from '@headlessui/react';
import { Menu, X } from 'lucide-react';
import NavLinks from './NavLinks';
import { iconButton } from './styles';

const MobileNav = () => (
  <Disclosure>
    {({ open, close }: { open: boolean; close: () => void }) => (
      <>
        <Disclosure.Button
          className={iconButton}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className='size-4' /> : <Menu className='size-4' />}
        </Disclosure.Button>
        <Disclosure.Panel className='absolute z-50'>
          <nav className='bg-background mt-3 rounded-lg border p-3'>
            <ul className='grid grid-flow-row gap-4 text-base'>
              {/* Called without arguments: close() treats one as a focus target. */}
              <NavLinks onNavigate={() => close()} />
            </ul>
          </nav>
        </Disclosure.Panel>
      </>
    )}
  </Disclosure>
);

export default MobileNav;
