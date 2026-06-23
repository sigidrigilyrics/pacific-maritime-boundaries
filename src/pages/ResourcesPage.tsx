import { BookOpen } from "lucide-react";
import { PageHero } from "../components/PageHero";

const resources = [
  "Data standards",
  "Boundary workflow guide",
  "UNCLOS reference notes",
  "Coordinate QA checklist",
  "Publication templates",
  "Project updates",
];

export function ResourcesPage() {
  return (
    <div className="pb-0">
      <PageHero
        eyebrow="Resources"
        title="Guides, references, and project intelligence"
        description="Operational materials for maritime boundary review, data preparation, publication workflows, QA, and governance."
        icon={BookOpen}
        metrics={[
          { label: "Guides", value: "6" },
          { label: "Workflow", value: "Live", tone: "green" },
          { label: "Audience", value: "Regional", tone: "purple" },
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
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <div
              key={resource}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 transition hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,95,137,0.12)]"
            >
              <h2 className="text-lg font-medium text-[#07182b]">{resource}</h2>
              <p className="mt-3 text-sm leading-[1.8] text-[#405366]">
                Curated prototype content ready to connect with documents, datasets, and platform governance.
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
