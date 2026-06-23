import { X } from "lucide-react";
import { useState } from "react";
import { gisApi } from "../lib/gisApi";
import { useGisStore } from "../store/useGisStore";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { token, userEmail, setAuth } = useGisStore();
  const [email, setEmail] = useState("admin@pacific.gov");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError("");
    setLoading(true);
    try {
      const { access_token } = await gisApi.login(email, password);
      const user = await gisApi.me(access_token);
      setAuth(access_token, user.is_superuser, user.email);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  function handleSignOut() {
    setAuth(null, false, "");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-ocean/70 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel relative w-[340px] overflow-hidden rounded-xl shadow-purple">
        <div className="flex items-center justify-between bg-white/[0.04] px-5 py-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
            {token ? "Account" : "Sign In"}
          </p>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-300 transition hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          {token ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                Signed in as <span className="text-primary">{userEmail}</span>
              </p>
              <button
                onClick={handleSignOut}
                className="w-full rounded-lg bg-white/[0.06] py-2.5 text-sm text-slate-200 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-lg bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 ring-1 ring-white/10 outline-none focus:ring-primary/60"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                className="w-full rounded-lg bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 ring-1 ring-white/10 outline-none focus:ring-primary/60"
              />
              {error && (
                <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300 ring-1 ring-red-500/20">
                  {error}
                </p>
              )}
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full rounded-lg bg-primary/18 py-2.5 text-sm font-semibold text-primary ring-1 ring-primary/40 transition hover:bg-primary/26 disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
              <button
                onClick={() => { setEmail("admin@pacific.gov"); setPassword("admin"); }}
                className="w-full rounded-lg border border-dashed border-white/10 py-2 text-xs text-slate-500 transition hover:border-primary/40 hover:text-primary/70"
              >
                Quick admin login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
