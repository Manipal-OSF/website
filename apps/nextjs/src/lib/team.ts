import 'server-only';
import {
  duringBuild,
  getCommunity,
  getRepoHistory,
  githubOrg,
  type RepoHistory,
} from './github';
import {
  github,
  timeline as sources,
  type Milestone,
  type MilestoneSource,
  type Person,
  type TimelineYear,
} from './timeline';

const TOP_CONTRIBUTORS = 5;
const ACTIVE_DAYS = 90;
const DAY = 24 * 60 * 60 * 1000;

const month = (date: Date) =>
  date.toLocaleString('en', { month: 'long', timeZone: 'UTC' });
const monthYear = (date: Date) => `${month(date)} ${date.getUTCFullYear()}`;

function formatSpan({ first, last, archived }: RepoHistory, now: number) {
  const start = new Date(first);
  const end = new Date(last);
  if (!archived && now - end.getTime() < ACTIVE_DAYS * DAY)
    return `${monthYear(start)} – present`;
  if (start.getUTCFullYear() !== end.getUTCFullYear())
    return `${monthYear(start)} – ${monthYear(end)}`;
  if (start.getUTCMonth() !== end.getUTCMonth())
    return `${month(start)} – ${month(end)}`;
  return month(start);
}

const repoLink = (repo: string) => ({
  label: `${githubOrg}/${repo}`,
  href: `https://github.com/${githubOrg}/${repo}`,
});

const loginOf = (person: Person) => person.login ?? person.name;

async function resolve(
  { repo, ...milestone }: MilestoneSource,
  now: number
): Promise<Milestone> {
  if (!repo) return milestone;
  const history = await getRepoHistory(repo);
  const listed = new Set((milestone.people ?? []).map(loginOf));
  const people = [
    ...history.contributors
      .filter((login) => !listed.has(login))
      .slice(0, TOP_CONTRIBUTORS)
      .map((login) => github(login)),
    ...(milestone.people ?? []),
  ];
  return {
    ...milestone,
    when: milestone.when ?? formatSpan(history, now),
    people,
    link: milestone.link ?? repoLink(repo),
  };
}

// Founders and owners named on the timeline itself, rather than as a project's contributors, thus are left out of the community list below it.
const featured = new Set(
  sources
    .flatMap((year) => year.milestones)
    .filter((milestone) => !milestone.repo)
    .flatMap((milestone) => milestone.people ?? [])
    .map(loginOf)
);

const offline = (): TimelineYear[] =>
  sources.map(({ year, milestones }) => ({
    year,
    milestones: milestones.map(({ repo, ...milestone }) => ({
      ...milestone,
      link: milestone.link ?? (repo ? repoLink(repo) : undefined),
    })),
  }));

export async function getTeam(): Promise<{
  timeline: TimelineYear[];
  community: Person[];
}> {
  const now = Date.now();
  try {
    const [timeline, logins] = await Promise.all([
      Promise.all(
        sources.map(async ({ year, milestones }) => ({
          year,
          milestones: await Promise.all(
            milestones.map((milestone) => resolve(milestone, now))
          ),
        }))
      ),
      getCommunity(),
    ]);
    const community = logins
      .filter((login) => !featured.has(login))
      .map((login) => github(login));
    return { timeline, community };
  } catch (error) {
    return duringBuild(
      error,
      { timeline: offline(), community: [] },
      'team data from GitHub'
    );
  }
}
