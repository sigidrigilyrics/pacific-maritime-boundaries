import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Country } from "../data/types";

export function CountryCard({ country }: { country: Country }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,95,137,0.14)]">
      <div className="mb-5 h-1 rounded-full bg-gradient-to-r from-[#0f5f89] via-cyan-400 to-transparent opacity-70" />
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-16 place-items-center rounded-md bg-[#edf8fb] text-xl font-semibold text-[#07182b] ring-1 ring-slate-200" aria-hidden="true">{country.code}</span>
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs text-[#0f5f89] ring-1 ring-cyan-200/60">{country.boundaryStatus}</span>
      </div>
      <h2 className="mt-5 text-xl font-medium text-[#07182b]">{country.name}</h2>
      <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#405366]">{country.summary}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[#64748b]">Treaties</p>
          <p className="text-lg font-semibold text-[#07182b]">{country.treaties}</p>
        </div>
        <div>
          <p className="text-[#64748b]">EEZ Area</p>
          <p className="truncate text-lg font-semibold text-[#07182b]">{country.eezArea}</p>
        </div>
      </div>
      <Link to={`/countries/${country.id}`} className="mt-5 inline-flex items-center gap-2 text-sm text-[#0f5f89] font-medium transition group-hover:text-[#07182b]">
        View Page <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
