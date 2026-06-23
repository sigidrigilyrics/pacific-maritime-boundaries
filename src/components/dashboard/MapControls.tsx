import type { LucideIcon } from "lucide-react";

export function MapControls({ controls }: { controls: Array<[LucideIcon, string, () => void]> }) {
  return (
    <div className="absolute right-3 top-3 z-20 flex flex-col overflow-hidden rounded-lg bg-ocean/64 ring-1 ring-white/10 backdrop-blur sm:right-4 sm:top-28">
      {controls.map(([Icon, label, onClick]) => (
        <button key={label} onClick={onClick} className="grid h-10 w-10 place-items-center text-slate-200 transition hover:bg-cyan-300/10 hover:text-white sm:h-11 sm:w-11" aria-label={label}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
