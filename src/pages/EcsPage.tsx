import { ShieldCheck } from "lucide-react";
import { DownloadTable } from "../components/DownloadTable";
import { MapContainer } from "../components/MapContainer";
import { PageHero } from "../components/PageHero";
import { Timeline } from "../components/Timeline";
import { usePlatformData } from "../hooks/usePlatformData";

export function EcsPage() {
  const { data } = usePlatformData();

  return (
    <div className="pb-0">
      {/* Dark zone: hero + map */}
      <PageHero
        eyebrow="Extended continental shelf"
        title="ECS submissions and recommendation pathways"
        description="Track submission status, maps, recommendations, evidence packs, document readiness, and country-level ECS pathway progress."
        icon={ShieldCheck}
        metrics={[
          { label: "Records", value: String(data.ecsRecords.length), tone: "amber" },
          { label: "Advanced", value: "9 of 22", tone: "purple" },
          { label: "Publication", value: "69%", tone: "green" },
        ]}
      />
      <div className="mt-5">
        <MapContainer compact />
      </div>

      {/* Wave */}
      <div className="-mx-4 lg:-mx-6 overflow-hidden mt-5" style={{ height: 64 }}>
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
          <path d="M0,0 C360,64 1080,0 1440,48 L1440,64 L0,64 Z" fill="#f0f7fb" />
        </svg>
      </div>

      {/* Light zone */}
      <div className="-mx-4 lg:-mx-6 bg-[#f0f7fb] px-4 lg:px-6 pt-6 pb-16">
        <section className="grid gap-4 lg:grid-cols-4 mb-6">
          {data.ecsRecords.map((record) => (
            <div
              key={record.id}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 transition hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,95,137,0.12)]"
            >
              <p className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs uppercase tracking-[0.12em] text-amber-600 ring-1 ring-amber-200">
                {record.status}
              </p>
              <h2 className="mt-2 text-lg font-medium text-[#07182b]">{record.country}</h2>
              <p className="mt-4 text-sm text-[#405366]">Submitted: {record.submitted}</p>
              <p className="mt-2 text-sm leading-6 text-[#405366]">{record.recommendation}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <h2 className="text-sm uppercase tracking-[0.18em] text-[#07182b] font-semibold">Documents</h2>
            <div className="mt-5">
              <DownloadTable light />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <h2 className="text-sm uppercase tracking-[0.18em] text-[#07182b] font-semibold">Timeline</h2>
            <div className="mt-5">
              <Timeline
                light
                items={[
                  { date: "2026", title: "ECS pathway review", detail: "Priority records refreshed for prototype publication." },
                  { date: "2024", title: "Recommendations indexed", detail: "Mock recommendation records linked to country profiles." },
                ]}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
