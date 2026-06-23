import { FileText, Search } from "lucide-react";
import { PageHero } from "../components/PageHero";
import { TreatyCard } from "../components/TreatyCard";
import { usePlatformData } from "../hooks/usePlatformData";

export function TreatiesPage() {
  const { data } = usePlatformData();

  return (
    <div className="pb-0">
      <PageHero
        eyebrow="Treaty registry"
        title="Boundary agreements and instruments"
        description="Track parties, coordinates, documents, deposits, treaty timelines, ratification status, and publication readiness."
        icon={FileText}
        metrics={[
          { label: "Mock Records", value: String(data.treaties.length), tone: "purple" },
          { label: "In force", value: "36", tone: "green" },
          { label: "Shared limits", value: "48" },
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
        <label className="mb-6 flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm">
          <Search className="h-4 w-4 text-[#0f5f89]" aria-hidden="true" />
          <input
            className="w-full bg-transparent text-sm text-[#07182b] placeholder:text-slate-400"
            placeholder="Search treaty parties, years, boundary type..."
          />
        </label>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.treaties.map((treaty) => (
            <TreatyCard key={treaty.id} treaty={treaty} />
          ))}
        </section>
      </div>
    </div>
  );
}
