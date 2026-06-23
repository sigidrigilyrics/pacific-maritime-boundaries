import {
  Anchor, BookOpen, CalendarDays, ChevronRight,
  Download, FileText, Layers, MapPinned,
  MoreHorizontal, Pencil, ScrollText, ShieldCheck, Upload, X, Check,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { MapContainer } from "../components/MapContainer";
import { usePlatformData } from "../hooks/usePlatformData";
import { gisApi, type GisDocument } from "../lib/gisApi";
import { useGisStore } from "../store/useGisStore";

type DetailTab = "overview" | "boundaries" | "treaties" | "ecs" | "legislation" | "resources" | "timeline";

const TABS: Array<{ id: DetailTab; label: string; icon: typeof MapPinned }> = [
  { id: "overview",    label: "Overview",    icon: BookOpen },
  { id: "boundaries",  label: "Boundaries",  icon: MapPinned },
  { id: "treaties",    label: "Treaties",    icon: Anchor },
  { id: "ecs",         label: "ECS",         icon: ShieldCheck },
  { id: "legislation", label: "Legislation", icon: ScrollText },
  { id: "resources",   label: "Resources",   icon: Layers },
  { id: "timeline",    label: "Timeline",    icon: CalendarDays },
];

type CountryContent = { paragraphs: string[]; pullQuote: string; metadata?: Record<string, string> };

const COUNTRY_VIEW: Record<string, { center: [number, number]; zoom: number }> = {
  "cook-islands":      { center: [-159.8, -21.2], zoom: 6.0 },
  "fiji":              { center: [177.5,  -17.5], zoom: 6.0 },
  "kiribati":          { center: [-157.0,   1.5], zoom: 5.0 },
  "marshall-islands":  { center: [ 168.7,   7.1], zoom: 6.5 },
  "micronesia":        { center: [ 158.2,   6.9], zoom: 6.0 },
  "nauru":             { center: [ 166.9,  -0.5], zoom: 9.0 },
  "niue":              { center: [-169.9, -19.1], zoom: 8.0 },
  "palau":             { center: [ 134.5,   7.5], zoom: 8.0 },
  "papua-new-guinea":  { center: [ 147.2,  -6.3], zoom: 5.5 },
  "samoa":             { center: [-172.1, -13.8], zoom: 7.5 },
  "solomon-islands":   { center: [ 160.2,  -9.4], zoom: 6.5 },
  "tonga":             { center: [-175.5, -21.1], zoom: 7.0 },
  "tuvalu":            { center: [ 178.5,  -8.0], zoom: 7.5 },
  "vanuatu":           { center: [ 167.0, -15.4], zoom: 6.5 },
  "tokelau":           { center: [-171.8,  -9.2], zoom: 9.0 },
  "new-caledonia":     { center: [ 165.6, -21.3], zoom: 6.5 },
  "french-polynesia":  { center: [-149.4, -17.5], zoom: 6.0 },
  "wallis-and-futuna": { center: [-176.2, -14.3], zoom: 9.0 },
  "american-samoa":    { center: [-170.7, -14.3], zoom: 8.0 },
  "pitcairn-islands":  { center: [-128.3, -24.4], zoom: 8.0 },
  "norfolk-island":    { center: [ 167.9, -29.0], zoom: 9.0 },
  "guam":              { center: [ 144.8,  13.5], zoom: 8.0 },
};

function buildDefaultContent(c: { name: string; eezArea: string; ecsStatus: string; unclosStatus: string; depositedStatus: string }): CountryContent {
  return {
    paragraphs: [
      `${c.name} possesses one of the largest Exclusive Economic Zones in the Pacific, covering approximately ${c.eezArea} of ocean space — a vast maritime estate that underpins the country's economic sovereignty and environmental stewardship.`,
      `The country has established maritime boundaries through bilateral agreements with neighbouring states, and maintains active participation in regional ocean governance initiatives led by the Pacific Community and Forum Fisheries Agency.`,
      `The Extended Continental Shelf programme is at the stage of "${c.ecsStatus}". ${c.name} holds ${c.unclosStatus} status under UNCLOS and has ${c.depositedStatus === "Deposited" ? "deposited its maritime zone coordinates with the United Nations Secretary-General" : "ongoing deposit obligations under international maritime law"}.`,
    ],
    pullQuote: `The ${c.name} maritime profile represents a mature boundary framework in the Pacific — combining deposited coordinates, active treaty relationships, and ongoing ECS governance.`,
  };
}

/* ── light-section shared card ── */
function LCard({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CountryDetailPage() {
  const { countryId } = useParams();
  const { data } = usePlatformData();
  const { token, isAdmin } = useGisStore();
  const [tab, setTab] = useState<DetailTab>("overview");
  const [docs, setDocs] = useState<GisDocument[]>([]);
  const [editing, setEditing] = useState(false);

  const country = data.countries.find((c) => c.id === countryId);
  if (!country) return <Navigate to="/countries" replace />;

  const storageKey = `pmbp-country-${country.id}`;
  const [savedContent, setSavedContent] = useState<CountryContent>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? "null") ?? null; } catch { return null; }
  });
  const [draft, setDraft] = useState<CountryContent>(() => savedContent ?? buildDefaultContent(country));

  useEffect(() => {
    if (editing) setDraft(savedContent ?? buildDefaultContent(country));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  function handleSave() {
    setSavedContent(draft);
    localStorage.setItem(storageKey, JSON.stringify(draft));
    setEditing(false);
  }

  function handleCancel() {
    setEditing(false);
  }

  const activeContent = savedContent ?? buildDefaultContent(country);

  const countryTreaties = data.treaties.filter((t) => t.parties.includes(country.name));
  const relatedCountries = country.related
    .map((name) => data.countries.find((c) => c.name === name))
    .filter(Boolean) as typeof data.countries;

  useEffect(() => {
    gisApi.getDocuments("nation", country.name).then(setDocs).catch(() => {});
  }, [country.name]);

  const statCards = [
    { label: "EEZ AREA",        value: country.eezArea,         sub: "Exclusive Economic Zone" },
    { label: "TREATIES",        value: String(country.treaties), sub: "In force agreements" },
    { label: "ECS STATUS",      value: country.ecsStatus,       sub: country.unclosStatus },
    { label: "BOUNDARY STATUS", value: country.boundaryStatus,  sub: country.boundaryStatus === "Completed" ? "All maritime boundaries defined" : "In progress" },
  ];

  return (
    <div className="pb-16">

      {/* ── DARK ZONE ────────────────────────────────── */}
      <div className="space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/countries" className="hover:text-slate-200 transition">Countries</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-400">{country.region}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">{country.name}</span>
          </nav>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setTab("overview"); setEditing((v) => !v); }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ring-1 transition ${
                  editing
                    ? "bg-amber-400/20 text-amber-300 ring-amber-400/40 hover:bg-amber-400/30"
                    : "bg-white/[0.06] text-slate-300 ring-white/10 hover:bg-white/10"
                }`}
              >
                <Pencil className="h-3.5 w-3.5" /> {editing ? "Editing…" : "Edit Content"}
              </button>
              <button className="grid h-7 w-7 place-items-center rounded-md bg-white/[0.06] text-slate-400 ring-1 ring-white/10 transition hover:bg-white/10">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Hero */}
        <div className="glass-panel relative overflow-hidden rounded-2xl p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,229,255,.1),transparent_22rem),radial-gradient(circle_at_88%_5%,rgba(138,63,252,.1),transparent_24rem)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 text-4xl ring-1 ring-white/20 shadow-lg">
                  {country.flag}
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">{country.name}</h1>
                  <p className="mt-1 text-sm font-semibold text-cyan-400">{country.region} · {country.boundaryStatus} Pathway</p>
                </div>
              </div>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-400">{country.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 shrink-0">
              {statCards.map(({ label, value, sub }) => (
                <div key={label} className="rounded-xl bg-white/[0.06] px-5 py-4 ring-1 ring-white/10 min-w-[140px]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
                  <p className="mt-2 text-[15px] font-bold leading-snug text-white">{value}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map */}
        <MapContainer compact flyTo={COUNTRY_VIEW[country.id] ?? { center: [-170, -14], zoom: 5 }} />
      </div>

      {/* ── WAVE TRANSITION ──────────────────────────── */}
      <div className="relative -mx-4 lg:-mx-6 mt-0 overflow-hidden" style={{ height: 80 }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#050b1d" stopOpacity="1" />
              <stop offset="100%" stopColor="#f0f7fb" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path d="M0,20 C240,70 480,0 720,35 C960,70 1200,10 1440,30 L1440,80 L0,80 Z" fill="url(#waveGrad)" />
        </svg>
      </div>

      {/* ── LIGHT ZONE ───────────────────────────────── */}
      <div className="-mx-4 lg:-mx-6 bg-[#f0f7fb] px-4 lg:px-6 pt-2 pb-16">

        {/* Edit mode bar */}
        {editing && (
          <div className="sticky top-[60px] z-30 -mx-4 lg:-mx-6 mb-4 flex items-center justify-between gap-4 bg-[#07182b] px-4 lg:px-6 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              <span className="text-sm font-semibold text-white">Editing Overview</span>
              <span className="hidden text-xs text-slate-400 sm:block">Changes save locally until published</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-[#07182b] transition hover:bg-cyan-300"
              >
                <Check className="h-3.5 w-3.5" /> Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto pb-5 pt-1 flex-wrap">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                tab === id
                  ? "bg-[#07182b] text-white shadow-md"
                  : "bg-white text-[#315167] ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${tab === id ? "text-cyan-400" : "text-[#0f5f89]"}`} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "overview"    && <OverviewTab country={country} treaties={countryTreaties} relatedCountries={relatedCountries} allCountries={data.countries} docs={docs} token={token} isAdmin={isAdmin} onDocsChange={setDocs} editing={editing} content={editing ? draft : activeContent} onContentChange={setDraft} />}
        {tab === "boundaries"  && <BoundariesTab country={country} treaties={countryTreaties} allCountries={data.countries} />}
        {tab === "treaties"    && <TreatiesTab treaties={countryTreaties} allCountries={data.countries} />}
        {tab === "ecs"         && <EcsTab country={country} />}
        {tab === "legislation" && <LegislationTab country={country} />}
        {tab === "resources"   && <ResourcesTab docs={docs} country={country} token={token} isAdmin={isAdmin} onDocsChange={setDocs} />}
        {tab === "timeline"    && <TimelineTab />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────── Overview ── */
function OverviewTab({ country, treaties, relatedCountries, allCountries, docs, token, isAdmin, onDocsChange, editing = false, content, onContentChange }: {
  country: CountryType; treaties: TreatyType[]; relatedCountries: CountryType[];
  allCountries: CountryType[]; docs: GisDocument[];
  token: string | null; isAdmin: boolean; onDocsChange: (d: GisDocument[]) => void;
  editing?: boolean; content?: CountryContent; onContentChange?: (c: CountryContent) => void;
}) {
  const overviewText = content?.paragraphs ?? [
    `${country.name} possesses one of the largest Exclusive Economic Zones in the Pacific, covering approximately ${country.eezArea} of ocean space — a vast maritime estate that underpins the country's economic sovereignty and environmental stewardship.`,
    `The country has established maritime boundaries through bilateral agreements with neighbouring states, and maintains active participation in regional ocean governance initiatives led by the Pacific Community and Forum Fisheries Agency.`,
    `The Extended Continental Shelf programme is at the stage of "${country.ecsStatus}". ${country.name} holds ${country.unclosStatus} status under UNCLOS and has ${country.depositedStatus === "Deposited" ? "deposited its maritime zone coordinates with the United Nations Secretary-General" : "ongoing deposit obligations under international maritime law"}.`,
  ];
  const pullQuoteText = content?.pullQuote ?? `The ${country.name} maritime profile represents a mature boundary framework in the Pacific — combining deposited coordinates, active treaty relationships, and ongoing ECS governance.`;

  function setParagraph(i: number, val: string) {
    if (!onContentChange || !content) return;
    const paragraphs = [...overviewText];
    paragraphs[i] = val;
    onContentChange({ ...content, paragraphs });
  }
  function setPullQuote(val: string) {
    if (!onContentChange || !content) return;
    onContentChange({ ...content, pullQuote: val });
  }
  function setMetaField(key: string, val: string) {
    if (!onContentChange || !content) return;
    onContentChange({ ...content, metadata: { ...content.metadata, [key]: val } });
  }

  const meta = content?.metadata ?? {};
  const keyFacts: [string, string][] = [
    ["Capital",         meta["Capital"]         ?? country.capital],
    ["Region",          meta["Region"]          ?? country.region],
    ["EEZ Area",        meta["EEZ Area"]        ?? country.eezArea],
    ["UNCLOS Status",   meta["UNCLOS Status"]   ?? country.unclosStatus],
    ["ECS Status",      meta["ECS Status"]      ?? country.ecsStatus],
    ["Boundary Status", meta["Boundary Status"] ?? country.boundaryStatus],
    ["Deposited",       meta["Deposited"]       ?? country.depositedStatus],
  ];

  const resources = [
    { label: "Treaty Documents",     sub: `${country.treaties} documents`, type: "PDF" },
    { label: "Boundary Coordinates", sub: "GeoJSON / GPX",                 type: "GeoJSON" },
    { label: "Legislation Extracts", sub: "4 documents",                   type: "DOCX" },
    { label: "ECS Submission",       sub: country.ecsStatus,               type: "PDF" },
    { label: "GIS Layers",           sub: "Spatial data bundle",           type: "ZIP" },
  ];

  const timelineItems = [
    { date: "2026", title: "Profile refreshed",            detail: "Core records aligned with current platform metadata." },
    { date: "2024", title: "Treaty data review",           detail: "Boundary agreement and deposit references reviewed." },
    { date: "2022", title: "Map layer QA",                 detail: "EEZ and ECS reference layers reconciled for display." },
    { date: "2019", title: "Maritime regulations updated", detail: "EEZ Fisheries Regulations revised to align with UNCLOS." },
  ];

  return (
    <div className="space-y-7">

      {/* Overview article + Key Facts sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

        {/* Article */}
        <LCard className={`p-8 ${editing ? "ring-2 ring-amber-300/60 ring-offset-2 ring-offset-[#f0f7fb]" : ""}`}>
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#0f5f89]" />
              <h2 className="text-2xl font-bold tracking-tight text-[#07182b]">Country Overview</h2>
            </div>
            {editing && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-600 ring-1 ring-amber-200">Editable</span>}
          </div>
          <div className="space-y-4">
            {overviewText.map((p, i) =>
              editing ? (
                <textarea
                  key={i}
                  value={p}
                  onChange={(e) => setParagraph(i, e.target.value)}
                  rows={4}
                  className="w-full resize-y rounded-xl border border-amber-200 bg-amber-50/40 px-4 py-3 text-[16px] leading-[1.8] text-[#405366] outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
              ) : (
                <p key={i} className="text-[16px] leading-[1.8] text-[#405366]">{p}</p>
              )
            )}
          </div>
          {/* Pull quote */}
          {editing ? (
            <div className="my-7">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-500">Pull quote</p>
              <textarea
                value={pullQuoteText}
                onChange={(e) => setPullQuote(e.target.value)}
                rows={3}
                className="w-full resize-y rounded-xl border border-amber-200 bg-amber-50/40 px-4 py-3 text-[15px] font-semibold leading-relaxed text-[#17374d] outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          ) : (
            <blockquote className="my-7 border-l-4 border-cyan-400 bg-[#edf8fb] rounded-r-xl px-6 py-5 text-[15px] font-semibold leading-relaxed text-[#17374d]">
              {pullQuoteText}
            </blockquote>
          )}
          <p className="text-[16px] leading-[1.8] text-[#405366]">
            The Maritime Zones Act provides the principal legal framework for defining maritime zones including the territorial sea, contiguous zone, exclusive economic zone and continental shelf, bringing domestic legislation into full alignment with UNCLOS obligations.
          </p>
          <a
            href={`https://pacificdata.org/dashboard/maritime-boundaries/${country.id}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f5f89] hover:text-[#00b7d6] transition"
          >
            Read more about {country.name} on Pacific Data Hub →
          </a>
        </LCard>

        {/* Key Facts sidebar */}
        <LCard className={`p-7 flex flex-col ${editing ? "ring-2 ring-amber-300/60 ring-offset-2 ring-offset-[#f0f7fb]" : ""}`}>
          <div className="flex items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#0f5f89]" />
              <h2 className="text-xl font-bold tracking-tight text-[#07182b]">Key Facts</h2>
            </div>
            {editing && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-600 ring-1 ring-amber-200">Editable</span>}
          </div>
          <div className="flex-1 divide-y divide-slate-100">
            {keyFacts.map(([k, v]) => (
              <div key={k} className={`flex items-center gap-3 py-2.5 ${editing ? "" : "justify-between"}`}>
                <span className="w-32 shrink-0 text-[13px] text-[#607487]">{k}</span>
                {editing ? (
                  <input
                    value={v}
                    onChange={(e) => setMetaField(k, e.target.value)}
                    className="flex-1 rounded-lg border border-amber-200 bg-amber-50/40 px-3 py-1.5 text-[13px] font-semibold text-[#0b253c] outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                ) : (
                  <span className="text-[14px] font-semibold text-[#0b253c] text-right">{v}</span>
                )}
              </div>
            ))}
          </div>
          <a
            href={`https://pacificdata.org/dashboard/maritime-boundaries/${country.id}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-[#315167] transition hover:bg-slate-100"
          >
            View Full Country Profile ↗
          </a>
        </LCard>
      </div>

      {/* Treaties */}
      {treaties.length > 0 && (
        <LCard className="p-7">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Anchor className="h-5 w-5 text-[#0f5f89]" />
              <h2 className="text-xl font-bold tracking-tight text-[#07182b]">Treaties &amp; Boundary Agreements</h2>
            </div>
            <Link to="/treaties" className="text-sm font-semibold text-[#0f5f89] hover:text-[#00b7d6] transition">
              View All Agreements →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {treaties.map((t) => {
              const otherParty = t.parties.find((p) => p !== country.name) ?? t.parties[1];
              const otherCountry = allCountries.find((c) => c.name === otherParty);
              return (
                <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-cyan-300 hover:shadow-sm transition">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{country.flag}</span>
                    <span className="text-2xl">{otherCountry?.flag ?? "🏳"}</span>
                  </div>
                  <p className="text-[13px] font-bold leading-snug text-[#0b253c]">
                    {t.parties.join(" – ")}
                  </p>
                  <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${
                    t.status === "In force"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {t.status}
                  </span>
                  <p className="mt-2 text-xs text-slate-400">Published {t.signed} · {t.boundaryType}</p>
                </div>
              );
            })}
          </div>
        </LCard>
      )}

      {/* Bottom 3-col */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Resources */}
        <LCard className="p-7">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#0f5f89]" />
              <h2 className="text-lg font-bold text-[#07182b]">Available Resources</h2>
            </div>
            <Link to="/datasets" className="text-xs font-semibold text-[#0f5f89] hover:underline">View All →</Link>
          </div>
          <div className="space-y-0 divide-y divide-slate-100">
            {resources.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-3 py-3.5">
                <div>
                  <p className="text-[14px] font-semibold text-[#0b253c]">{r.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.sub}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-[#008eb0]">{r.type}</span>
                  <button className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-[#0f5f89] transition hover:bg-[#edf8fb]">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </LCard>

        {/* Timeline */}
        <LCard className="p-7">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#0f5f89]" />
            <h2 className="text-lg font-bold text-[#07182b]">Timeline</h2>
          </div>
          <div className="space-y-0">
            {timelineItems.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 shrink-0 rounded-full bg-[#00b7d6] ring-2 ring-cyan-100 mt-1" />
                  {i < timelineItems.length - 1 && <div className="w-px flex-1 min-h-[2rem] bg-slate-200 mt-1" />}
                </div>
                <div className="pb-5">
                  <p className="text-[14px] font-bold text-[#08213a]">{item.title}</p>
                  <p className="text-xs font-bold text-[#008eb0] mt-0.5">{item.date}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#526273]">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </LCard>

        {/* Related Countries */}
        <LCard className="p-7">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPinned className="h-5 w-5 text-[#0f5f89]" />
              <h2 className="text-lg font-bold text-[#07182b]">Related Countries</h2>
            </div>
            <Link to="/countries" className="text-xs font-semibold text-[#0f5f89] hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {relatedCountries.map((rc) => (
              <Link
                key={rc.id}
                to={`/countries/${rc.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition hover:border-cyan-300 hover:shadow-sm"
              >
                <span className="text-2xl">{rc.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#0b253c]">{rc.name}</p>
                  <p className="text-xs text-slate-400">{rc.region}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-400">EEZ</p>
                  <p className="text-xs font-semibold text-[#008eb0]">{rc.eezArea.replace(" sq km", "")}</p>
                </div>
              </Link>
            ))}
          </div>
        </LCard>
      </div>

      {/* Backend docs */}
      {(docs.length > 0 || isAdmin) && (
        <CountryDocumentsInline countryName={country.name} docs={docs} token={token} isAdmin={isAdmin} onDocsChange={onDocsChange} />
      )}
    </div>
  );
}

/* ─────────────────────────────────── Boundaries ── */
function BoundariesTab({ country, treaties, allCountries }: { country: CountryType; treaties: TreatyType[]; allCountries: CountryType[] }) {
  return (
    <LCard className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <MapPinned className="h-5 w-5 text-[#0f5f89]" />
        <h2 className="text-2xl font-bold tracking-tight text-[#07182b]">Boundary Agreements</h2>
      </div>
      {treaties.length === 0 ? (
        <p className="text-[15px] text-slate-500">No boundary treaty records found for {country.name}.</p>
      ) : (
        <div className="space-y-3">
          {treaties.map((t) => {
            const other = t.parties.find((p) => p !== country.name) ?? t.parties[1];
            const otherC = allCountries.find((c) => c.name === other);
            return (
              <div key={t.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4">
                <div className="flex gap-2"><span className="text-2xl">{country.flag}</span><span className="text-2xl">{otherC?.flag ?? "🏳"}</span></div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-[#0b253c]">{t.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.parties.join(" · ")} · {t.boundaryType}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${t.status === "In force" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{t.status}</span>
                <span className="text-sm text-slate-400">{t.signed}</span>
              </div>
            );
          })}
        </div>
      )}
    </LCard>
  );
}

/* ─────────────────────────────────── Treaties ── */
function TreatiesTab({ treaties, allCountries }: { treaties: TreatyType[]; allCountries: CountryType[] }) {
  return (
    <div className="space-y-4">
      {treaties.length === 0 ? (
        <LCard className="p-8"><p className="text-[15px] text-slate-500">No treaty records found.</p></LCard>
      ) : treaties.map((t) => (
        <LCard key={t.id} className="p-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex gap-2">{t.parties.map((p) => { const c = allCountries.find((c) => c.name === p); return <span key={p} className="text-2xl">{c?.flag ?? "🏳"}</span>; })}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-[#07182b]">{t.title}</p>
              <p className="text-sm text-slate-400 mt-0.5">{t.parties.join(" · ")}</p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${t.status === "In force" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{t.status}</span>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">Signed {t.signed}</span>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">{t.boundaryType}</span>
            </div>
          </div>
        </LCard>
      ))}
    </div>
  );
}

/* ─────────────────────────────────── ECS ── */
function EcsTab({ country }: { country: CountryType }) {
  return (
    <LCard className="p-8 space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-[#0f5f89]" />
        <h2 className="text-2xl font-bold tracking-tight text-[#07182b]">Extended Continental Shelf</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["ECS Status", country.ecsStatus], ["UNCLOS Status", country.unclosStatus], ["Deposited", country.depositedStatus], ["Boundary", country.boundaryStatus]].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{k}</p>
            <p className="mt-2 text-[15px] font-bold text-[#08213a]">{v}</p>
          </div>
        ))}
      </div>
      <p className="text-[16px] leading-[1.8] text-[#405366]">
        {country.name}'s Extended Continental Shelf programme is at the stage of "{country.ecsStatus}". The CLCS reviewed the submission and issued recommendations that {country.name} has committed to implementing within its national maritime policy framework.
      </p>
    </LCard>
  );
}

/* ─────────────────────────────────── Legislation ── */
function LegislationTab({ country }: { country: CountryType }) {
  const items = [
    { title: "Maritime Zones Act", year: "2018", type: "National Legislation", detail: "Principal legislation defining maritime zones including the territorial sea, contiguous zone, EEZ and continental shelf." },
    { title: "Territorial Sea Baselines Regulations", year: "2020", type: "Regulation", detail: "Declared territorial sea baselines in accordance with the Maritime Zones Act." },
    { title: "EEZ Outer Limits Regulations", year: "2021", type: "Regulation", detail: "Declared the outer limits of the Exclusive Economic Zone." },
  ];
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <LCard key={item.title} className="p-6 flex items-start gap-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#edf8fb] ring-1 ring-[#b8e4f0]">
            <ScrollText className="h-5 w-5 text-[#0f5f89]" />
          </div>
          <div className="flex-1">
            <p className="text-[16px] font-bold text-[#07182b]">{item.title}</p>
            <p className="text-xs font-semibold text-[#0f5f89] mt-0.5">{item.type} · {item.year}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#526273]">{item.detail}</p>
          </div>
          <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-[#315167] transition hover:bg-slate-100">
            <Download className="h-3.5 w-3.5" /> Download
          </button>
        </LCard>
      ))}
    </div>
  );
}

/* ─────────────────────────────────── Resources ── */
function ResourcesTab({ docs, country, token, isAdmin, onDocsChange }: {
  docs: GisDocument[]; country: CountryType; token: string | null; isAdmin: boolean; onDocsChange: (d: GisDocument[]) => void;
}) {
  const rows = [
    { label: "Boundary Coordinates", sub: "GeoJSON / GPX", type: "GeoJSON", size: "2.4 MB" },
    { label: "Treaty Documents",     sub: `${country.treaties} documents`, type: "PDF", size: "—" },
    { label: "Legislation Extracts", sub: "4 documents", type: "PDF", size: "1.8 MB" },
    { label: "ECS Submission",       sub: country.ecsStatus, type: "PDF", size: "3.7 MB" },
    { label: "GIS Layers",           sub: "Download spatial data", type: "ZIP", size: "45 MB" },
  ];
  return (
    <div className="space-y-6">
      <LCard className="overflow-hidden">
        <div className="border-b border-slate-100 px-7 py-5">
          <h2 className="text-xl font-bold text-[#07182b]">Available Downloads</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-7 py-3 text-left">Resource</th>
              <th className="px-7 py-3 text-left">Details</th>
              <th className="px-7 py-3 text-left">Size</th>
              <th className="px-7 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.label} className="hover:bg-slate-50">
                <td className="px-7 py-4 font-semibold text-[#0b253c]">{r.label}</td>
                <td className="px-7 py-4 text-slate-400">{r.sub}</td>
                <td className="px-7 py-4 font-semibold text-[#008eb0]">{r.size}</td>
                <td className="px-7 py-4 text-right">
                  <button className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-[#0f5f89] transition hover:bg-[#edf8fb]">
                    <Download className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </LCard>
      <CountryDocumentsInline countryName={country.name} docs={docs} token={token} isAdmin={isAdmin} onDocsChange={onDocsChange} />
    </div>
  );
}

/* ─────────────────────────────────── Timeline ── */
function TimelineTab() {
  const items = [
    { date: "2026", title: "Profile refreshed",            detail: "Core records aligned with current platform metadata." },
    { date: "2024", title: "Treaty data review",           detail: "Boundary agreement and deposit references reviewed." },
    { date: "2021", title: "EEZ outer limits declared",    detail: "EEZ outer limits regulations formally declared." },
    { date: "2020", title: "Territorial baselines set",    detail: "Territorial sea baselines regulations declared." },
    { date: "2018", title: "Maritime Zones Act",           detail: "Principal maritime zones legislation enacted." },
    { date: "2016", title: "CLCS recommendations",         detail: "Commission on the Limits of the Continental Shelf issued recommendations." },
  ];
  return (
    <LCard className="p-8">
      <div className="flex items-center gap-2 mb-8">
        <CalendarDays className="h-5 w-5 text-[#0f5f89]" />
        <h2 className="text-2xl font-bold tracking-tight text-[#07182b]">Full Timeline</h2>
      </div>
      <div>
        {items.map((item, i) => (
          <div key={i} className="flex gap-5">
            <div className="flex flex-col items-center">
              <div className="h-3.5 w-3.5 shrink-0 rounded-full bg-[#00b7d6] ring-4 ring-cyan-50 mt-1" />
              {i < items.length - 1 && <div className="w-0.5 flex-1 min-h-[2.5rem] bg-slate-200 mt-1" />}
            </div>
            <div className="pb-7">
              <span className="text-xs font-bold text-[#008eb0]">{item.date}</span>
              <p className="text-[16px] font-bold text-[#08213a] mt-0.5">{item.title}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#526273]">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </LCard>
  );
}

/* ─────────────────────────────────── Inline Docs ── */
function CountryDocumentsInline({ countryName, docs, token, isAdmin, onDocsChange }: {
  countryName: string; docs: GisDocument[]; token: string | null; isAdmin: boolean; onDocsChange: (d: GisDocument[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [docName, setDocName] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!token || !docFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", docFile); fd.append("entity_type", "nation");
      fd.append("entity_id", countryName); fd.append("name", docName || docFile.name);
      await gisApi.uploadDocument(fd, token);
      onDocsChange(await gisApi.getDocuments("nation", countryName));
      setDocFile(null); setDocName(""); setStatus("Document attached");
      if (fileRef.current) fileRef.current.value = "";
    } catch { setStatus("Upload failed"); }
    finally { setUploading(false); }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    await gisApi.deleteDocument(id, token);
    onDocsChange(docs.filter((d) => d.id !== id));
  }

  return (
    <LCard className="p-7">
      <div className="flex items-center gap-2 mb-5">
        <FileText className="h-5 w-5 text-[#0f5f89]" />
        <h2 className="text-lg font-bold text-[#07182b]">Attached Documents</h2>
      </div>
      {docs.length === 0 ? (
        <p className="text-[14px] text-slate-400">No documents attached to {countryName} yet.</p>
      ) : (
        <div className="divide-y divide-slate-100 mb-4">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 py-3">
              <FileText className="h-4 w-4 shrink-0 text-slate-300" />
              <span className="flex-1 min-w-0 truncate text-[14px] font-medium text-[#0b253c]">{doc.name}</span>
              <a href={gisApi.downloadUrl(doc.id)} target="_blank" rel="noreferrer"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#0f5f89] transition hover:bg-[#edf8fb]">
                Download
              </a>
              {isAdmin && (
                <button onClick={() => handleDelete(doc.id)} className="text-slate-300 transition hover:text-red-400 text-sm">✕</button>
              )}
            </div>
          ))}
        </div>
      )}
      {isAdmin && (
        <div className="space-y-3 border-t border-slate-100 pt-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Attach Document</p>
          <input type="text" value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Document name (optional)"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0b253c] placeholder:text-slate-400 outline-none focus:border-[#00b7d6] focus:ring-2 focus:ring-cyan-100" />
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-sm text-slate-400 transition hover:border-[#00b7d6] hover:text-[#0f5f89]">
            <Upload className="h-4 w-4" />
            {docFile ? docFile.name : "Drop PDF/doc or click"}
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx" className="hidden" onChange={(e) => setDocFile(e.target.files?.[0] ?? null)} />
          </label>
          <button onClick={handleUpload} disabled={uploading || !docFile}
            className="w-full rounded-xl bg-[#07182b] py-2.5 text-sm font-bold text-white transition hover:bg-[#0b2540] disabled:opacity-40">
            {uploading ? "Uploading…" : "Attach Document"}
          </button>
          {status && <p className="text-xs text-slate-400">{status}</p>}
        </div>
      )}
    </LCard>
  );
}

type CountryType = ReturnType<typeof usePlatformData>["data"]["countries"][number];
type TreatyType  = ReturnType<typeof usePlatformData>["data"]["treaties"][number];
