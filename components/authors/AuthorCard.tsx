import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Author } from '@/types/blog';
import AuthorAvatar from './AuthorAvatar';

interface AuthorCardProps {
  author: Author;
  linkToProfile?: boolean;
}

const AuthorCard = ({ author, linkToProfile = true }: AuthorCardProps) => {
  const profileLink = (className: string, children: ReactNode) =>
    linkToProfile ? (
      <Link href={`/authors/${author.id}`} className={className}>
        {children}
      </Link>
    ) : (
      children
    );

  return (
    <div className='has-[a:hover]:bg-muted/50 rounded-xl border p-4 transition-colors'>
      <div className='flex flex-wrap gap-4'>
        {profileLink(
          'hover:ring-primary block rounded-md transition-shadow hover:ring-2',
          <AuthorAvatar
            name={author.name}
            avatar={author.avatar}
            sizes='8rem'
            className='size-32 rounded-md text-4xl'
          />
        )}
        <div className='flex grow flex-col justify-between gap-y-4'>
          <div>
            <div className='flex flex-wrap items-center gap-x-2'>
              <h3 className='text-foreground text-lg font-medium'>
                {profileLink('hover:underline', author.name)}
              </h3>
              {author.pronouns && (
                <span className='text-muted-foreground text-sm'>
                  ({author.pronouns})
                </span>
              )}
            </div>
            {author.bio && (
              <p className='text-muted-foreground text-sm'>{author.bio}</p>
            )}
          </div>
          {author.links.length > 0 && (
            <ul className='flex flex-wrap gap-2'>
              {author.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={
                      link.href.startsWith('mailto:') ? undefined : '_blank'
                    }
                    rel='noopener noreferrer'
                    className='hover:bg-muted text-muted-foreground hover:text-foreground rounded-md border px-2 py-1 text-xs transition-colors'
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorCard;
