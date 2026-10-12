'use client';

import { Select } from '@base-ui/react/select';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

const campuses = {
  manipal: [74.7873, 13.3524], // Tiger Circle Road, Madhav Nagar, Manipal 576104
  bengaluru: [77.5906, 13.1254], // Govindapura, Yelahanka, Bengaluru 560064
} as const satisfies Record<string, [number, number]>;

const regions = [
  { id: 'manipal', label: 'Manipal', center: campuses.manipal, zoom: 13 },
  {
    id: 'bengaluru',
    label: 'Bengaluru',
    center: campuses.bengaluru,
    zoom: 13,
  },
  // The whole state is framed by its bounds, since the cell's shape varies.
  {
    id: 'karnataka',
    label: 'Karnataka',
    bounds: [
      [74.05, 11.6],
      [78.6, 18.45],
    ],
  },
] as const satisfies ({ id: string; label: string } & (
  | { center: readonly [number, number]; zoom: number }
  | { bounds: [[number, number], [number, number]] }
))[];

type RegionId = (typeof regions)[number]['id'];

const styles = {
  light: {
    url: 'https://tiles.openfreemap.org/styles/positron',
    background: '#eceff4',
    water: '#c8d3e0',
  },
  dark: {
    url: 'https://tiles.openfreemap.org/styles/dark',
    background: '#181825',
    water: '#11111b',
  },
};

const currentTheme = (): keyof typeof styles =>
  document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark'
    : 'light';

const KarnatakaMap = () => {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const [region, setRegion] = useState<RegionId>('manipal');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | undefined;

    (async () => {
      const { Map, Marker, setWorkerUrl } = await import('maplibre-gl');
      setWorkerUrl(
        new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).href
      );
      if (cancelled || !container.current) return;

      let theme = currentTheme();
      const start = regions[0];
      const instance = new Map({
        container: container.current,
        style: styles[theme].url,
        center: [...start.center],
        zoom: start.zoom,
        interactive: false,
        attributionControl: { compact: true },
        fadeDuration: 0,
      });
      map.current = instance;
      // Label the canvas
      instance
        .getCanvas()
        .setAttribute(
          'aria-label',
          'Map of Karnataka with the Manipal and Bengaluru campuses marked'
        );

      const tint = () => {
        const palette = styles[currentTheme()];
        if (instance.getLayer('background'))
          instance.setPaintProperty(
            'background',
            'background-color',
            palette.background
          );
        if (instance.getLayer('water'))
          instance.setPaintProperty('water', 'fill-color', palette.water);
      };
      instance.setMissingStyleImageResolver((id) => {
        if (!instance.hasImage(id))
          instance.addImage(id, {
            width: 1,
            height: 1,
            data: new Uint8Array(4),
          });
      });
      instance.on('style.load', tint);
      instance.once('load', () => {
        setLoaded(true);
        container.current
          ?.querySelector('.maplibregl-compact-show')
          ?.classList.remove('maplibregl-compact-show');
      });

      for (const lngLat of Object.values(campuses)) {
        const pin = document.createElement('div');
        pin.className = 'map-pin';
        pin.setAttribute('aria-hidden', 'true');
        new Marker({ element: pin }).setLngLat([...lngLat]).addTo(instance);
      }

      // Follow the site theme, which ThemeToggle sets on <html>.
      observer = new MutationObserver(() => {
        const next = currentTheme();
        if (next === theme) return;
        theme = next;
        instance.setStyle(styles[next].url);
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const goTo = (id: RegionId) => {
    setRegion(id);
    const target = regions.find((r) => r.id === id);
    if (!target || !map.current) return;
    const camera =
      'bounds' in target
        ? map.current.cameraForBounds(target.bounds, { padding: 16 })
        : { center: [...target.center] as [number, number], zoom: target.zoom };
    if (!camera) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      map.current.jumpTo(camera);
    else map.current.flyTo({ ...camera, duration: 2000, essential: false });
  };

  return (
    <div className='absolute inset-0'>
      <div
        ref={container}
        className='h-full w-full transition-opacity duration-500 data-[loaded=false]:opacity-0'
        data-loaded={loaded}
      />
      <Select.Root
        items={regions.map(({ id, label }) => ({ value: id, label }))}
        value={region}
        onValueChange={(value) => value && goTo(value)}
        disabled={!loaded}
      >
        <Select.Trigger className='bg-background/85 focus-visible:ring-ring/50 data-popup-open:border-primary/50 hover:border-primary/50 absolute bottom-2 left-2 z-10 flex cursor-pointer items-center gap-1.5 rounded-lg border-2 px-2 py-1 text-xs backdrop-blur-sm transition-colors outline-none focus-visible:ring-3 disabled:cursor-default'>
          <MapPin aria-hidden='true' className='text-primary size-3.5' />
          <span className='text-muted-foreground'>Show</span>
          <Select.Value className='text-foreground font-medium' />
          <Select.Icon className='text-muted-foreground'>
            <ChevronsUpDown className='size-3.5' />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            side='top'
            align='start'
            sideOffset={6}
            alignItemWithTrigger={false}
            className='z-50 outline-none'
          >
            <Select.Popup className='bg-background/95 text-foreground min-w-(--anchor-width) origin-(--transform-origin) rounded-lg border-2 p-1 text-xs shadow-md backdrop-blur-sm transition-[opacity,scale] duration-150 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none'>
              <Select.List>
                {regions.map(({ id, label }) => (
                  <Select.Item
                    key={id}
                    value={id}
                    className='data-highlighted:bg-muted data-selected:text-primary grid cursor-pointer grid-cols-[0.875rem_1fr] items-center gap-1.5 rounded-md py-1.5 pr-3 pl-1.5 outline-none select-none'
                  >
                    <Select.ItemIndicator className='col-start-1'>
                      <Check aria-hidden='true' className='size-3.5' />
                    </Select.ItemIndicator>
                    <Select.ItemText className='col-start-2 font-medium'>
                      {label}
                    </Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};

export default KarnatakaMap;
