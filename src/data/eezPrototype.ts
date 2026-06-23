import { countries } from "./mockData";

/**
 * Approximate geographic centers for each Pacific country/territory.
 * These are NOT authoritative EEZ boundaries — per README, when no real
 * VITE_EEZ_GEOJSON_URL is supplied, the platform falls back to generated
 * prototype polygons so the map stays interactive. This is that fallback.
 */
const CENTERS: Record<string, [number, number]> = {
  "cook-islands": [-159.778, -21.237],
  fiji: [178.065, -17.713],
  kiribati: [172.979, 1.333],
  "marshall-islands": [171.184, 7.131],
  micronesia: [158.215, 6.886],
  nauru: [166.931, -0.522],
  niue: [-169.867, -19.054],
  palau: [134.582, 7.515],
  "papua-new-guinea": [143.956, -6.315],
  samoa: [-172.105, -13.759],
  "solomon-islands": [160.156, -9.645],
  tonga: [-175.199, -21.179],
  tuvalu: [177.64, -7.109],
  vanuatu: [166.959, -15.376],
  tokelau: [-171.855, -9.168],
  "new-caledonia": [165.618, -20.904],
  "french-polynesia": [-149.406, -17.679],
  "wallis-and-futuna": [-176.173, -13.768],
  "american-samoa": [-170.132, -14.27],
  "pitcairn-islands": [-130.101, -24.703],
  "norfolk-island": [167.954, -29.04],
  guam: [144.794, 13.444],
};

/** Roughly-circular polygon around a center point, radius in km. */
function circlePolygon(center: [number, number], radiusKm: number, points = 48): [number, number][] {
  const [lng, lat] = center;
  const latRad = (lat * Math.PI) / 180;
  const coords: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = (radiusKm * Math.cos(angle)) / (111.32 * Math.cos(latRad));
    const dy = (radiusKm * Math.sin(angle)) / 110.57;
    coords.push([lng + dx, lat + dy]);
  }
  return coords;
}

export type EezFeatureProps = {
  id: string;
  code: string;
  name: string;
  tone: "cyan" | "purple" | "green" | "amber";
  boundaryStatus: string;
};

export function buildEezPrototypeGeoJson(): GeoJSON.FeatureCollection<GeoJSON.Polygon, EezFeatureProps> {
  return {
    type: "FeatureCollection",
    features: countries
      .filter((c) => CENTERS[c.id])
      .map((c) => {
        const areaSqKm = parseInt(c.eezArea.replace(/[^\d]/g, ""), 10) || 300000;
        const radiusKm = 140 + Math.sqrt(areaSqKm) / 6;
        return {
          type: "Feature",
          properties: { id: c.id, code: c.code, name: c.name, tone: c.map.tone, boundaryStatus: c.boundaryStatus },
          geometry: { type: "Polygon", coordinates: [circlePolygon(CENTERS[c.id], radiusKm)] },
        };
      }),
  };
}
