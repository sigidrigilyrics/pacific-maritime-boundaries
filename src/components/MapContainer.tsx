import { Fullscreen, Home, Minus, Plus, Settings2, type LucideIcon } from "lucide-react";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { buildEezPrototypeGeoJson } from "../data/eezPrototype";
import { countries } from "../data/mockData";
import { gisApi, type GisDocument } from "../lib/gisApi";
import { cn } from "../lib/utils";
import { usePlatformStore } from "../store/usePlatformStore";
import { useGisStore } from "../store/useGisStore";
import { AdminPanel } from "./AdminPanel";
import { CountryPopup } from "./CountryPopup";
import { LayerPanel } from "./dashboard/LayerPanel";
import { MapControls } from "./dashboard/MapControls";
import { MapLegend } from "./dashboard/MapLegend";

const EEZ_LAYER_IDS = ["country-eez-fill", "country-eez-line-solid", "country-eez-line-dashed", "country-eez-label"];

const TONE_COLOR_EXPR: maplibregl.ExpressionSpecification = [
  "match",
  ["get", "tone"],
  "purple",
  "#8A3FFC",
  "green",
  "#00D084",
  "amber",
  "#F4B400",
  "#00E5FF",
];

type RequestState = "idle" | "sending" | "sent" | "error";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined;

// Free, no-API-key satellite imagery (Esri World Imagery) so islands are
// actually visible, used unless a MapTiler key is supplied for the nicer
// MapTiler satellite style.
const ESRI_SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  sources: {
    "esri-satellite": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "© Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [{ id: "esri-satellite", type: "raster", source: "esri-satellite" }],
};

