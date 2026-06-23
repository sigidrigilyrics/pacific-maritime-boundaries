import { CircleUserRound, Search, Settings, Sparkles } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthModal } from "../AuthModal";
import { cn } from "../../lib/utils";
import { useGisStore } from "../../store/useGisStore";

const navItems = [
  ["Dashboard", "/dashboard"],
  ["Countries", "/countries"],
  ["Treaties", "/treaties"],
  ["Datasets", "/datasets"],
  ["ECS", "/ecs"],
  ["Resources", "/resources"],
  ["About", "/about"],
];

export function HeaderNav() {
  const { token, userEmail, isAdmin } = useGisStore();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      <header className="sticky top-0 z-40 border-b border-cyan-100/10 bg-ocean/72 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1560px] items-center gap-2 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 lg:px-6">
        <NavLink to="/dashboard" className="flex min-w-0 items-center gap-3" aria-label="Pacific Maritime Boundaries Platform home">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cyan-300/10 shadow-glow ring-1 ring-cyan-200/20 sm:h-11 sm:w-11">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm uppercase tracking-[0.22em] text-white">Pacific Maritime Boundaries</p>
            <p className="text-xs uppercase tracking-[0.28em] text-primary">Intelligence Platform</p>
          </div>
        </NavLink>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navItems.map(([label, href]) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white",
                  isActive && "bg-cyan-300/10 text-white shadow-[inset_0_-1px_0_#00E5FF]",
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <label className="ml-auto hidden h-11 min-w-[240px] items-center gap-2 rounded-full bg-white/[0.04] px-4 ring-1 ring-white/10 focus-within:ring-primary/60 xl:flex">
          <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span className="sr-only">Global search</span>
          <input className="w-full bg-transparent text-sm text-white placeholder:text-slate-500" placeholder="Search boundaries, treaties..." />
        </label>

        <button className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.04] text-slate-200 ring-1 ring-white/10 transition hover:bg-white/10 sm:h-11 sm:w-11 xl:ml-0" aria-label="Open search">
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-full ring-1 transition sm:h-11 sm:w-11",
                isActive
                  ? "bg-accent/22 text-accent ring-accent/40"
                  : "bg-white/[0.04] text-slate-300 ring-white/10 hover:bg-white/10 hover:text-white",
              )
            }
            aria-label="Admin panel"
            title="Admin"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </NavLink>
        )}
        <button
          onClick={() => setAuthOpen(true)}
          className={cn(
            "flex h-10 shrink-0 items-center gap-2 rounded-full px-3 ring-1 transition sm:h-11",
            token
              ? "bg-primary/14 text-primary ring-primary/30 hover:bg-primary/22"
              : "bg-accent/18 text-cyan-100 ring-accent/30 hover:bg-accent/28",
          )}
          aria-label="Open user menu"
        >
          <CircleUserRound className="h-5 w-5" aria-hidden="true" />
          {token && (
            <span className="hidden text-xs font-medium sm:block max-w-[100px] truncate">
              {isAdmin ? "Admin" : userEmail.split("@")[0]}
            </span>
          )}
        </button>
      </div>
      </header>
    </>
  );
}
