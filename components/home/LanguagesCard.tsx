import type { LanguageShare } from '@/lib/github';

const percent = (share: number) =>
  share >= 0.1 ? `${Math.round(share * 100)}%` : `${(share * 100).toFixed(1)}%`;

const LanguagesCard = ({ languages }: { languages: LanguageShare[] }) => (
  <div className='flex h-full flex-col gap-3 p-4'>
    <h2 className='font-medium'>Languages</h2>
    <div
      role='img'
      aria-label={languages
        .map(({ name, share }) => `${name} ${percent(share)}`)
        .join(', ')}
      className='bg-border flex h-3 w-full gap-0.5 overflow-hidden rounded-full'
    >
      {languages.map(({ name, share, color }) => (
        <span
          key={name}
          title={`${name} ${percent(share)}`}
          className='h-full transition-[filter] first:rounded-l-full last:rounded-r-full hover:brightness-110'
          style={{ width: `${share * 100}%`, backgroundColor: color }}
        />
      ))}
    </div>
    <ul className='grid grid-cols-2 gap-x-3 gap-y-1 text-xs sm:gap-x-4 sm:text-sm'>
      {languages.map(({ name, share, color }) => (
        <li key={name} className='flex min-w-0 items-center gap-1.5 sm:gap-2'>
          <span
            aria-hidden='true'
            className='size-2.5 shrink-0 rounded-full'
            style={{ backgroundColor: color }}
          />
          <span className='truncate'>{name}</span>
          <span className='text-muted-foreground ml-auto tabular-nums'>
            {percent(share)}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export default LanguagesCard;
