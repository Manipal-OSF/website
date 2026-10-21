import type { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';
import { campuses, regions, lightStyleUrl, darkStyleUrl } from '@/lib/map';
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

const currentTheme = (): Theme =>
  document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark'
    : 'light';

class CampusMap extends HTMLElement {
  connectedCallback() {
    const container = this.querySelector<HTMLElement>('[data-map-canvas]')!;
    const fallback = this.querySelector<HTMLElement>('[data-map-fallback]')!;
    const controls = this.querySelector<HTMLElement>('[data-map-controls]')!;
    const select = this.querySelector<HTMLSelectElement>('select')!;
    let map: MapLibreMap | undefined;
    let themeObserver: MutationObserver | undefined;
    let disposed = false;
    const fail = () => {
      container.hidden = true;
      controls.hidden = true;
      select.closest<HTMLElement>('[data-map-picker]')!.hidden = true;
      fallback.hidden = false;
    };
    const initialize = async () => {
      try {
        const [{ Map, Marker, Popup }, styles] = await Promise.all([
          import('../components/home/maplibre'),
          loadStyles(),
        ]);
        if (disposed) return;
        let theme = currentTheme();
        map = new Map({
          container,
          style: styles[theme],
          center: [...campuses.manipal.lngLat],
          zoom: 13,
          minZoom: 4,
          maxZoom: 18,
          attributionControl: { compact: true },
          fadeDuration: 0,
          cooperativeGestures: true,
        });
        const instance = map;
        instance
          .getCanvas()
          .setAttribute(
            'aria-label',
            'Map of Karnataka with the Manipal and Bengaluru campuses marked',
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
          container.dataset.loaded = 'true';
          for (const button of controls.querySelectorAll<HTMLButtonElement>(
            '[data-zoom]',
          ))
            button.disabled = false;
          select.disabled = false;
          container
            .querySelector('.maplibregl-compact-show')
            ?.classList.remove('maplibregl-compact-show');
        });
        instance.on('error', () => {
          if (container.dataset.loaded !== 'true') fail();
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
              }).setDOMContent(details),
            )
            .addTo(instance);
        }
        themeObserver = new MutationObserver(() => {
          const next = currentTheme();
          if (next === theme) return;
          theme = next;
          instance.setStyle(styles[next]);
        });
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme'],
        });
      } catch {
        fail();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void initialize();
      },
      { rootMargin: '400px' },
    );
    observer.observe(this);
    select.addEventListener('change', () => {
      const target = regions.find((region) => region.id === select.value);
      if (!target || !map) return;
      const camera =
        'bounds' in target
          ? map.cameraForBounds(target.bounds, { padding: 16 })
          : {
              center: [...target.center] as [number, number],
              zoom: target.zoom,
            };
      if (!camera) return;
      const level = { ...camera, pitch: 0, bearing: 0 };
      if (matchMedia('(prefers-reduced-motion: reduce)').matches)
        map.jumpTo(level);
      else map.flyTo({ ...level, duration: 2000, essential: false });
    });
    this.querySelector('[data-zoom="in"]')?.addEventListener('click', () =>
      map?.zoomIn(),
    );
    this.querySelector('[data-zoom="out"]')?.addEventListener('click', () =>
      map?.zoomOut(),
    );
    const full = this.querySelector<HTMLButtonElement>(
      '[data-map-fullscreen]',
    )!;
    if (!document.fullscreenEnabled) full.hidden = true;
    const syncFullscreen = () => {
      const active = document.fullscreenElement === this;
      full.setAttribute(
        'aria-label',
        active ? 'Exit fullscreen' : 'Fullscreen',
      );
      full.title = active ? 'Exit fullscreen' : 'Fullscreen';
      this.querySelector<HTMLElement>('[data-maximize]')!.hidden = active;
      this.querySelector<HTMLElement>('[data-minimize]')!.hidden = !active;
      map?.resize();
    };
    full.addEventListener('click', () => {
      const action = document.fullscreenElement
        ? document.exitFullscreen()
        : this.requestFullscreen();
      void action.catch(() => {
        /* Browser may decline fullscreen. */
      });
    });
    document.addEventListener('fullscreenchange', syncFullscreen);
    this.cleanup = () => {
      disposed = true;
      observer.disconnect();
      themeObserver?.disconnect();
      document.removeEventListener('fullscreenchange', syncFullscreen);
      map?.remove();
    };
  }
  private cleanup?: () => void;
  disconnectedCallback() {
    this.cleanup?.();
  }
}
if (!customElements.get('campus-map'))
  customElements.define('campus-map', CampusMap);
