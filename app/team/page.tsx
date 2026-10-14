import type { Metadata } from 'next';
import UnderDev from '@/components/common/UnderDev';

// Kept out of search results while the page is under development.
export const metadata: Metadata = {
  title: 'Team',
  robots: { index: false, follow: true },
};

export default function TeamPage() {
  return <UnderDev />;
}
