export const campuses = {
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

export const regions = [
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

// Liberty shows buildings, landmarks and street names once zoomed in.
const tileOrigin = 'https://tiles.openfreemap.org';
export const lightStyleUrl = `${tileOrigin}/styles/liberty`;
export const darkStyleUrl = `${tileOrigin}/styles/dark`;
