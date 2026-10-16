// Loaded on demand, so the map's stylesheet arrives with its code instead of
// blocking the first paint of the home page.
import 'maplibre-gl/dist/maplibre-gl.css';

export { Map, Marker, Popup, setWorkerUrl } from 'maplibre-gl';
