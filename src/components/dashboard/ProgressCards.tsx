import { Card } from "../ui/card";

export function ProgressCards() {
  const items = [
    { label: "Maritime Zones Pathway", value: 75, color: "#00E5FF" },
    { label: "Treaty Pathway", value: 62, color: "#8A3FFC" },
    { label: "ECS Pathway", value: 42, color: "#F4B400" },
    { label: "Deposits & Publication", value: 69, color: "#00D084" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <Card key={item.label} className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm text-white">{item.label}</h3>
            <span className="text-lg text-cyan-100">{item.value}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700/70">
            <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color, boxShadow: `0 0 18px ${item.color}` }} />
          </div>
        </Card>
      ))}
    </div>
  );
}
