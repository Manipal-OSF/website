import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';

export enum Route {
  Home,
  About,
  Board,
  // Blog,
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
      case '/about': {
        setSelectedRoute(Route.About);
        break;
      }
      case '/board': {
        setSelectedRoute(Route.Board);
        break;
      }
      // case '/blog': {
      //   setSelectedRoute(Route.Blog);
      //   break;
      // }
    }
  }, [router.route]);

  return (
    <>
      <li>
        <Link href='/'>
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
        <Link href='/about'>
          <a
            className={`link underline-offset-2 ${
              selectedRoute === Route.About ? 'decoration-2' : 'link-hover'
            }`}
          >
            About
          </a>
        </Link>
      </li>
      <li>
        <Link href='/board'>
          <a
            className={`link underline-offset-2 ${
              selectedRoute === Route.Board ? 'decoration-2' : 'link-hover'
            }`}
          >
            Board
          </a>
        </Link>
      </li>
      {/* TODO: Uncomment once a CMS backend has been set up */}
      {/* <li>
        <Link href='/blog'>
          <a
            className={`link underline-offset-2 ${
              selectedRoute === Route.Blog ? 'decoration-2' : 'link-hover'
            }`}
          >
            Blog
          </a>
        </Link>
      </li> */}
    </>
  );
};

export default Links;
