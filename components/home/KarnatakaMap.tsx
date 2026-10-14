'use client';

import { Select } from '@base-ui/react/select';
import {
  Check,
  ChevronsUpDown,
  MapPin,
  Maximize,
  Minimize,
  Minus,
  Plus,
} from 'lucide-react';
import type { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

const campuses = {
  manipal: {
    name: 'MIT Manipal',
    address: 'Tiger Circle Road, Madhav Nagar, Manipal 576104',
    lngLat: [74.7873, 13.3524],
  },
  bengaluru: {
    name: 'MIT Bengaluru',
    address: 'Govindapura, Yelahanka, Bengaluru 560064',
    lngLat: [77.5906, 13.1254],
  },
} as const satisfies Record<
  string,
  { name: string; address: string; lngLat: [number, number] }
>;

const regions = [
  {
    id: 'manipal',
    label: 'Manipal',
    center: campuses.manipal.lngLat,
    zoom: 13,
  },
  {
    id: 'bengaluru',
    label: 'Bengaluru',
    center: campuses.bengaluru.lngLat,
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

// Liberty shows buildings, landmarks and street names once zoomed in. 
const lightStyleUrl = 'https://tiles.openfreemap.org/styles/liberty';
const darkStyleUrl = 'https://tiles.openfreemap.org/styles/dark';

type Theme = 'light' | 'dark';

// Hue and minimum saturation of the site's dark palette, given to greys.
const darkHue = 240;
const darkTint = 0.18;

const parseColor = (() => {
  let context: CanvasRenderingContext2D | null = null;
  return (value: string) => {
    context ??= document.createElement('canvas').getContext('2d');
    if (!context) return null;
    // Canvas normalises any CSS colour to #rrggbb or rgba(r, g, b, a), and
    // ignores anything that isn't a colour.
    context.fillStyle = '#010203';
    context.fillStyle = value;
    const normalised = String(context.fillStyle);
    if (normalised === '#010203' && value !== '#010203') return null;
    const [r, g, b, a = 1] = normalised.startsWith('#')
      ? [1, 3, 5].map((i) => parseInt(normalised.slice(i, i + 2), 16))
      : normalised.slice(5, -1).split(',').map(Number);
    return { r: r / 255, g: g / 255, b: b / 255, a };
  };
})();

const toHsl = ({ r, g, b }: { r: number; g: number; b: number }) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h =
    max === r
      ? ((g - b) / d + 6) % 6
      : max === g
      ? (b - r) / d + 2
      : (r - g) / d + 4;
  return { h: h * 60, s, l };
};

type Kind = 'road' | 'water' | 'other';

// Light land becomes dark land and dark text becomes light text, but roads
// stay lighter than the land and water stays darker, so they still stand out.
const darken = (value: string, kind: Kind) => {
  const color = parseColor(value);
  if (!color) return value;
  let { h, s, l } = toHsl(color);
  if (kind === 'road') l = 0.24 + 0.2 * l;
  else if (kind === 'water') l = 0.08 + 0.04 * l;
  else l = 0.13 + 0.75 * (1 - l);
  // Muted colours sit better on a dark background than the light style's.
  s *= kind === 'road' ? 0.4 : 0.35;
  if (s < darkTint) [h, s] = [darkHue, darkTint];
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return `hsla(${Math.round(h)}, ${pct(s)}, ${pct(l)}, ${color.a})`;
};

const darkenValue = (value: unknown, kind: Kind): unknown =>
  typeof value === 'string'
    ? darken(value, kind)
    : Array.isArray(value)
    ? value.map((item) => darkenValue(item, kind))
    : value;

const toDark = (light: StyleSpecification): StyleSpecification => {
  const style = structuredClone(light);
  for (const layer of style.layers) {
    if (layer.type === 'raster') {
      layer.paint = { ...layer.paint, 'raster-brightness-max': 0.25 };
      continue;
    }
    if (!('paint' in layer) || !layer.paint) continue;
    const kind: Kind =
      layer.type === 'line' && /^(road|tunnel|bridge|aeroway)_/.test(layer.id)
        ? 'road'
        : /^water/.test(layer.id) && layer.type !== 'symbol'
        ? 'water'
        : 'other';
    const paint = layer.paint as Record<string, unknown>;
    for (const key of Object.keys(paint))
      if (key.endsWith('color')) paint[key] = darkenValue(paint[key], kind);
  }
  return style;
};

const loadStyles = async (): Promise<
  Record<Theme, StyleSpecification | string>
> => {
  try {
    const response = await fetch(lightStyleUrl);
    if (!response.ok) throw new Error(response.statusText);
    const light = (await response.json()) as StyleSpecification;
    return { light, dark: toDark(light) };
  } catch {
    return { light: lightStyleUrl, dark: darkStyleUrl };
  }
};

const controlClassName =
  'text-foreground hover:bg-muted hover:text-primary focus-visible:ring-ring/50 flex size-9 cursor-pointer items-center justify-center transition-colors outline-none focus-visible:ring-3 disabled:cursor-default disabled:opacity-50 [&>svg]:size-5';

const currentTheme = (): Theme =>
  document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark'
    : 'light';

const KarnatakaMap = () => {
  const root = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const [region, setRegion] = useState<RegionId>('manipal');
  const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const sync = () =>
      setFullscreen(document.fullscreenElement === root.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | undefined;

    (async () => {
      const [{ Map, Marker, Popup, setWorkerUrl }, loadedStyles] =
        await Promise.all([import('maplibre-gl'), loadStyles()]);
      setWorkerUrl(
        new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).href
      );
      if (cancelled || !container.current) return;

      let theme = currentTheme();
      const start = regions[0];
      const instance = new Map({
        container: container.current,
        style: loadedStyles[theme],
        center: [...start.center],
        zoom: start.zoom,
        minZoom: 4,
        maxZoom: 18,
        attributionControl: { compact: true },
        fadeDuration: 0,
        // One finger (or a plain mouse wheel) scrolls the page instead of
        // getting stuck in the map; two fingers or Ctrl/⌘ + wheel move it.
        cooperativeGestures: true,
      });
      map.current = instance;
      // Label the canvas
      instance
        .getCanvas()
        .setAttribute(
          'aria-label',
          'Map of Karnataka with the Manipal and Bengaluru campuses marked'
        );

      instance.setMissingStyleImageResolver((id) => {
        if (!instance.hasImage(id))
          instance.addImage(id, {
            width: 1,
            height: 1,
            data: new Uint8Array(4),
          });
      });
      instance.once('load', () => {
        setLoaded(true);
        container.current
          ?.querySelector('.maplibregl-compact-show')
          ?.classList.remove('maplibregl-compact-show');
      });

      for (const { name, address, lngLat } of Object.values(campuses)) {
        const pin = document.createElement('button');
        pin.type = 'button';
        pin.className = 'map-pin';
        pin.setAttribute('aria-label', `${name}, ${address}`);

        const details = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = name;
        const line = document.createElement('p');
        line.textContent = address;
        const directions = document.createElement('a');
        directions.href = `https://www.openstreetmap.org/?mlat=${lngLat[1]}&mlon=${lngLat[0]}#map=17/${lngLat[1]}/${lngLat[0]}`;
        directions.target = '_blank';
        directions.rel = 'noreferrer';
        directions.textContent = 'Open in OpenStreetMap';
        details.append(title, line, directions);

        new Marker({ element: pin })
          .setLngLat([...lngLat])
          .setPopup(
            new Popup({
              offset: 12,
              closeButton: false,
              maxWidth: '14rem',
            }).setDOMContent(details)
          )
          .addTo(instance);
      }

      // Follow the site theme, which ThemeToggle sets on <html>.
      observer = new MutationObserver(() => {
        const next = currentTheme();
        if (next === theme) return;
        theme = next;
        instance.setStyle(loadedStyles[next]);
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
    // Region picks also undo any tilt or rotation from exploring.
    const level = { ...camera, pitch: 0, bearing: 0 };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      map.current.jumpTo(level);
    else map.current.flyTo({ ...level, duration: 2000, essential: false });
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void root.current?.requestFullscreen();
  };

  return (
    <div ref={root} className='bg-background absolute inset-0'>
      <div
        ref={container}
        className='h-full w-full transition-opacity duration-500 data-[loaded=false]:opacity-0'
        data-loaded={loaded}
      />
      <div className='bg-background absolute top-2 right-2 z-10 flex flex-col divide-y-2 overflow-hidden rounded-lg border-2 shadow-md'>
        <button
          type='button'
          aria-label='Zoom in'
          title='Zoom in'
          className={controlClassName}
          disabled={!loaded}
          onClick={() => map.current?.zoomIn()}
        >
          <Plus aria-hidden='true' strokeWidth={2.5} />
        </button>
        <button
          type='button'
          aria-label='Zoom out'
          title='Zoom out'
          className={controlClassName}
          disabled={!loaded}
          onClick={() => map.current?.zoomOut()}
        >
          <Minus aria-hidden='true' strokeWidth={2.5} />
        </button>
        <button
          type='button'
          aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          className={controlClassName}
          onClick={toggleFullscreen}
        >
          {fullscreen ? (
            <Minimize aria-hidden='true' />
          ) : (
            <Maximize aria-hidden='true' />
          )}
        </button>
      </div>
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