const MAP_STYLE: string | maplibregl.StyleSpecification = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`
  : ESRI_SATELLITE_STYLE;

type HoverInfo = {
  title: string;
  layerId: string;
  props: Record<string, unknown>;
  docs: GisDocument[];
  docsLoading: boolean;
  x: number;
  y: number;
};

export function MapContainer({
  compact = false,
  flyTo,
}: {
  compact?: boolean;
  flyTo?: { center: [number, number]; zoom: number };
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const unsubRef = useRef<(() => void) | undefined>();
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { selectedCountry, hoveredCountry, setSelectedCountry, setHoveredCountry, activeLayers, toggleLayer } =
    usePlatformStore();
  const { token, isAdmin, gisLayers, setGisLayers } = useGisStore();

  const [adminOpen, setAdminOpen] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    gisApi.getLayers().then((layers) => setGisLayers(layers));
  }, [setGisLayers]);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: MAP_STYLE,
      center: flyTo?.center ?? [180, -8],
      zoom: flyTo ? flyTo.zoom : compact ? 2.8 : 3.1,
      attributionControl: { compact: true },
      interactive: true,
      dragRotate: false,
      // Must stay true: with it false, MapLibre clamps the camera so it can
      // never center near the antimeridian (the seam can't render without a
      // world copy) — every center request near 180°/-180° silently snapped
      // to ~135°, which was the root cause of every framing issue today.
      renderWorldCopies: true,
    });

    mapInstanceRef.current = map;

    map.on("load", () => {
      setMapLoaded(true);

      /* prototype EEZ country choropleth (no real boundary feed configured) */
      map.addSource("country-eez", { type: "geojson", data: buildEezPrototypeGeoJson() });
      // Swap in real EEZ boundaries (Marine Regions World EEZ dataset,
      // simplified) if the data file is present; the prototype circles
      // above stay as the fallback otherwise.
      fetch("/data/pacific-eez.geojson")
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("missing"))))
        .then((real) => {
          const source = map.getSource("country-eez") as maplibregl.GeoJSONSource | undefined;
          source?.setData(real);
        })
        .catch(() => { /* keep prototype circles */ });
      map.addLayer({
        id: "country-eez-fill",
        type: "fill",
        source: "country-eez",
        paint: {
          "fill-color": TONE_COLOR_EXPR,
          "fill-opacity": ["match", ["get", "boundaryStatus"], "Completed", 0.32, "In Progress", 0.2, 0.1],
        },
      });
      // Kiribati/Tuvalu/Fiji's real EEZ boundaries genuinely run along the
      // international dateline (a literal treaty reference line), and being
      // stacked vertically they visually merge into what reads as one long
      // line. The geometry is accurate — this just thins those specific
      // edges so they don't dominate the view.
      map.addLayer({
        id: "country-eez-line-solid",
        type: "line",
        source: "country-eez",
        filter: ["==", ["get", "boundaryStatus"], "Completed"],
        paint: {
          "line-color": TONE_COLOR_EXPR,
          "line-width": ["case", ["==", ["get", "nearDateline"], true], 0.5, 1.5],
          "line-opacity": ["case", ["==", ["get", "nearDateline"], true], 0, 1],
        },
      });
      map.addLayer({
        id: "country-eez-line-dashed",
        type: "line",
        source: "country-eez",
        filter: ["!=", ["get", "boundaryStatus"], "Completed"],
        paint: {
          "line-color": TONE_COLOR_EXPR,
          "line-width": ["case", ["==", ["get", "nearDateline"], true], 0.5, 1.5],
          "line-opacity": ["case", ["==", ["get", "nearDateline"], true], 0, 1],
          "line-dasharray": [2, 1.5],
        },
      });
      map.addLayer({
        id: "country-eez-label",
        type: "symbol",
        source: "country-eez",
        layout: {
          "text-field": ["get", "code"],
          "text-size": 12,
          "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
        },
        paint: { "text-color": "#ffffff", "text-halo-color": "#03060f", "text-halo-width": 1.2 },
      });

      map.on("mouseenter", "country-eez-fill", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "country-eez-fill", () => { map.getCanvas().style.cursor = ""; });
      map.on("click", "country-eez-fill", (e) => {
        if (!e.features?.length) return;
        const id = e.features[0].properties?.id as string;
        const country = countries.find((c) => c.id === id);
        if (country) {
          usePlatformStore.getState().setSelectedCountry(country);
          setPopupPos({ x: e.point.x, y: e.point.y });
        }
      });

      /* add real uploaded layers already in store */
      useGisStore.getState().gisLayers.forEach((l, i) => addVectorLayer(map, l.id, l.name, i));

      /* subscribe to store for future layer changes */
      unsubRef.current = useGisStore.subscribe((state, prev) => {
        if (state.gisLayers.length > prev.gisLayers.length) {
          state.gisLayers.slice(prev.gisLayers.length).forEach((l, j) =>
            addVectorLayer(map, l.id, l.name, prev.gisLayers.length + j),
          );
        } else if (state.gisLayers.length < prev.gisLayers.length) {
          prev.gisLayers.forEach((l) => {
            if (!state.gisLayers.find((gl) => gl.id === l.id)) removeVectorLayer(map, l.id);
          });
        }
      });

      /* hover on uploaded GIS fill layers */
      map.on("mousemove", (e) => {
        const fillIds = useGisStore
          .getState()
          .gisLayers.map((l) => `gis-fill-${l.id}`)
          .filter((id) => map.getLayer(id));

        const feats = fillIds.length ? map.queryRenderedFeatures(e.point, { layers: fillIds }) : [];

        if (!feats.length) {
          if (hoverTimer.current) clearTimeout(hoverTimer.current);
          hoverTimer.current = setTimeout(() => setHoverInfo(null), 150);
          return;
        }
        if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }

        const feat = feats[0];
        const layerId = feat.source as string;
        let props: Record<string, unknown> = { ...(feat.properties ?? {}) };
        if (typeof props.properties === "string") {
          try { Object.assign(props, JSON.parse(props.properties as string)); } catch { /* */ }
        }
        const title = String(
          props.TERRITORY1 ?? props.GEONAME ?? props.name ?? props.NAME ?? props.SOVEREIGN1 ?? "Feature",
        );

        setHoverInfo((cur) => {
          if (cur?.layerId === layerId) return { ...cur, x: e.point.x, y: e.point.y };
          setRequestState("idle");
          gisApi.getDocuments("layer", layerId).then((docs) =>
            setHoverInfo((c) => (c?.layerId === layerId ? { ...c, docs, docsLoading: false } : c)),
          );
          return { title, layerId, props, docs: [], docsLoading: true, x: e.point.x, y: e.point.y };
        });
      });

      /* click on empty space dismisses popups */
      map.on("click", (e) => {
        const fillIds = useGisStore
          .getState()
          .gisLayers.map((l) => `gis-fill-${l.id}`)
          .filter((id) => map.getLayer(id));
        const feats = fillIds.length ? map.queryRenderedFeatures(e.point, { layers: fillIds }) : [];
        if (!feats.length) setHoverInfo(null);

        const eezFeats = map.getLayer("country-eez-fill")
          ? map.queryRenderedFeatures(e.point, { layers: ["country-eez-fill"] })
          : [];
        if (!eezFeats.length) {
          usePlatformStore.getState().setSelectedCountry(undefined);
          setPopupPos(null);
        }
      });

      /* leaving canvas always clears immediately */
      map.getCanvas().addEventListener("mouseleave", () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        setHoverInfo(null);
      });
    });

    return () => {
      unsubRef.current?.();
      unsubRef.current = undefined;
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      mapInstanceRef.current = null;
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* sync the "EEZ Boundaries" layer-panel toggle to the prototype choropleth */
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;
    const visibility = activeLayers.includes("eez") ? "visible" : "none";
    EEZ_LAYER_IDS.forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visibility);
    });
  }, [activeLayers, mapLoaded]);

  const zoomIn = () => mapInstanceRef.current?.zoomIn();
  const zoomOut = () => mapInstanceRef.current?.zoomOut();
  const resetMap = () => mapInstanceRef.current?.flyTo({ center: [180, -8], zoom: 3.1 });
  const requestFullscreen = () => mapRef.current?.parentElement?.requestFullscreen?.();
  const mapControls: Array<[LucideIcon, string, () => void]> = [
    [Plus, "Zoom in", zoomIn],
    [Minus, "Zoom out", zoomOut],
    [Home, "Reset map", resetMap],
    [Fullscreen, "Fullscreen", requestFullscreen],
  ];

  const mapW = mapRef.current?.clientWidth ?? 600;
  const mapH = mapRef.current?.clientHeight ?? 500;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-lg ring-1 ring-white/10",
        compact ? "h-[360px] sm:h-[420px]" : "h-[62dvh] min-h-[440px] sm:h-[68dvh] xl:h-[calc(100dvh-104px)]",
      )}
    >
      <div
        ref={mapRef}
        className="absolute inset-0"
        aria-label="MapLibre Pacific EEZ map"
      />
      {/* subtle edge vignette so UI panels blend in */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,18,.55),transparent_22%,transparent_76%,rgba(3,7,18,.4)),linear-gradient(180deg,rgba(3,7,18,.15),transparent_28%,rgba(3,7,18,.5))]" />

      {!compact && (
        <>
          <div className="hidden sm:block">
            <LayerPanel activeLayers={activeLayers} onToggleLayer={toggleLayer} />
          </div>
          <MapControls controls={mapControls} />
          <div className="hidden sm:block">
            <MapLegend />
          </div>
          {isAdmin && (
            <button
              onClick={() => setAdminOpen((v) => !v)}
              className="glass-panel absolute bottom-16 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full text-primary ring-1 ring-primary/30 transition hover:bg-primary/14"
              title="Manage data"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          )}
          {isAdmin && adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
          {selectedCountry && (
            <CountryPopup
              country={selectedCountry}
              pos={popupPos ?? undefined}
              containerW={mapW}
              containerH={mapH}
              onClose={() => { setSelectedCountry(undefined); setPopupPos(null); }}
            />
          )}
        </>
      )}

      {/* Hover popup for uploaded GIS features */}
      {hoverInfo && (
        <div
          className="glass-panel pointer-events-auto absolute z-30 w-72 overflow-hidden rounded-xl shadow-purple"
          style={{
            left: Math.min(hoverInfo.x + 12, mapW - 296),
            top: Math.max(hoverInfo.y - 8, 8),
          }}
          onMouseEnter={() => { if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; } }}
          onMouseLeave={() => { hoverTimer.current = setTimeout(() => setHoverInfo(null), 350); }}
        >
          <div className="bg-white/[0.06] px-4 py-3">
            <p className="truncate text-sm font-semibold text-white">{hoverInfo.title}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-primary">Uploaded Layer</p>
          </div>

          <div className="max-h-44 overflow-y-auto px-4 py-3 space-y-1.5">
            {Object.entries(hoverInfo.props)
              .filter(([k]) => k !== "properties" && k !== "id")
              .slice(0, 10)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 text-xs">
                  <span className="shrink-0 text-slate-500">{k}</span>
                  <span className="truncate text-right text-slate-200">{String(v)}</span>
                </div>
              ))}
          </div>

          {(hoverInfo.docsLoading || hoverInfo.docs.length > 0) && (
            <div className="border-t border-white/10 px-4 py-3">
              <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-slate-400">Documents</p>
              {hoverInfo.docsLoading ? (
                <p className="text-xs text-slate-500">Loading…</p>
              ) : (
                hoverInfo.docs.map((doc) => (
                  <a
                    key={doc.id}
                    href={gisApi.downloadUrl(doc.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded py-0.5 text-xs text-primary hover:underline"
                  >
                    ↓ {doc.name}
                  </a>
                ))
              )}
            </div>
          )}

          <div className="border-t border-white/10 px-4 py-3 space-y-2">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/14 py-2 text-xs font-semibold text-primary ring-1 ring-primary/30 transition hover:bg-primary/22"
              onClick={() => downloadLayerGeoJson(hoverInfo.layerId, hoverInfo.title)}
            >
              ↓ Download GeoJSON
            </button>
            {token && !isAdmin && (
              <button
                disabled={requestState === "sending" || requestState === "sent"}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold ring-1 transition",
                  requestState === "sent"
                    ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                    : requestState === "error"
                    ? "bg-red-500/10 text-red-400 ring-red-500/20"
                    : "bg-accent/12 text-accent ring-accent/25 hover:bg-accent/20 disabled:opacity-50",
                )}
                onClick={async () => {
                  if (!token) return;
                  setRequestState("sending");
                  try {
                    await gisApi.requestAccess(token, hoverInfo.layerId);
                    setRequestState("sent");
                  } catch {
                    setRequestState("error");
                  }
                }}
              >
                {requestState === "sent"
                  ? "✓ Request sent"
                  : requestState === "error"
                  ? "Request failed — retry?"
                  : requestState === "sending"
                  ? "Sending…"
                  : "Request Access"}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

async function downloadLayerGeoJson(layerId: string, title: string) {
  const r = await fetch(`/api/gis/features?layer_id=${layerId}&limit=2000`);
  const data = (await r.json()) as { features: unknown[] };
  const blob = new Blob(
    [JSON.stringify({ type: "FeatureCollection", features: data.features ?? [] }, null, 2)],
    { type: "application/geo+json" },
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${title}.geojson`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function nameToColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("treaty") || n.includes("agreement")) return "#a855f7";
  if (n.includes("ecs") || n.includes("continental shelf")) return "#f59e0b";
  if (n.includes("baseline")) return "#22c55e";
  return "#00e5ff";
}

