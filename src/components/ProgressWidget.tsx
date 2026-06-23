import { Card } from "./ui/card";

export function ProgressWidget({ title, items }: { title: string; items: { label: string; value: number; color: string }[] }) {
  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm uppercase tracking-[0.18em] text-white">{title}</h2>
        <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-400">Live</span>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="grid grid-cols-[1fr_auto] gap-3">
            <span className="text-sm text-slate-300">{item.label}</span>
            <span className="text-sm text-white">{item.value}%</span>
            <div className="col-span-2 h-2 overflow-hidden rounded-full bg-slate-700/60">
              <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color, boxShadow: `0 0 18px ${item.color}` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
