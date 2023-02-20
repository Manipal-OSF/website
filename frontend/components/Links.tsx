import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';

export enum Route {
  Home,
  Services,
  Team,
  Blog,
  Events
}

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
      <li>
        <Link href='/' scroll={false}>
          <a
            className={`link underline-offset-2 ${
              selectedRoute === Route.Home ? 'decoration-2' : 'link-hover'
            }`}
          >
            Home
          </a>
        </Link>
      </li>
      <li>
        <Link href='/services' scroll={false}>
          <a
            className={`link underline-offset-2 ${
              selectedRoute === Route.Services ? 'decoration-2' : 'link-hover'
            }`}
          >
            Services
          </a>
        </Link>
      </li>
      <li>
        <Link href='/team' scroll={false}>
          <a
            className={`link underline-offset-2 ${
              selectedRoute === Route.Team ? 'decoration-2' : 'link-hover'
            }`}
          >
            Team
          </a>
        </Link>
      </li>
      <li>
        <Link href='/blog' scroll={false}>
          <a
            className={`link underline-offset-2 ${
              selectedRoute === Route.Blog ? 'decoration-2' : 'link-hover'
            }`}
          >
            Blog
          </a>
        </Link>
      </li>
      <li>
        <Link href='/events' scroll={false}>
          <a
            className={`link underline-offset-2 ${
              selectedRoute === Route.Events ? 'decoration-2' : 'link-hover'
            }`}
          >
            Events
          </a>
        </Link>
      </li>
    </>
  );
};

export default Links;
