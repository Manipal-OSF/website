export const siteName = 'Manipal OSF';

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
] as const;
