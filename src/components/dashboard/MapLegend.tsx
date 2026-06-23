export function MapLegend() {
  return (
    <div className="glass-panel absolute bottom-8 right-2 z-20 rounded-lg p-3 text-xs text-slate-300">
      <p className="mb-2 font-medium text-white">Map legend</p>
      <div className="space-y-2">
        <div className="flex items-center gap-2"><span className="h-3 w-6 rounded-sm bg-primary/35 ring-1 ring-primary/50" /> EEZ established</div>
        <div className="flex items-center gap-2"><span className="h-3 w-6 rounded-sm bg-accent/30 ring-1 ring-accent/50" /> Partial or under development</div>
        <div className="flex items-center gap-2"><span className="h-3 w-6 rounded-sm bg-warning/25 ring-1 ring-warning/50" /> Treaty focus area</div>
      </div>
    </div>
  );
}
