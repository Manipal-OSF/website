'use client';

import ServerError from '../components/ServerError';

export default function ErrorPage({ retry }: { retry: () => void }) {
  return <ServerError retry={retry} />;
}
