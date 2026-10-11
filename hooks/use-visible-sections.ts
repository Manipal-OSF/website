import { useEffect, useState } from 'react';
const HEADER_OFFSET = 96;

export function useVisibleSections(ids: string[]): string[] {
  const [visible, setVisible] = useState<string[]>([]);
  const key = ids.join();

  useEffect(() => {
    const elements = key
      .split(',')
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const visibleIds = elements
        .filter((element, index) => {
          const start = element.getBoundingClientRect().top;
          const next = elements[index + 1];
          const end = next
            ? next.getBoundingClientRect().top
            : document.documentElement.scrollHeight - window.scrollY;
          return start < window.innerHeight && end > HEADER_OFFSET;
        })
        .map((element) => element.id);
      setVisible((current) =>
        current.join() === visibleIds.join() ? current : visibleIds
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [key]);

  return visible;
}
