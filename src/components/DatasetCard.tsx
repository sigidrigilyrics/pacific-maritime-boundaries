import { ArrowRight, Database } from "lucide-react";
import { Link } from "react-router-dom";
import type { Dataset } from "../data/types";

export function DatasetCard({ dataset }: { dataset: Dataset }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 transition hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,95,137,0.14)]">
      <Database className="h-8 w-8 text-[#0f5f89]" aria-hidden="true" />
      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#0f5f89] font-medium">{dataset.category}</p>
      <h2 className="mt-2 text-lg font-medium text-[#07182b]">{dataset.title}</h2>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-[#64748b]">Records</p><p className="font-semibold text-[#07182b]">{dataset.records}</p></div>
        <div><p className="text-[#64748b]">Version</p><p className="font-semibold text-[#07182b]">{dataset.version}</p></div>
      </div>
      <Link to={`/datasets/${dataset.id}`} className="mt-5 inline-flex items-center gap-2 text-sm text-[#0f5f89] font-medium transition hover:text-[#07182b]">
        Dataset Detail <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
