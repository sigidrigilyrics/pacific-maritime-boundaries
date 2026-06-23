import { useState } from "react";
import { FileText, Grid2X2, Newspaper, Shield, Workflow } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { countries, treatyProgress } from "../../data/mockData";
import { cn } from "../../lib/utils";
import { Timeline } from "../Timeline";
import { Card } from "../ui/card";
import { ProgressCards } from "./ProgressCards";

const tabs = [
  { id: "Overview", icon: Grid2X2 },
  { id: "Treaties", icon: Shield },
  { id: "ECS Progress", icon: FileText },
  { id: "Publications", icon: Newspaper },
  { id: "Updates", icon: Workflow },
] as const;
type DashboardTab = (typeof tabs)[number];

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<DashboardTab["id"]>("Overview");

  return (
    <section className="glass-panel rounded-lg p-3 shadow-glow/20">
      <div className="border-b border-white/10 pb-3">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Dashboard panels">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={cn(
                "flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-300 transition hover:bg-white/8 hover:text-white",
                activeTab === tab.id && "bg-transparent text-white shadow-[inset_0_-2px_0_#00E5FF]",
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {tab.id}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4">
        {activeTab === "Overview" && <OverviewPanel />}
        {activeTab === "Treaties" && <TreatiesPanel />}
        {activeTab === "ECS Progress" && <EcsPanel />}
        {activeTab === "Publications" && <PublicationsPanel />}
        {activeTab === "Updates" && <UpdatesPanel />}
      </div>
    </section>
  );
}

function OverviewPanel() {
  const completed  = countries.filter(c => c.boundaryStatus === "Completed").length;
  const inProgress = countries.filter(c => c.boundaryStatus === "In Progress").length;
  const notStarted = countries.filter(c => c.boundaryStatus === "Not Started").length;
  const noData     = countries.filter(c => c.boundaryStatus === "No Data").length;
  const total = countries.length;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-xs uppercase tracking-[0.18em] text-white">Country Status</h2>
        <div className="mt-4 flex h-5 overflow-hidden rounded-full bg-slate-700/70" aria-label="Country status progress">
          <div style={{ width: `${(completed / total) * 100}%` }}  className="bg-gradient-to-r from-primary to-success" />
          <div style={{ width: `${(inProgress / total) * 100}%` }} className="bg-warning" />
          <div style={{ width: `${(notStarted / total) * 100}%` }} className="bg-accent" />
          <div style={{ width: `${(noData / total) * 100}%` }}     className="bg-slate-500" />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {([
            [completed,  "Done",    "text-primary"],
            [inProgress, "Active",  "text-warning"],
            [notStarted, "Pending", "text-accent"],
            [noData,     "N/A",     "text-slate-300"],
          ] as const).map(([value, label, tone]) => (
            <div key={label}>
              <p className={`text-xl font-semibold ${tone}`}>{value}</p>
              <p className="mt-1 text-[10px] text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </Card>
      <ProgressCards />
      <Card className="p-4">
        <h2 className="text-xs uppercase tracking-[0.18em] text-white">Intelligence Note</h2>
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Strong maritime zones pathway progress. Treaty and publication workflows need targeted country-by-country review.
        </p>
      </Card>
    </div>
  );
}

function TreatiesPanel() {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-xs uppercase tracking-[0.18em] text-white">Treaty Progress</h2>
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={treatyProgress}>
              <defs>
                <linearGradient id="dashboardTreatyFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#8A3FFC" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#8A3FFC" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "rgba(5,11,29,.92)", border: "1px solid rgba(0,229,255,.2)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="treaties" stroke="#B46CFF" strokeWidth={2} fill="url(#dashboardTreatyFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-4">
        <h2 className="text-xs uppercase tracking-[0.18em] text-white">Priorities</h2>
        <div className="mt-3 space-y-2">
          {["Fiji-Tonga boundary review", "Vanuatu-New Caledonia deposit package", "Samoa-American Samoa technical note"].map((item) => (
            <div key={item} className="rounded-md bg-white/[0.035] px-3 py-2 text-xs text-slate-200 ring-1 ring-white/5">{item}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function EcsPanel() {
  return <ProgressCards />;
}

function PublicationsPanel() {
  return (
    <div className="space-y-3">
      {[
        ["Deposited EEZ charts", "14 packages"],
        ["Legislation extracts", "33 documents"],
        ["Open data releases", "120+ layers"],
      ].map(([title, value]) => (
        <Card key={title} className="flex items-center justify-between p-4">
          <p className="text-xs text-slate-400">{title}</p>
          <p className="text-lg font-semibold text-white">{value}</p>
        </Card>
      ))}
    </div>
  );
}

function UpdatesPanel() {
  return (
    <Card className="p-5">
      <h2 className="text-sm uppercase tracking-[0.18em] text-white">Latest Updates</h2>
      <div className="mt-5">
        <Timeline
          items={[
            { date: "May 2026", title: "Niue and Cook Islands marked complete", detail: "Pathway records moved into completed status for prototype reporting." },
            { date: "Apr 2026", title: "High Seas Pockets Register updated", detail: "Mock declaration metadata refreshed for the regional dashboard." },
            { date: "Mar 2026", title: "Vanuatu treaty package added", detail: "Boundary instrument metadata linked to treaty and country records." },
          ]}
        />
      </div>
    </Card>
  );
}
