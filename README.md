# Pacific Maritime Boundaries Platform

Production-quality React prototype for a map-first Pacific maritime boundaries information platform.

## Run

```powershell
npm.cmd install --cache .\.npm-cache
npm.cmd run build
npm.cmd run server
```

Open `http://localhost:5200/dashboard`.

## EEZ GeoJSON

The map is wired for a real EEZ GeoJSON source. Set `VITE_EEZ_GEOJSON_URL` to a public or local GeoJSON URL before building.

```powershell
$env:VITE_EEZ_GEOJSON_URL="/data/pacific-eez.geojson"
npm.cmd run build
```

Expected feature properties:

- `id`: matches a country id in `src/data/mockData.ts`
- `name`: country or territory name
- `code`: short display code
- `tone`: `cyan`, `purple`, `green`, or `amber`

If `VITE_EEZ_GEOJSON_URL` is not provided, the app uses generated prototype polygons so the interface remains fully interactive.
