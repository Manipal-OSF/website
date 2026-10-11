'use client';

import { usePathname } from 'next/navigation';
import { activeNavItem, siteName } from '@/lib/site';

const SectionName = ({ className }: { className?: string }) => (
  <span className={className}>
    {activeNavItem(usePathname())?.label ?? siteName}
  </span>
);

export default SectionName;
