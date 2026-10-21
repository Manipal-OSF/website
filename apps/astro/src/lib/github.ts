import { AsyncLocalStorage } from 'node:async_hooks';
import { env } from '@packages/env';

export const githubOrg = 'Manipal-OSF';

const API = 'https://api.github.com';
const DAY = 24 * 60 * 60 * 1000;
// Weeks shown in the activity calendar, ending with the current week.
export const ACTIVITY_WEEKS = 26;

interface Repo {
  name: string;
  fork: boolean;
  size: number;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
}

export interface LanguageShare {
  name: string;
  bytes: number;
  share: number;
  color: string;
}

export interface OrgStats {
  repos: number;
  stars: number;
  forks: number;
  followers: number;
  since: number;
  languages: LanguageShare[];
  // Commits per UTC day, oldest first, starting on a Sunday.
  activity: { date: string; count: number }[];
  totalCommits: number;
}

// Colors from GitHub Linguist, so the bar matches the colors on GitHub.
const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572a5',
  Rust: '#dea584',
  Svelte: '#ff3e00',
  CSS: '#663399',
  HTML: '#e34c26',
  PHP: '#4f5d95',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  'F#': '#b845fc',
  Go: '#00add8',
  Java: '#b07219',
  Kotlin: '#a97bff',
  C: '#555555',
  'C++': '#f34b7d',
  Dart: '#00b4ab',
  Vue: '#41b883',
  Astro: '#ff5a03',
  Lua: '#000080',
  Nix: '#7e7eff',
  'Jupyter Notebook': '#da5b0b',
};
// Linguist counts these as languages, but they are documents rather than code.
const ignoredLanguages = new Set(['Rich Text Format', 'Markdown', 'TeX']);
const MAX_LANGUAGES = 6;

const requests = new AsyncLocalStorage<Map<string, Promise<Response>>>();

/** Share concurrent GitHub reads within a page render; Vercel ISR caches pages. */
export function withGitHubRender<T>(
  _request: Request,
  action: () => Promise<T>,
) {
  return requests.run(new Map(), action);
}
async function ghResponse(path: string): Promise<Response> {
  const key = `${API}${path}`;
  const cache = requests.getStore();
  let response = cache?.get(key);
  if (!response) {
    response = fetch(key, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(env.GITHUB_TOKEN && {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        }),
      },
      signal: AbortSignal.timeout(10_000),
    }).then((res) => {
      if (!res.ok) throw new Error(`GitHub ${path} returned ${res.status}`);
      return res;
    });
    cache?.set(key, response);
  }
  return (await response).clone();
}
async function gh<T>(path: string): Promise<T> {
  return (await ghResponse(path)).json() as Promise<T>;
}

function aggregateLanguages(
  perRepo: Record<string, number>[],
): LanguageShare[] {
  const totals = new Map<string, number>();
  for (const languages of perRepo) {
    for (const [name, bytes] of Object.entries(languages)) {
      if (ignoredLanguages.has(name)) continue;
      totals.set(name, (totals.get(name) ?? 0) + bytes);
    }
  }
  const sorted = [...totals].sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (!total) return [];

  const top = sorted.slice(0, MAX_LANGUAGES);
  const rest = sorted.slice(MAX_LANGUAGES).reduce((s, [, b]) => s + b, 0);
  const shares = top.map(([name, bytes]) => ({
    name,
    bytes,
    share: bytes / total,
    color: languageColors[name] ?? 'var(--muted-foreground)',
  }));
  if (rest)
    shares.push({
      name: 'Other',
      bytes: rest,
      share: rest / total,
      color: 'var(--border)',
    });
  return shares;
}

// The calendar starts on the Sunday ACTIVITY_WEEKS - 1 weeks before this one.
function activityStart(now: Date) {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  start.setUTCDate(start.getUTCDate() - (ACTIVITY_WEEKS - 1) * 7);
  return start;
}

// Fetches every page of a list endpoint, up to a limit of pages.
async function ghList<T>(path: string, maxPages: number) {
  const items: T[] = [];
  const separator = path.includes('?') ? '&' : '?';
  for (let page = 1; page <= maxPages; page++) {
    const batch = await gh<T[]>(`${path}${separator}per_page=100&page=${page}`);
    items.push(...batch);
    if (batch.length < 100) break;
  }
  return items;
}

async function commitDates(repo: string, since: string): Promise<string[]> {
  // Five pages of 100 is far more than any of our repos sees in half a year.
  const commits = await ghList<{
    commit: { committer: { date: string } | null };
  }>(`/repos/${githubOrg}/${repo}/commits?since=${since}`, 5);
  // `since` filters on the committer date, so bucket by it too.
  return commits.flatMap(({ commit }) =>
    commit.committer ? [commit.committer.date.slice(0, 10)] : [],
  );
}

