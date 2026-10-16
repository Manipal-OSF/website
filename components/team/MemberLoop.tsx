import type { CSSProperties } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Person } from '@/lib/timeline';
import { cn } from '@/lib/utils';

const MemberList = ({
  people,
  hidden = false,
}: {
  people: Person[];
  hidden?: boolean;
}) => (
  <ul
    aria-hidden={hidden || undefined}
    className={cn('flex shrink-0 gap-3 pr-3', hidden && 'motion-reduce:hidden')}
  >
    {people.map((person) => (
      <li key={person.name}>
        <a
          href={person.href}
          target='_blank'
          rel='noopener noreferrer'
          tabIndex={hidden ? -1 : undefined}
          className='bg-card hover:border-primary/50 flex items-center gap-2 rounded-full border-2 py-1 pr-4 pl-1 text-sm whitespace-nowrap transition-colors'
        >
          <Avatar>
            <AvatarImage src={person.avatar} alt='' loading='lazy' />
            <AvatarFallback>{person.name[0]}</AvatarFallback>
          </Avatar>
          {person.name}
        </a>
      </li>
    ))}
  </ul>
);

const MemberLoop = ({
  people,
  secondsPerPerson = 3,
}: {
  people: Person[];
  secondsPerPerson?: number;
}) => (
  <div className='group overflow-hidden mask-x-from-90% mask-x-to-100% py-1 motion-reduce:overflow-x-auto'>
    <div
      style={
        {
          '--marquee-duration': `${people.length * secondsPerPerson}s`,
        } as CSSProperties
      }
      className='animate-marquee flex w-max group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:animate-none'
    >
      <MemberList people={people} />
      <MemberList people={people} hidden />
    </div>
  </div>
);

export default MemberLoop;
