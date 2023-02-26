import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { motion } from 'framer-motion';

export enum Route {
  Home,
  Services,
  Team,
  Blog,
  Events
}
interface navLinkProp {
  selectedRoute: Route;
  i: number;
  route: String | Route;
}
const NavLink  = ({selectedRoute,i,route}: navLinkProp): ReactElement => {
  return (
    <motion.li
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 , delay: 0.10 * i  }}
    viewport={{ once: true }}
    >
      <Link href={`${route.toString().toLowerCase()}` === "home" ? "/" : '/' + `${route.toString().toLowerCase()}`} scroll={false}>
          <a
            className={`link underline-offset-2 ${
              Route[selectedRoute] === route ? 'decoration-2' : 'link-hover'
            }`}
            >
            {route.toString()}
          </a>
        </Link>
    </motion.li>
  );
};
const Links = (props: any): ReactElement => {   
  const router = useRouter();

  const [selectedRoute, setSelectedRoute] = props.state;

  useEffect(() => {
    switch (router.route) {
      case '/': {
        setSelectedRoute(Route.Home);
        break;
      }
      case '/services': {
        setSelectedRoute(Route.Services);
        break;
      }
      case '/team': {
        setSelectedRoute(Route.Team);
        break;
      }
      case '/blog': {
        setSelectedRoute(Route.Blog);
        break;
      }
      case '/events': {
        setSelectedRoute(Route.Events);
        break;
      }
    }
  }, [router.route]);

  return (
    <>
      {Object.values(Route).filter((v) => isNaN(Number(v))).map((route, i) => (
        <NavLink selectedRoute={selectedRoute} i={i + 5} route={route} key={i} /> // i + 5 to offset the delay
      ))}
    </>
  );
};

export default Links;