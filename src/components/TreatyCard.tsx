import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Treaty } from "../data/types";

export function TreatyCard({ treaty }: { treaty: Treaty }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 transition hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,95,137,0.14)]">
      <p className="text-xs uppercase tracking-[0.16em] text-[#0f5f89] font-medium">{treaty.status}</p>
      <h2 className="mt-2 text-lg font-medium text-[#07182b]">{treaty.title}</h2>
      <p className="mt-3 text-sm text-[#405366]">{treaty.parties.join(" · ")}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-[#64748b]">Signed</p><p className="font-semibold text-[#07182b]">{treaty.signed}</p></div>
        <div><p className="text-[#64748b]">Documents</p><p className="font-semibold text-[#07182b]">{treaty.documents}</p></div>
      </div>
      <Link to={`/treaties/${treaty.id}`} className="mt-5 inline-flex items-center gap-2 text-sm text-[#0f5f89] font-medium transition hover:text-[#07182b]">
        Treaty Detail <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
