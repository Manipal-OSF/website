'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { activeNavItem, navItems } from '@/lib/site';

const NavLinks = () => {
  const active = activeNavItem(usePathname());

  return navItems.map((item) => {
    const isActive = item === active;
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={isActive ? 'page' : undefined}
          className={`transition-colors ${
            isActive ? 'text-foreground' : 'hover:text-foreground'
          }`}
        >
          {item.label}
        </Link>
      </li>
    );
  });
};

export default NavLinks;
