'use client';

import Link from './TransitionLink';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const routeNames = ['Home', 'Services', 'Team', 'Blog', 'Events'];

const pathFor = (name: string) =>
  name === 'Home' ? '/' : `/${name.toLowerCase()}`;

export function routeNameFor(pathname: string) {
  return routeNames.find((name) => {
    const path = pathFor(name);
    return (
      pathname === path || (path !== '/' && pathname.startsWith(`${path}/`))
    );
  });
}

const Links = () => {
  const selectedRoute = routeNameFor(usePathname());

  return (
    <>
      {routeNames.map((name, i) => {
        const active = selectedRoute === name;
        return (
          <motion.li
            key={name}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * i }}
          >
            <Link
              href={pathFor(name)}
              scroll={false}
              aria-current={active ? 'page' : undefined}
              className={`transition-colors ${
                active ? 'text-foreground' : 'hover:text-foreground'
              }`}
            >
              {name}
            </Link>
          </motion.li>
        );
      })}
    </>
  );
};

export default Links;
