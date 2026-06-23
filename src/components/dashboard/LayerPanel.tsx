import { Anchor, ChevronLeft, ChevronRight, Fish, Layers, Map, Route, Waves } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { useGisStore } from "../../store/useGisStore";

type LayerPanelProps = {
  activeLayers: string[];
  onToggleLayer: (layer: string) => void;
};

const layerItems = [
  { id: "eez", label: "EEZ Boundaries", detail: "Established maritime zones", icon: Waves },
  { id: "ecs", label: "ECS Submissions", detail: "Extended shelf submissions", icon: Anchor },
  { id: "treaties", label: "Treaty Boundaries", detail: "Shared boundary agreements", icon: Route },
  { id: "baselines", label: "Baselines", detail: "Coastal baselines", icon: Map },
  { id: "high-seas", label: "High Seas", detail: "Regional pockets", icon: Waves },
];

const themeItems = [
  { id: "fisheries", label: "Fisheries Zones", icon: Fish },
  { id: "mpas", label: "MPAs", icon: Map },
  { id: "bathymetry", label: "Bathymetry", icon: Waves },
  { id: "marine-routes", label: "Marine Routes", icon: Route },
];

export function LayerPanel({ activeLayers, onToggleLayer }: LayerPanelProps) {
  const [collapsed, setCollapsed] = useState(true);
  const { isAdmin } = useGisStore();

  return (
    <aside className={cn("glass-panel absolute left-4 top-5 z-20 rounded-lg transition-all duration-200", collapsed ? "w-14 p-2" : "w-[270px] p-4")}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
          {!collapsed && <h2 className="text-xs uppercase tracking-[0.18em] text-white">Layers</h2>}
        </div>
        <button
          className="grid h-8 w-8 place-items-center rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand layers panel" : "Collapse layers panel"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-5 space-y-5">
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-slate-400">Boundaries</p>
            <div className="space-y-2">
          {layerItems.map((layer) => (
            <label key={layer.id} className="flex cursor-pointer items-center gap-3 rounded-md p-1.5 transition hover:bg-white/[0.06]">
              <input className="mt-1 h-4 w-4 accent-cyan-300" type="checkbox" checked={activeLayers.includes(layer.id)} onChange={() => onToggleLayer(layer.id)} />
              <layer.icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span className="block text-sm text-slate-100">{layer.label}</span>
              <span className="ml-auto text-slate-500">⋮⋮</span>
            </label>
          ))}
            </div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-slate-400">Themes</p>
            <div className="space-y-2">
              {themeItems.map((layer) => (
                <label key={layer.id} className="flex cursor-pointer items-center gap-3 rounded-md p-1.5 transition hover:bg-white/[0.06]">
                  <input className="h-4 w-4 accent-cyan-300" type="checkbox" defaultChecked={layer.id === "bathymetry"} />
                  <layer.icon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  <span className="block text-sm text-slate-300">{layer.label}</span>
                  <span className="ml-auto text-slate-500">⋮⋮</span>
                </label>
              ))}
            </div>
          </div>
          {isAdmin && (
            <button className="w-full rounded-md bg-primary/10 px-3 py-2 text-sm text-primary ring-1 ring-primary/25 transition hover:bg-primary/16">
              + Add Layer
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
