export const siteName = 'Manipal OSF';

export const siteUrl = 'https://manipalosf.org';

export const siteDescription =
  'An open-source initiative led by the students of MIT Manipal for democratizing free software & material.';

export const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Team', href: '/team' },
  { label: 'Blog', href: '/blog' },
] as const;

type NavItem = (typeof navItems)[number];

// Sections without their own nav item, highlighted under another one.
const sectionAliases: Record<string, string> = { '/authors': '/blog' };

const isWithin = (pathname: string, href: string) =>
  pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

export function activeNavItem(pathname: string): NavItem | undefined {
  for (const [prefix, target] of Object.entries(sectionAliases)) {
    if (isWithin(pathname, prefix)) pathname = target;
  }
  return navItems.find((item) => isWithin(pathname, item.href));
}

export const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/manipalosf/' },
  { label: 'GitHub', href: 'https://github.com/Manipal-OSF' },
  { label: 'Discord', href: 'https://discord.gg/wk52CxvSj8' },
  {
    label: 'MS Teams',
    href: 'https://teams.cloud.microsoft/l/channel/19%3ATL33jeLE7fX2AMyd610G_9_LOEWe2fNZ4TBIrHlo8_Q1%40thread.tacv2/General?groupId=ea86aefe-31d7-41c4-ba6b-512594ff6c2a&tenantId=29bebd42-f1ff-4c3d-9688-067e3460dc1f',
  },
] as const;
