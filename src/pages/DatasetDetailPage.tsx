import { Database } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { DownloadTable } from "../components/DownloadTable";
import { MapContainer } from "../components/MapContainer";
import { PageHero } from "../components/PageHero";
import { Timeline } from "../components/Timeline";
import { Card } from "../components/ui/card";
import { usePlatformData } from "../hooks/usePlatformData";

export function DatasetDetailPage() {
  const { datasetId } = useParams();
  const { data } = usePlatformData();
  const dataset = data.datasets.find((item) => item.id === datasetId);
  if (!dataset) return <Navigate to="/datasets" replace />;

  return (
    <div className="pb-0">
      {/* Dark zone: hero + map */}
      <PageHero
        eyebrow={dataset.category}
        title={dataset.title}
        description={`Version ${dataset.version}, last refreshed ${dataset.updated}, containing ${dataset.records}.`}
        icon={Database}
        metrics={[
          { label: "Version", value: dataset.version },
          { label: "Updated", value: dataset.updated, tone: "purple" },
          { label: "Access", value: "Open", tone: "green" },
        ]}
      />
      <section className="mt-5 grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <Card className="p-5">
          <h2 className="text-sm uppercase tracking-[0.18em] text-white">Metadata</h2>
          <dl className="mt-5 space-y-3 text-sm">
            {Object.entries({
              Category: dataset.category,
              Records: dataset.records,
              Updated: dataset.updated,
              Version: dataset.version,
              Access: "Open data prototype",
            }).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-slate-500">{key}</dt>
                <dd className="text-right text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <MapContainer compact />
      </section>

      {/* Wave */}
      <div className="-mx-4 lg:-mx-6 overflow-hidden mt-5" style={{ height: 64 }}>
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
          <path d="M0,0 C360,64 1080,0 1440,48 L1440,64 L0,64 Z" fill="#f0f7fb" />
        </svg>
      </div>

      {/* Light zone */}
      <div className="-mx-4 lg:-mx-6 bg-[#f0f7fb] px-4 lg:px-6 pt-6 pb-16">
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <h2 className="text-sm uppercase tracking-[0.18em] text-[#07182b] font-semibold">Downloads</h2>
            <div className="mt-5">
              <DownloadTable light />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <h2 className="text-sm uppercase tracking-[0.18em] text-[#07182b] font-semibold">Version History</h2>
            <div className="mt-5">
              <Timeline
                light
                items={[
                  { date: dataset.updated, title: `${dataset.version} release`, detail: "Metadata refreshed and prototype layers linked." },
                  { date: "2025", title: "Previous release", detail: "Source records reconciled for regional comparison." },
                ]}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
