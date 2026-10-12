'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from '@/components/common/TransitionLink';
import { activeNavItem, navItems } from '@/lib/site';

const NavLinks = () => {
  const active = activeNavItem(usePathname());

  return navItems.map((item, i) => {
    const isActive = item === active;
    return (
      <motion.li
        key={item.href}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 * i }}
      >
        <Link
          href={item.href}
          scroll={false}
          aria-current={isActive ? 'page' : undefined}
          className={`transition-colors ${
            isActive ? 'text-foreground' : 'hover:text-foreground'
          }`}
        >
          {item.label}
        </Link>
      </motion.li>
    );
  });
};

export default NavLinks;
