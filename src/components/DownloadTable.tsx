import { Download } from "lucide-react";
import { Button } from "./ui/button";

export function DownloadTable({ light = false }: { light?: boolean }) {
  const rows = [
    ["Boundary coordinates", "GeoJSON", "2.4 MB"],
    ["Treaty documents", "PDF bundle", "18 MB"],
    ["Legislation extract", "DOCX", "740 KB"],
  ];

  return (
    <div className={`overflow-hidden rounded-lg ring-1 ${light ? "ring-slate-200" : "ring-white/10"}`}>
      <table className="w-full text-left text-sm">
        <thead className={`text-xs uppercase tracking-[0.14em] ${light ? "bg-slate-50 text-[#64748b]" : "bg-white/5 text-slate-400"}`}>
          <tr>
            <th className="px-4 py-3">Resource</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Size</th>
            <th className="px-4 py-3"><span className="sr-only">Download</span></th>
          </tr>
        </thead>
        <tbody className={`divide-y ${light ? "divide-slate-100" : "divide-white/10"}`}>
          {rows.map(([name, type, size]) => (
            <tr key={name}>
              <td className={`px-4 py-3 ${light ? "text-[#07182b]" : "text-white"}`}>{name}</td>
              <td className={`px-4 py-3 ${light ? "text-[#405366]" : "text-slate-300"}`}>{type}</td>
              <td className={`px-4 py-3 ${light ? "text-[#64748b]" : "text-slate-400"}`}>{size}</td>
              <td className="px-4 py-3 text-right">
                <Button variant="quiet" className="min-h-8 px-2" aria-label={`Download ${name}`}>
                  <Download className={`h-4 w-4 ${light ? "text-[#0f5f89]" : ""}`} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
