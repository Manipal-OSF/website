import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import Link from '@/components/common/TransitionLink';
import BentoCell, { type BentoArea } from './BentoCell';

interface LinkCellProps {
  area: BentoArea;
  href: string;
  icon: ReactNode;
  title: string;
  detail?: ReactNode;
  note?: ReactNode;
  image?: string;
}

const LinkCell = ({
  area,
  href,
  icon,
  title,
  detail,
  note,
  image,
}: LinkCellProps) => {
  const external = href.startsWith('http');
  const content = (
    <>
      {image && (
        <Image
          src={image}
          alt=''
          fill
          sizes='(min-width: 640px) 33vw, 100vw'
          className='object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-30 motion-reduce:transition-none'
        />
      )}
      <span className='text-muted-foreground relative group-hover:text-primary transition-[color,scale] duration-300 group-hover:scale-110 [&>svg]:size-9 sm:[&>svg]:size-11'>
        {icon}
      </span>
      <span className='relative flex flex-col'>
        <span className='font-medium'>{title}</span>
        {detail && (
          <span className='text-muted-foreground text-xs'>{detail}</span>
        )}
      </span>
      <ArrowUpRight
        aria-hidden='true'
        className='text-muted-foreground absolute top-3 right-3 size-4 -translate-x-1 translate-y-1 opacity-0 transition-[opacity,translate] group-hover:translate-0 group-hover:opacity-100'
      />
    </>
  );
  const className =
    'hover:bg-muted/60 flex h-full flex-col justify-between p-4 transition-colors';

  return (
    <BentoCell area={area} note={note} noteClassName='top-3 right-9'>
      {external ? (
        <a
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className={className}
        >
          {content}
        </a>
      ) : (
        <Link href={href} className={className}>
          {content}
        </Link>
      )}
    </BentoCell>
  );
};

export default LinkCell;
