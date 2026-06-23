import { ArrowRight, X } from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { Country } from "../data/types";

const POPUP_W = 300;   // matches CSS width: min(300px, …)
const POPUP_H = 310;   // approx max rendered height — keeps popup fully in frame
const MARGIN  = 12;    // gap from click point / container edge

type Props = {
  country: Country;
  onClose: () => void;
  /** Pixel coords of the click inside the map container */
  pos?: { x: number; y: number };
  containerW?: number;
  containerH?: number;
};

export function CountryPopup({ country, onClose, pos, containerW = 800, containerH = 500 }: Props) {

  let style: CSSProperties;

  if (pos) {
    // ── Pixel-accurate smart positioning ──────────────────────────────────
    // Prefer placing the popup to the RIGHT of the click; flip left if it
    // would overflow the right edge. Clamp vertical so it never clips the
    // top or bottom of the map container.
    const spaceRight = containerW - (pos.x + MARGIN);
    const left = spaceRight >= POPUP_W
      ? pos.x + MARGIN
      : Math.max(MARGIN, pos.x - POPUP_W - MARGIN);

    const rawTop = pos.y - POPUP_H / 2;
    const top = Math.max(MARGIN, Math.min(rawTop, containerH - POPUP_H - MARGIN));

    style = { position: "absolute", left, top, width: POPUP_W };
  } else {
    // ── Fallback: percentage-based (mobile or no click pos) ───────────────
    style = {
      "--popup-left": `${Math.min(country.map.x + country.map.w + 2, 68)}%`,
      "--popup-top":  `${Math.max(country.map.y - 2, 18)}%`,
    } as CSSProperties;
  }

  return (
    <article
      className={pos ? "glass-panel pointer-events-auto absolute z-30 max-h-[85%] overflow-y-auto rounded-lg p-4 shadow-purple"
                     : "country-popup glass-panel pointer-events-auto absolute z-30 max-h-[70%] overflow-y-auto rounded-lg p-4 shadow-purple"}
      style={style}
      aria-label={`${country.name} maritime summary`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-12 place-items-center rounded bg-white/10 text-xl ring-1 ring-white/10" aria-hidden="true">
            {country.flag}
          </span>
          <h3 className="text-lg font-semibold uppercase tracking-normal text-white">{country.name}</h3>
        </div>
        <button className="rounded-md p-1 text-slate-300 transition hover:bg-white/10 hover:text-white" onClick={onClose} aria-label="Close country popup">
          <X className="h-5 w-5" />
        </button>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        {[
          ["EEZ Area", country.eezArea.replace(" sq km", " km²")],
          ["Boundaries", country.related.length + 2],
          ["Treaties", country.treaties],
          ["Deposits & Pub.", country.depositedStatus],
        ].map(([label, value]) => (
          <div key={label} className="grid grid-cols-[1fr_1.1fr] gap-4">
            <dt className="text-slate-400">{label}</dt>
            <dd className="text-right text-slate-100">{value}</dd>
          </div>
        ))}
        <div className="grid grid-cols-[1fr_1.1fr] items-center gap-4">
          <dt className="text-slate-400">ECS Status</dt>
          <dd className="text-right">
            <span className="rounded-full bg-success/16 px-2.5 py-1 text-xs text-lime-200 ring-1 ring-success/20">{country.ecsStatus}</span>
          </dd>
        </div>
      </dl>

      <Link
        to={`/countries/${country.id}`}
        className="mt-5 flex min-h-10 items-center justify-center gap-2 rounded-md border border-primary/45 bg-primary/10 px-4 text-sm font-semibold text-primary shadow-glow transition hover:bg-primary/18 hover:text-white"
      >
        View Full Profile <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
