import { Globe2, Search } from "lucide-react";
import { CountryCard } from "../components/CountryCard";
import { PageHero } from "../components/PageHero";
import { usePlatformData } from "../hooks/usePlatformData";

export function CountriesPage() {
  const { data, source } = usePlatformData();
  const completed = data.countries.filter((c) => c.boundaryStatus === "Completed").length;

  return (
    <div className="pb-0">
      <PageHero
        eyebrow="Country registry"
        title="Pacific maritime country profiles"
        description="Explore EEZ status, treaties, deposits, ECS progress, source confidence, and related country records across the Pacific."
        icon={Globe2}
        metrics={[
          { label: "Profiles", value: String(data.countries.length) },
          { label: "Completed", value: String(completed), tone: "green" },
          { label: "Source", value: source === "api" ? "API" : "Local", tone: "purple" },
        ]}
      />

      {/* Wave */}
      <div className="-mx-4 lg:-mx-6 overflow-hidden" style={{ height: 64 }}>
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
          <path d="M0,0 C360,64 1080,0 1440,48 L1440,64 L0,64 Z" fill="#f0f7fb" />
        </svg>
      </div>

      {/* Light zone */}
      <div className="-mx-4 lg:-mx-6 bg-[#f0f7fb] px-4 lg:px-6 pt-2 pb-16">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm">
            <Search className="h-4 w-4 text-[#0f5f89]" aria-hidden="true" />
            <span className="sr-only">Search country profiles</span>
            <input
              className="w-full bg-transparent text-sm text-[#07182b] placeholder:text-slate-400"
              placeholder="Filter countries, regions, ECS status..."
            />
          </label>
          <div className="flex gap-2 text-xs">
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 ring-1 ring-emerald-200">{completed} completed</span>
            <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700 ring-1 ring-amber-200">6 in progress</span>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Countries">
          {data.countries.map((country) => (
            <CountryCard key={country.id} country={country} />
          ))}
        </section>
      </div>
    </div>
  );
}