function addVectorLayer(map: maplibregl.Map, layerId: string, name: string, _colorIndex: number) {
  if (map.getSource(layerId)) return;
  const color = nameToColor(name);
  map.addSource(layerId, {
    type: "vector",
    tiles: [gisApi.tileUrl(layerId)],
    minzoom: 0,
    maxzoom: 14,
  });
  map.addLayer({
    id: `gis-glow-${layerId}`,
    type: "line",
    source: layerId,
    "source-layer": "features",
    paint: { "line-color": color, "line-width": 18, "line-blur": 10, "line-opacity": 0.22 },
  });
  map.addLayer({
    id: `gis-line-outer-${layerId}`,
    type: "line",
    source: layerId,
    "source-layer": "features",
    paint: { "line-color": color, "line-width": 4, "line-blur": 2, "line-opacity": 0.45 },
  });
  map.addLayer({
    id: `gis-line-${layerId}`,
    type: "line",
    source: layerId,
    "source-layer": "features",
    paint: { "line-color": color, "line-width": 1.5, "line-opacity": 1.0 },
  });
  map.addLayer({
    id: `gis-fill-${layerId}`,
    type: "fill",
    source: layerId,
    "source-layer": "features",
    paint: { "fill-color": color, "fill-opacity": 0.07 },
  });
}

function removeVectorLayer(map: maplibregl.Map, layerId: string) {
  [`gis-glow-${layerId}`, `gis-line-outer-${layerId}`, `gis-line-${layerId}`, `gis-fill-${layerId}`].forEach((id) => {
    if (map.getLayer(id)) map.removeLayer(id);
  });
  if (map.getSource(layerId)) map.removeSource(layerId);
}

export function MaritimeMap() {
  return <MapContainer />;
}

