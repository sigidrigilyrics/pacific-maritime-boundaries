import { MaritimeMap } from "../components/MapContainer";
import { DashboardTabs } from "../components/dashboard/DashboardTabs";

export function DashboardPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0">
        <MaritimeMap />
      </div>
      <aside className="min-w-0 xl:max-h-[calc(100dvh-104px)] xl:overflow-y-auto">
        <DashboardTabs />
      </aside>
    </div>
  );
}
