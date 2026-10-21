import type { CSSProperties } from 'react';
import { ACTIVITY_WEEKS, type OrgStats } from '@/lib/github';
import { cn } from '@packages/ui/lib/utils';

interface ActivityCardProps {
  activity: OrgStats['activity'];
  totalCommits: number;
}

const formatDay = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));

const level = (count: number) =>
  count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;
const opacity = [0, 0.3, 0.55, 0.8, 1];

const NARROW_WEEKS = 16;
const hiddenWhenNarrow = (ACTIVITY_WEEKS - NARROW_WEEKS) * 7;

const ActivityCard = ({ activity, totalCommits }: ActivityCardProps) => (
  <div className='@container flex h-full flex-col gap-3 p-4'>
    <h2 className='font-medium'>Activity</h2>
    <div
      className='grid grid-flow-col grid-rows-7 gap-[3px] [--weeks:var(--narrow-weeks)] @min-[36rem]:[--weeks:var(--all-weeks)] lg:grow lg:[--weeks:var(--all-weeks)]'
      style={
        {
          '--narrow-weeks': NARROW_WEEKS,
          '--all-weeks': ACTIVITY_WEEKS,
          gridTemplateColumns: 'repeat(var(--weeks), minmax(0, 1fr))',
        } as CSSProperties
      }
      role='img'
      aria-label={`${totalCommits} commits in the last ${ACTIVITY_WEEKS} weeks`}
    >
      {activity.map(({ date, count }, index) => (
        <span
          key={date}
          title={`${count} ${count === 1 ? 'commit' : 'commits'} on ${formatDay(
            date
          )}`}
          className={cn(
            'bg-border relative aspect-square rounded-[3px] lg:aspect-auto',
            index < hiddenWhenNarrow && 'hidden @min-[36rem]:block lg:block'
          )}
        >
          <span
            className='bg-primary absolute inset-0 rounded-[3px]'
            style={{ opacity: opacity[level(count)] }}
          />
        </span>
      ))}
    </div>
    <div
      aria-hidden='true'
      className='text-muted-foreground flex items-center justify-end gap-1 text-[10px]'
    >
      Less
      {opacity.map((value) => (
        <span key={value} className='bg-border relative size-2.5 rounded-[3px]'>
          <span
            className='bg-primary absolute inset-0 rounded-[3px]'
            style={{ opacity: value }}
          />
        </span>
      ))}
      More
    </div>
  </div>
);

export default ActivityCard;
