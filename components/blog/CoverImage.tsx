import Image from 'next/image';
import placeholder from '@/public/placeholder.png';
import { cn } from '@/lib/utils';

interface CoverImageProps {
  src: string | null;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
}

const CoverImage = ({
  src,
  alt,
  sizes,
  preload,
  className,
}: CoverImageProps) => (
  <div className={cn('relative aspect-video overflow-hidden', className)}>
    <Image
      src={src ?? placeholder}
      alt={src ? alt : ''}
      fill
      sizes={sizes}
      preload={preload}
      placeholder={src ? 'empty' : 'blur'}
      className='object-cover'
    />
  </div>
);

export default CoverImage;
