import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AuthorAvatarProps {
  name: string;
  avatar: string | null;
  className?: string;
  sizes: string;
}

const AuthorAvatar = ({
  name,
  avatar,
  className,
  sizes,
}: AuthorAvatarProps) => (
  <span
    className={cn(
      'bg-muted text-muted-foreground relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium',
      className
    )}
  >
    {avatar ? (
      <Image
        src={avatar}
        alt={`Avatar of ${name}`}
        fill
        sizes={sizes}
        className='object-cover'
      />
    ) : (
      <span aria-hidden>{name[0]?.toUpperCase()}</span>
    )}
  </span>
);

export default AuthorAvatar;
