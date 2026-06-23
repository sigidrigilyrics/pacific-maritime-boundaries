import type { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  metrics?: Array<{ label: string; value: string; tone?: "cyan" | "purple" | "green" | "amber" }>;
};

export function PageHero({ eyebrow, title, description, icon: Icon, metrics = [] }: PageHeroProps) {
  const toneClass = {
    cyan: "text-primary bg-primary/12 ring-primary/20",
    purple: "text-fuchsia-300 bg-accent/14 ring-accent/20",
    green: "text-lime-300 bg-success/12 ring-success/20",
    amber: "text-warning bg-warning/12 ring-warning/20",
  };

  return (
    <section className="glass-panel relative overflow-hidden rounded-lg p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,229,255,.12),transparent_22rem),radial-gradient(circle_at_82%_12%,rgba(138,63,252,.13),transparent_24rem)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary shadow-glow ring-1 ring-primary/25">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            )}
            <p className="text-xs uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-white md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 md:text-base">{description}</p>
        </div>

        {metrics.length > 0 && (
          <div className="grid min-w-[min(100%,520px)] gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <Card key={metric.label} className="p-4">
                <p className={`inline-flex rounded-full px-2.5 py-1 text-xs ring-1 ${toneClass[metric.tone ?? "cyan"]}`}>{metric.label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
