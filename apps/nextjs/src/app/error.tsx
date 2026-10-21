'use client';

import ServerError from '@/components/common/ServerError';

export default function ErrorPage({ retry }: { retry: () => void }) {
  return <ServerError retry={retry} />;
}