// One unusual repository, such as an empty one (409) or one deleted since the
// list was fetched (404), should not hide the statistics of all the others.
const orDefault = <T>(promise: Promise<T>, fallback: T) =>
  promise.catch((error: unknown) => {
    console.warn(error);
    return fallback;
  });

async function getActivity(repos: Repo[]) {
  const start = activityStart(new Date());
  const since = start.toISOString();
  const active = repos.filter(
    (repo) => repo.size > 0 && repo.pushed_at >= since,
  );
  const dates = (
    await Promise.all(
      active.map((repo) => orDefault(commitDates(repo.name, since), [])),
    )
  ).flat();

  const counts = new Map<string, number>();
  for (const date of dates) counts.set(date, (counts.get(date) ?? 0) + 1);

  const today = new Date().toISOString().slice(0, 10);
  const activity = [];
  for (let t = start.getTime(); ; t += DAY) {
    const date = new Date(t).toISOString().slice(0, 10);
    if (date > today) break;
    activity.push({ date, count: counts.get(date) ?? 0 });
  }
  // Counted from the calendar so the total always matches the squares.
  const totalCommits = activity.reduce((sum, day) => sum + day.count, 0);
  return { activity, totalCommits };
}

// Data-driven pages return an uncached 503 fallback on failure. Vercel ISR
// treats failed regeneration as an error, retaining the last successful page.
export function unavailableData<T>(
  error: unknown,
  fallback: T,
  what: string,
): T {
  console.warn(`Failed to load ${what}:`, error);
  return fallback;
}

export async function getOrgStats(): Promise<OrgStats | null> {
  try {
    const [org, repos] = await Promise.all([
      gh<{ public_repos: number; followers: number; created_at: string }>(
        `/orgs/${githubOrg}`,
      ),
      ghList<Repo>(`/orgs/${githubOrg}/repos?type=public`, 10),
    ]);
    // Forks mostly contain other projects' code, so they are left out.
    const own = repos.filter((repo) => !repo.fork);
    const [languages, activity] = await Promise.all([
      Promise.all(
        own.map((repo) =>
          orDefault(
            gh<Record<string, number>>(
              `/repos/${githubOrg}/${repo.name}/languages`,
            ),
            {},
          ),
        ),
      ).then(aggregateLanguages),
      getActivity(own),
    ]);

    return {
      repos: org.public_repos,
      stars: own.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      forks: own.reduce((sum, repo) => sum + repo.forks_count, 0),
      followers: org.followers,
      since: new Date(org.created_at).getUTCFullYear(),
      languages,
      ...activity,
    };
  } catch (error) {
    return unavailableData(error, null, 'GitHub statistics');
  }
}

interface Contributor {
  login: string;
  type: string;
  contributions: number;
}

// People with commits to a repository, most commits first, without bots.
async function contributors(repo: string): Promise<Contributor[]> {
  const list = await ghList<Contributor>(
    `/repos/${githubOrg}/${repo}/contributors`,
    5,
  );
  return list.filter((contributor) => contributor.type !== 'Bot');
}

export interface RepoHistory {
  contributors: string[];
  // ISO dates of the first and latest commits.
  first: string;
  last: string;
  archived: boolean;
}

export async function getRepoHistory(repo: string): Promise<RepoHistory> {
  const path = `/repos/${githubOrg}/${repo}/commits?per_page=1`;
  type Commit = { commit: { committer: { date: string } } };
  const [newestPage, people, { archived }] = await Promise.all([
    ghResponse(path),
    contributors(repo),
    gh<{ archived: boolean }>(`/repos/${githubOrg}/${repo}`),
  ]);
  const [newest] = (await newestPage.json()) as Commit[];
  const lastPage = newestPage.headers
    .get('link')
    ?.match(/[?&]page=(\d+)>; rel="last"/)?.[1];
  const [oldest] = lastPage
    ? await gh<Commit[]>(`${path}&page=${lastPage}`)
    : [newest];
  return {
    contributors: people.map(({ login }) => login),
    first: oldest.commit.committer.date,
    last: newest.commit.committer.date,
    archived,
  };
}

export async function getCommunity(): Promise<string[]> {
  const [repos, members] = await Promise.all([
    ghList<Repo>(`/orgs/${githubOrg}/repos?type=public`, 10),
    ghList<{ login: string }>(`/orgs/${githubOrg}/members`, 5),
  ]);
  const perRepo = await Promise.all(
    repos
      .filter((repo) => !repo.fork && repo.size > 0)
      .map((repo) => orDefault(contributors(repo.name), [])),
  );

  const totals = new Map<string, number>();
  for (const { login, contributions } of perRepo.flat())
    totals.set(login, (totals.get(login) ?? 0) + contributions);
  for (const { login } of members) if (!totals.has(login)) totals.set(login, 0);

  return [...totals]
    .sort(
      ([a, x], [b, y]) =>
        y - x || a.localeCompare(b, 'en', { sensitivity: 'base' }),
    )
    .map(([login]) => login);
}
