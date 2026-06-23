import { Database, FileText, Globe2, Handshake, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const stats: Array<{ value: string; label: string; detail: string; icon: LucideIcon; tone: string }> = [
  { value: "22", label: "Countries", detail: "Pacific profiles", icon: Globe2, tone: "text-primary bg-primary/12 ring-primary/25" },
  { value: "48", label: "Shared Boundaries", detail: "Neighbouring maritime limits", icon: Handshake, tone: "text-fuchsia-300 bg-accent/16 ring-accent/25" },
  { value: "36", label: "Treaties", detail: "Agreements in force", icon: FileText, tone: "text-warning bg-warning/12 ring-warning/25" },
  { value: "10", label: "High Seas Declarations", detail: "Declarations tracked", icon: ShieldCheck, tone: "text-lime-300 bg-success/12 ring-success/25" },
  { value: "120+", label: "Datasets", detail: "Open data layers", icon: Database, tone: "text-pink-300 bg-pink-500/12 ring-pink-400/25" },
];

export function StatsOverlay() {
  return (
    <section className="absolute right-5 top-5 z-20 hidden max-w-[740px] grid-cols-5 gap-3 xl:grid" aria-label="Regional statistics">
      {stats.map((stat) => (
        <article key={stat.label} className="glass-panel min-h-[132px] rounded-lg p-4 transition hover:-translate-y-1 hover:shadow-glow">
          <div className="flex items-start gap-3">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ring-1 ${stat.tone}`}>
              <stat.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="text-xs font-semibold text-white">{stat.label}</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">{stat.detail}</p>
        </article>
      ))}
    </section>
  );
}
