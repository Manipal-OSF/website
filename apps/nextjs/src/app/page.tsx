import { BookMarked, GitFork, Star, Users, UsersRound } from 'lucide-react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import BrandIcon from '@/components/common/BrandIcon';
import JsonLd from '@/components/common/JsonLd';
import Link from 'next/link';
import CoverImage from '@/components/blog/CoverImage';
import ActivityCard from '@/components/home/ActivityCard';
import BentoCell from '@/components/home/BentoCell';
import KarnatakaMap from '@/components/home/KarnatakaMap';
import LanguagesCard from '@/components/home/LanguagesCard';
import LinkCell from '@/components/home/LinkCell';
import Logo from '@/components/layout/Logo';
import { getPublishedPosts } from '@/lib/content/posts';
import { formatDate } from '@/lib/format';
import { getOrgStats, githubOrg } from '@/lib/github';
import { absoluteUrl, pageMetadata } from '@/lib/seo';
import { siteDescription, siteName, siteUrl, socialLinks } from '@/lib/site';

// Re-render hourly; GitHub responses themselves are cached for a day.
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  description: siteDescription,
  path: '/',
});

const organization = {
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  name: siteName,
  url: siteUrl,
  logo: absoluteUrl('/logo.png'),
  description: siteDescription,
  sameAs: socialLinks
    .filter(({ label }) => label === 'GitHub' || label === 'Instagram')
    .map(({ href }) => href),
};

const website = {
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  name: siteName,
  url: siteUrl,
  description: siteDescription,
  publisher: { '@id': organization['@id'] },
};

const href = (label: (typeof socialLinks)[number]['label']) =>
  socialLinks.find((link) => link.label === label)!.href;

const Stat = ({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: number;
  label: string;
}) => (
  <div className='flex flex-col'>
    <dt className='text-muted-foreground order-last flex items-center gap-1 text-xs [&>svg]:hidden [&>svg]:size-3 [&>svg]:shrink-0 @[9rem]:[&>svg]:block'>
      {icon}
      {label}
    </dt>
    <dd className='text-2xl font-semibold tabular-nums sm:text-3xl'>{value}</dd>
  </div>
);

const Unavailable = ({ children }: { children: ReactNode }) => (
  <p className='text-muted-foreground grid h-full place-items-center p-4 text-center text-sm'>
    {children}
  </p>
);

export default async function HomePage() {
  const [stats, posts] = await Promise.all([
    getOrgStats(),
    getPublishedPosts(),
  ]);
  const latest = posts[0];

  return (
    <div className='bento py-2'>
      <JsonLd data={{ '@graph': [organization, website] }} />
      <BentoCell
        area='about'
        className='flex flex-col justify-center gap-3 p-5'
      >
        <h1 className='text-2xl font-semibold sm:text-3xl'>
          Hello, We are <span className='text-primary'>{siteName}</span>
        </h1>
        <p className='text-muted-foreground text-sm text-pretty sm:text-base'>
          An open-source initiative led by the students of MIT for democratizing
          free software &amp; material
        </p>
      </BentoCell>

      <BentoCell
        area='logo'
        className='text-primary grid place-items-center'
        note={
          stats ? `Established & Active since ${stats.since}` : 'Hello there!'
        }
        noteClassName='bottom-3 left-3'
      >
        <Logo className='size-2/3 max-w-40 transition-transform duration-500 group-hover:-rotate-6 motion-reduce:transition-none' />
      </BentoCell>

      <BentoCell area='stats' className='p-3 sm:p-4'>
        {stats ? (
          <div className='@container flex h-full flex-col justify-between gap-2'>
            <h2 className='text-muted-foreground text-sm sm:text-base'>
              All time stats
            </h2>
            <dl className='grid grid-cols-2 gap-x-2 gap-y-2 sm:gap-x-3'>
              <Stat icon={<BookMarked />} value={stats.repos} label='repos' />
              <Stat icon={<Star />} value={stats.stars} label='stars' />
              <Stat icon={<GitFork />} value={stats.forks} label='forks' />
              <Stat
                icon={<Users />}
                value={stats.followers}
                label='followers'
              />
            </dl>
          </div>
        ) : (
          <Unavailable>
            GitHub statistics are unavailable right now.
          </Unavailable>
        )}
      </BentoCell>

      <BentoCell area='post'>
        <Link
          href={latest ? `/blog/${latest.id}` : '/blog'}
          className='flex h-full flex-col'
        >
          <CoverImage
            src={latest?.coverImage ?? null}
            alt=''
            sizes='(min-width: 64rem) 32rem, 100vw'
            className='absolute inset-0 aspect-auto transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none'
          />
          <div className='from-card via-card/90 relative mt-auto flex flex-col gap-1 bg-gradient-to-t to-transparent p-4 pt-12'>
            <span className='text-primary text-xs font-medium'>
              Latest post
            </span>
            <h2 className='line-clamp-2 text-lg font-medium'>
              {latest?.title ?? 'Read our blog'}
            </h2>
            {latest && (
              <p className='text-muted-foreground text-xs'>
                {formatDate(latest.publishDate)} · {latest.readingTime}
              </p>
            )}
          </div>
        </Link>
      </BentoCell>

      <BentoCell
        area='map'
        note='We accept members from both campuses!'
        noteClassName='top-3 left-3'
      >
        <KarnatakaMap />
      </BentoCell>

      <BentoCell area='langs'>
        {stats?.languages.length ? (
          <LanguagesCard languages={stats.languages} />
        ) : (
          <Unavailable>
            Language statistics are unavailable right now.
          </Unavailable>
        )}
      </BentoCell>

      <BentoCell area='activity'>
        {stats ? (
          <ActivityCard
            activity={stats.activity}
            totalCommits={stats.totalCommits}
          />
        ) : (
          <Unavailable>Commit activity is unavailable right now.</Unavailable>
        )}
      </BentoCell>

      <LinkCell
        area='github'
        href={href('GitHub')}
        image='/github.webp'
        icon={<BrandIcon brand='GitHub' />}
        title='GitHub'
        detail={`@${githubOrg}`}
        note='Star a repo!'
      />
      <LinkCell
        area='discord'
        href={href('Discord')}
        image='/discord.png'
        icon={<BrandIcon brand='Discord' />}
        title='Discord'
        detail='Join the server'
        note='Come say hi!'
      />
      <LinkCell
        area='teams'
        href={href('MS Teams')}
        image='/team.png'
        icon={<BrandIcon brand='MS Teams' />}
        title='MS Teams'
        detail='Join the channel'
      />
      <LinkCell
        area='team'
        href='/team'
        image='/team.jpg'
        icon={<UsersRound />}
        title='Our team'
        detail='Meet the people behind OSF'
      />
    </div>
  );
}
