export function Timeline({
  items,
  light = false,
}: {
  items: { date: string; title: string; detail: string }[];
  light?: boolean;
}) {
  return (
    <ol className="space-y-4">
      {items.map((item) => (
        <li key={`${item.date}-${item.title}`} className="relative pl-7">
          <span
            className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${light ? "bg-[#0f5f89] shadow-[0_0_8px_rgba(15,95,137,0.4)]" : "bg-primary shadow-glow"}`}
            aria-hidden="true"
          />
          <p className={`text-sm font-medium ${light ? "text-[#07182b]" : "text-white"}`}>{item.title}</p>
          <p className={`text-xs ${light ? "text-[#0f5f89]" : "text-cyan-200"}`}>{item.date}</p>
          <p className={`mt-1 text-sm leading-6 ${light ? "text-[#405366]" : "text-slate-400"}`}>{item.detail}</p>
        </li>
      ))}
    </ol>
  );
}
