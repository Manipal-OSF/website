import { ChevronRight, House } from 'lucide-react';
import Link from 'next/link';
import { absoluteUrl } from '@/lib/seo';
import JsonLd from './JsonLd';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// The last item is the current page and is not linked.
const Breadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav aria-label='Breadcrumb'>
    <JsonLd
      data={{
        '@type': 'BreadcrumbList',
        itemListElement: [{ label: 'Home', href: '/' }, ...items].map(
          (item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            item: item.href ? absoluteUrl(item.href) : undefined,
          })
        ),
      }}
    />
    <ol className='text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm'>
      <li>
        <Link href='/' className='hover:text-foreground' aria-label='Home'>
          <House className='size-4' />
        </Link>
      </li>
      {items.map((item, index) => (
        <li key={index} className='flex min-w-0 items-center gap-1.5'>
          <ChevronRight aria-hidden className='size-3.5 shrink-0' />
          {index === items.length - 1 || !item.href ? (
            <span aria-current='page' className='text-foreground truncate'>
              {item.label}
            </span>
          ) : (
            <Link href={item.href} className='hover:text-foreground'>
              {item.label}
            </Link>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumbs;
