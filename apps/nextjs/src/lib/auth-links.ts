import { safeForumReturn } from './forum-validation';

export function authHref(
  path:
    | '/login'
    | '/signup'
    | '/verify-email'
    | '/forgot-password'
    | '/reset-password',
  returnTo?: string | null,
) {
  return `${path}?${new URLSearchParams({ next: safeForumReturn(returnTo) })}`;
}

export function verificationEmailUrl(url: string) {
  const link = new URL(url);
  const callback = authHref(
    '/verify-email',
    link.searchParams.get('callbackURL'),
  );
  link.searchParams.set(
    'callbackURL',
    new URL(`${callback}&verified=1`, link.origin).href,
  );
  return link.href;
}
