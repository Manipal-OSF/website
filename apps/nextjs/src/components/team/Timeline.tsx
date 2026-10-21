import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import BrandIcon from '@/components/common/BrandIcon';
import { Avatar, AvatarFallback, AvatarImage } from '@packages/ui/components/avatar';
import { Badge } from '@packages/ui/components/badge';
import type { Milestone, Person, TimelineYear } from '@/lib/timeline';
import SpotlightCard from './SpotlightCard';
import TimelineScroll from './TimelineScroll';

const PersonLink = ({ person }: { person: Person }) => {
  const content = (
    <>
      <Avatar size='sm'>
        <AvatarImage src={person.avatar} alt='' />
        <AvatarFallback>{person.name[0]}</AvatarFallback>
      </Avatar>
      {person.name}
      {person.role && (
        <span className='text-muted-foreground text-xs'>{person.role}</span>
      )}
    </>
  );
  const className =
    'hover:bg-muted flex items-center gap-2 rounded-full border-2 py-0.5 pr-3 pl-0.5 text-sm transition-colors';

  if (!person.href) return <span className={className}>{content}</span>;
  return person.href.startsWith('http') ? (
    <a
      href={person.href}
      target='_blank'
      rel='noopener noreferrer'
      className={className}
    >
      {content}
    </a>
  ) : (
    <Link href={person.href} className={className}>
      {content}
    </Link>
  );
};

const MilestoneCard = ({ milestone }: { milestone: Milestone }) => (
  <li className='timeline-reveal'>
    <SpotlightCard>
      <div className='flex flex-col gap-2 p-4 sm:p-5'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <span className='text-primary text-xs font-medium'>
            {milestone.when}
          </span>
          {milestone.tags && (
            <ul className='flex flex-wrap gap-1'>
              {milestone.tags.map((tag) => (
                <li key={tag}>
                  <Badge variant='outline' className='text-muted-foreground'>
                    {tag}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
        <h3 className='text-lg font-medium'>{milestone.title}</h3>
        <p className='text-muted-foreground text-sm text-pretty'>
          {milestone.description}
        </p>
        {milestone.people && (
          <ul className='mt-1 flex flex-wrap gap-2'>
            {milestone.people.map((person) => (
              <li key={person.name}>
                <PersonLink person={person} />
              </li>
            ))}
          </ul>
        )}
        {milestone.link && (
          <a
            href={milestone.link.href}
            target='_blank'
            rel='noopener noreferrer'
            className='text-muted-foreground hover:text-primary mt-1 flex w-fit items-center gap-1.5 text-xs transition-colors'
          >
            <BrandIcon brand='GitHub' className='size-3.5' />
            {milestone.link.label}
            <ArrowUpRight className='size-3.5' />
          </a>
        )}
      </div>
    </SpotlightCard>
  </li>
);

// The scroll effects live in globals.css as CSS scroll-driven animations
const YearRow = ({ entry }: { entry: TimelineYear }) => (
  <li className='timeline-row flex gap-4 md:gap-0'>
    <div className='sticky top-24 flex w-8 shrink-0 items-center self-start md:w-56'>
      <span className='bg-background grid size-8 shrink-0 place-items-center rounded-full border-2'>
        <span className='bg-border relative size-3 rounded-full'>
          <span className='timeline-dot bg-primary absolute inset-0 rounded-full' />
        </span>
      </span>
      <h2 className='timeline-year hidden pl-6 text-4xl font-semibold tabular-nums md:block'>
        {entry.year}
      </h2>
    </div>
    <div className='flex min-w-0 grow flex-col gap-3'>
      <h2 className='timeline-year text-2xl leading-8 font-semibold tabular-nums md:hidden'>
        {entry.year}
      </h2>
      <ol className='flex flex-col gap-3'>
        {entry.milestones.map((milestone) => (
          <MilestoneCard key={milestone.title} milestone={milestone} />
        ))}
      </ol>
    </div>
  </li>
);

const Timeline = ({ data }: { data: TimelineYear[] }) => (
  <div className='timeline relative'>
    <TimelineScroll />
    <div
      aria-hidden='true'
      className='bg-border absolute inset-y-0 left-[calc(1rem-1px)] w-0.5 overflow-hidden rounded-full [mask-image:linear-gradient(to_bottom,black_90%,transparent)]'
    >
      <div className='timeline-fill via-primary to-primary absolute inset-0 origin-top bg-linear-to-b from-transparent via-5%' />
    </div>
    <ol className='flex flex-col gap-16 md:gap-24'>
      {data.map((entry) => (
        <YearRow key={entry.year} entry={entry} />
      ))}
    </ol>
  </div>
);

export default Timeline;
