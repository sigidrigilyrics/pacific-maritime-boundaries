import { HeaderNav } from "./HeaderNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <HeaderNav />
      <main className="flex-1 px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
        <div className="mx-auto w-full max-w-[1560px]">
          {children}
        </div>
      </main>
    </div>
  );
}
