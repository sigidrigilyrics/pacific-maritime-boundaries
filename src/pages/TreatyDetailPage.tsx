import { FileText } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { DownloadTable } from "../components/DownloadTable";
import { MapContainer } from "../components/MapContainer";
import { PageHero } from "../components/PageHero";
import { Timeline } from "../components/Timeline";
import { Card } from "../components/ui/card";
import { usePlatformData } from "../hooks/usePlatformData";

export function TreatyDetailPage() {
  const { treatyId } = useParams();
  const { data } = usePlatformData();
  const treaty = data.treaties.find((item) => item.id === treatyId);
  if (!treaty) return <Navigate to="/treaties" replace />;

  return (
    <div className="pb-0">
      {/* Dark zone: hero + map */}
      <PageHero
        eyebrow={treaty.status}
        title={treaty.title}
        description={`${treaty.boundaryType} agreement between ${treaty.parties.join(" and ")}.`}
        icon={FileText}
        metrics={[
          { label: "Signed", value: treaty.signed, tone: "purple" },
          { label: "Parties", value: String(treaty.parties.length) },
          { label: "Documents", value: String(treaty.documents), tone: "green" },
        ]}
      />
      <section className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <MapContainer compact />
        <Card className="p-5">
          <h2 className="text-sm uppercase tracking-[0.18em] text-white">Parties</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {treaty.parties.map((party) => (
              <span key={party} className="rounded-full bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">{party}</span>
            ))}
          </div>
          <h2 className="mt-8 text-sm uppercase tracking-[0.18em] text-white">Coordinates</h2>
          <p className="mt-4 text-sm leading-6 text-slate-400">Coordinate tables are represented as mock data and ready for geodesic line integration.</p>
        </Card>
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
                  { date: treaty.signed, title: "Agreement signed", detail: "Instrument recorded in the treaty catalogue." },
                  { date: "2026", title: "Platform QA", detail: "Coordinates and document metadata prepared for review." },
                ]}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
