import type { Metadata } from 'next';
import JsonLd from '@/components/common/JsonLd';
import MemberLoop from '@/components/team/MemberLoop';
import Timeline from '@/components/team/Timeline';
import { absoluteUrl, pageMetadata } from '@/lib/seo';
import { getTeam } from '@/lib/team';
import { siteName, siteUrl } from '@/lib/site';
import type { Person } from '@/lib/timeline';

export const revalidate = 86400;

const description = `The story of ${siteName}, from its founding in 2021 to today.`;

export const metadata: Metadata = pageMetadata({
  title: 'Team',
  description,
  path: '/team',
});

const person = ({ name, href }: Person) => ({
  '@type': 'Person',
  name,
  ...(href && { url: href.startsWith('/') ? absoluteUrl(href) : href }),
});

export default async function TeamPage() {
  const { timeline, community } = await getTeam();
  const first = timeline[0].year;
  const founders = timeline[0].milestones
    .flatMap((milestone) => milestone.people ?? [])
    .filter(({ role }) => role === 'founder' || role === 'co-founder');

  return (
    <div className='mx-auto flex w-full max-w-4xl flex-col gap-16 py-8 md:gap-24 md:py-12'>
      <JsonLd
        data={{
          '@type': 'AboutPage',
          name: `Team | ${siteName}`,
          url: absoluteUrl('/team'),
          description,
          isPartOf: { '@id': `${siteUrl}/#website` },
          mainEntity: {
            '@type': 'Organization',
            '@id': `${siteUrl}/#organization`,
            name: siteName,
            foundingDate: String(first),
            founder: founders.map(person),
            member: community.map(person),
          },
        }}
      />
      <header className='flex flex-col gap-4'>
        <h1 className='text-3xl font-semibold text-balance sm:text-5xl'>
          Established since <span className='text-awesome'>{first}</span>
        </h1>
        <p className='text-muted-foreground max-w-xl text-sm text-pretty sm:text-base'>
          A timeline of all events and projects undertaken by OSF thus far.
        </p>
      </header>

      <Timeline data={timeline} />

      {community.length > 0 && (
        <section className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-lg font-medium'>Our community</h2>
            <p className='text-muted-foreground text-sm'>
              All the other members and contributors who form our large
              community.
            </p>
          </div>
          <MemberLoop people={community} />
        </section>
      )}
    </div>
  );
}
