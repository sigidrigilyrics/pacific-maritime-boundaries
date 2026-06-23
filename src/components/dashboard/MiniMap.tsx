import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined;
const MINI_STYLE: string = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/ocean/style.json?key=${MAPTILER_KEY}`
  : "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

type Rect = { x: number; y: number; w: number; h: number };

export function MiniMap({ mainMap }: { mainMap: maplibregl.Map }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const miniRef = useRef<maplibregl.Map | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const mini = new maplibregl.Map({
      container: containerRef.current,
      style: MINI_STYLE,
      center: [-170, -14],
      zoom: 1.2,
      interactive: false,
      attributionControl: false,
      renderWorldCopies: false,
    });
    miniRef.current = mini;

    function updateRect() {
      const m = miniRef.current;
      if (!m) return;
      const bounds = mainMap.getBounds();
      const nw = m.project(bounds.getNorthWest());
      const se = m.project(bounds.getSouthEast());
      setRect({
        x: Math.max(0, nw.x),
        y: Math.max(0, nw.y),
        w: Math.max(6, se.x - nw.x),
        h: Math.max(4, se.y - nw.y),
      });
    }

    mini.on("load", () => {
      setReady(true);
      updateRect();
    });

    mainMap.on("moveend", updateRect);
    mainMap.on("zoomend", updateRect);

    return () => {
      mainMap.off("moveend", updateRect);
      mainMap.off("zoomend", updateRect);
      mini.remove();
      miniRef.current = null;
    };
  }, [mainMap]);

  return (
    <div
      className="absolute bottom-20 left-4 z-20 overflow-hidden rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] ring-1 ring-white/20"
      style={{ width: 160, height: 96 }}
    >
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ pointerEvents: "none" }}
      />

      {/* Viewport rectangle */}
      {ready && rect && (
        <div
          className="pointer-events-none absolute border border-cyan-400 bg-cyan-400/15"
          style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
        />
      )}

      {/* Label */}
      <div className="pointer-events-none absolute bottom-1 left-1.5 text-[9px] font-bold uppercase tracking-widest text-white/60">
        Pacific
      </div>

      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
    </div>
  );
}
