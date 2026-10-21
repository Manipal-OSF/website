const links = [
  ...document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'),
];
const headings = [...new Set(links.map((link) => link.dataset.heading!))]
  .map((id) => document.getElementById(id))
  .filter((element): element is HTMLElement => !!element);
let frame = 0;
const update = () => {
  frame = 0;
  const visible = headings.filter((heading, index) => {
    const top = heading.getBoundingClientRect().top;
    const end =
      headings[index + 1]?.getBoundingClientRect().top ??
      document.documentElement.scrollHeight - scrollY;
    return top < innerHeight && end > 96;
  });
  const ids = new Set(visible.map((heading) => heading.id));
  for (const link of links) {
    const active = ids.has(link.dataset.heading!);
    link.classList.toggle('text-foreground', active);
    link.classList.toggle('text-foreground/60', !active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  const label = document.querySelector('[data-reading-section]');
  if (label)
    label.textContent =
      visible.map((heading) => heading.textContent).join(', ') || 'Overview';
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  const progress =
    scrollable > 0 ? Math.min(1, Math.max(0, scrollY / scrollable)) : 0;
  document
    .querySelector('[data-reading-progress]')
    ?.setAttribute(
      'stroke-dashoffset',
      String(2 * Math.PI * 10 * (1 - progress)),
    );
  document
    .querySelector('[data-reading-ring]')
    ?.setAttribute('aria-label', `${Math.round(progress * 100)}% read`);
};
const schedule = () => {
  if (!frame) frame = requestAnimationFrame(update);
};
update();
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule, { passive: true });
for (const link of links)
  link.addEventListener('click', () => {
    const details = link.closest<HTMLDetailsElement>('[data-mobile-toc]');
    if (details) details.open = false;
  });
export {};
