import type { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

export function StatsCard({ value, label, detail, icon: Icon, tone = "cyan" }: {
  value: string;
  label: string;
  detail: string;
  icon: LucideIcon;
  tone?: "cyan" | "purple" | "green" | "amber" | "blue";
}) {
  const toneClass = {
    cyan: "text-primary bg-primary/12 ring-primary/22",
    purple: "text-fuchsia-300 bg-accent/16 ring-accent/22",
    green: "text-lime-300 bg-success/12 ring-success/22",
    amber: "text-warning bg-warning/12 ring-warning/22",
    blue: "text-sky-300 bg-blue-500/12 ring-blue-400/22",
  }[tone];

  return (
    <Card className="flex min-h-[118px] items-center gap-4 p-4 transition hover:-translate-y-1 hover:shadow-glow">
      <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full ring-1 ${toneClass}`}>
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl text-white">{value}</p>
        <p className="text-sm font-medium text-cyan-200">{label}</p>
        <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>
      </div>
    </Card>
  );
}
