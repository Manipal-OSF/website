import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { setWorkerUrl } from 'maplibre-gl';
setWorkerUrl(workerUrl);
export { Map, Marker, Popup } from 'maplibre-gl';
