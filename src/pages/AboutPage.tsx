import { Sparkles } from "lucide-react";
import { PageHero } from "../components/PageHero";

const sections = [
  {
    title: "Map-first discovery",
    body: "Country profiles, EEZ polygons, and boundary data presented through an interactive map interface optimised for Pacific maritime intelligence.",
  },
  {
    title: "Transparent governance",
    body: "Treaty registries, ECS submission records, and ratification status tracked against source documents with full audit trails.",
  },
  {
    title: "Data publication readiness",
    body: "Built as a working React prototype with reusable components and realistic mock data for regional stakeholder review and feedback.",
  },
];

export function AboutPage() {
  return (
    <div className="pb-0">
      <PageHero
        eyebrow="About"
        title="A premium ocean intelligence prototype for Pacific maritime boundaries."
        description="The platform brings country profiles, EEZ polygons, treaties, datasets, ECS records, and publication pathways into one map-first experience."
        icon={Sparkles}
        metrics={[
          { label: "Mode", value: "Prototype" },
          { label: "Stack", value: "Full-stack", tone: "purple" },
          { label: "Data", value: "Mock API", tone: "green" },
        ]}
      />

      {/* Wave */}
      <div className="-mx-4 lg:-mx-6 overflow-hidden" style={{ height: 64 }}>
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
          <path d="M0,0 C360,64 1080,0 1440,48 L1440,64 L0,64 Z" fill="#f0f7fb" />
        </svg>
      </div>

      {/* Light zone */}
      <div className="-mx-4 lg:-mx-6 bg-[#f0f7fb] px-4 lg:px-6 pt-6 pb-16">
        <section className="grid gap-6 lg:grid-cols-3">
          {sections.map(({ title, body }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-7">
              <h2 className="text-xl font-semibold text-[#07182b]">{title}</h2>
              <p className="mt-4 text-[16px] leading-[1.8] text-[#405366]">{body}</p>
            </div>
          ))}
        </section>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white shadow-sm p-8">
          <h2 className="text-2xl font-bold text-[#07182b]">Platform stack</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Frontend", value: "React 18 + TypeScript + Tailwind CSS" },
              { label: "Map engine", value: "MapLibre GL JS 4.7 + MapTiler Hybrid" },
              { label: "Backend", value: "FastAPI + PostGIS + FastAPI-Users" },
              { label: "State", value: "Zustand 5 + React Router 6" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-[#f0f7fb] border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#0f5f89] font-medium">{label}</p>
                <p className="mt-2 text-sm font-semibold text-[#07182b]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
