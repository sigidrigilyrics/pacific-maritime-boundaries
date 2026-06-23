import maplibregl from "maplibre-gl";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { LAYER_COLORS, gisApi, type GisLayer } from "../lib/gisApi";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined;
const MAP_STYLE: string = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`
  : "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export function LayerPreviewModal({ layer, onClose }: { layer: GisLayer; onClose: () => void }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: MAP_STYLE,
      center: [177, -12],
      zoom: 2.5,
      attributionControl: { compact: true },
      dragRotate: false,
    });
    map.on("load", () => {
      map.addSource(layer.id, {
        type: "vector",
        tiles: [gisApi.tileUrl(layer.id)],
        minzoom: 0,
        maxzoom: 14,
      });
      map.addLayer({
        id: `prev-fill`,
        type: "fill",
        source: layer.id,
        "source-layer": "features",
        paint: { "fill-color": LAYER_COLORS[0], "fill-opacity": 0.35 },
      });
      map.addLayer({
        id: `prev-line`,
        type: "line",
        source: layer.id,
        "source-layer": "features",
        paint: { "line-color": LAYER_COLORS[0], "line-width": 1.5 },
      });
    });
    return () => map.remove();
  }, [layer.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-xl shadow-purple ring-1 ring-white/10"
        style={{ margin: "1rem" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-[#030712] px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-white">{layer.name}</p>
            <p className="text-xs text-slate-400">
              {layer.feature_count.toLocaleString()} features · {layer.crs}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div ref={mapRef} className="h-[480px] w-full" />
      </div>
    </div>
  );
}
