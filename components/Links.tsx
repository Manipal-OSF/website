import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, type Dispatch, type ReactElement, type SetStateAction } from 'react';
import { motion } from 'framer-motion';

export enum Route {
  Home,
  Services,
  Team,
  Blog,
  Events,
}

const routeNames = Object.values(Route).filter(
  (v): v is string => typeof v === 'string'
);

const pathFor = (name: string) =>
  name === 'Home' ? '/' : `/${name.toLowerCase()}`;

interface LinksProps {
  state: [Route, Dispatch<SetStateAction<Route>>];
}

const Links = ({ state }: LinksProps): ReactElement => {
  const router = useRouter();
  const [selectedRoute, setSelectedRoute] = state;

  useEffect(() => {
    const match = routeNames.find((name) => pathFor(name) === router.route);
    if (match) setSelectedRoute(Route[match as keyof typeof Route]);
  }, [router.route, setSelectedRoute]);

  return (
    <>
      {routeNames.map((name, i) => {
        const active = Route[selectedRoute] === name;
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