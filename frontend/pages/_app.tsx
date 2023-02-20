import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import { AnimatePresence } from 'framer-motion'

function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <AnimatePresence 
    mode="wait"
    initial={false}
    onExitComplete={() => window.scrollTo(0, 0)}
    >
      <Layout key={router.asPath}>
        <Component {...pageProps} />
      </Layout>
    </AnimatePresence>
  );
}

export default MyApp;
