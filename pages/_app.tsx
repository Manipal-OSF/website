import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import { useEffect } from 'react';
import { setTheme } from '../backend/theme';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    setTheme();
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
