import JSZip from "jszip";
import {
  Activity, CheckCircle, Eye, FileText, Layers, Plus,
  Search, Shield, Trash2, Upload, Users, XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { LayerPreviewModal } from "../components/LayerPreviewModal";
import { Card } from "../components/ui/card";
import {
  gisApi,
  type AuditEvent,
  type GisDocument,
  type GisLayer,
  type GisUser,
  type RequestItem,
} from "../lib/gisApi";
import { useGisStore } from "../store/useGisStore";

type Tab = "users" | "layers" | "documents" | "requests" | "upload" | "activity";

export function AdminPage() {
  const { token, isAdmin } = useGisStore();
  const [tab, setTab] = useState<Tab>("users");

  if (!token || !isAdmin) return <Navigate to="/dashboard" replace />;

  const tabs: Array<{ id: Tab; label: string; icon: typeof Users }> = [
    { id: "users",     label: "Users",     icon: Users },
    { id: "layers",    label: "Layers",    icon: Layers },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "requests",  label: "Requests",  icon: Shield },
    { id: "upload",    label: "Upload",    icon: Upload },
    { id: "activity",  label: "Activity",  icon: Activity },
  ];

  return (
    <div className="space-y-5">
      <div className="glass-panel rounded-lg px-6 py-5">
        <p className="text-xs uppercase tracking-[0.22em] text-primary">Administration</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Data &amp; User Management</h1>
        <p className="mt-1 text-sm text-slate-400">Manage users, boundary layers, documents and access requests.</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-white/10">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition ${
              tab === id
                ? "border-b-2 border-primary text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="pb-8">
        {tab === "users"     && <UsersTab />}
        {tab === "layers"    && <LayersTab />}
        {tab === "documents" && <DocumentsTab />}
        {tab === "requests"  && <RequestsTab />}
        {tab === "upload"    && <UploadTab />}
        {tab === "activity"  && <ActivityTab />}
      </div>
    </div>
  );
}

/* ─── shared search bar ─── */
function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search…"}
        className="w-full rounded-md bg-white/[0.05] py-2 pl-8 pr-3 text-sm text-slate-200 placeholder:text-slate-600 ring-1 ring-white/10 outline-none focus:ring-primary/50 sm:w-64"
      />
    </div>
  );
}

/* ─── Users ─── */
function UsersTab() {
  const { token } = useGisStore();
  const [users, setUsers] = useState<GisUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSuper, setIsSuper] = useState(false);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    gisApi.admin.listUsers(token).then(setUsers).finally(() => setLoading(false));
  }, [token]);

  const filtered = users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()));

  async function handleCreate() {
    if (!token || !email || !password) return;
    setCreating(true);
    try {
      const u = await gisApi.admin.createUser(token, { email, password, is_superuser: isSuper });
      setUsers((prev) => [...prev, u]);
      setEmail(""); setPassword(""); setIsSuper(false);
      setStatus(`Created ${u.email}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed");
    } finally { setCreating(false); }
  }

  async function handleToggle(user: GisUser, field: "is_active" | "is_superuser") {
    if (!token) return;
    try {
      const updated = await gisApi.admin.updateUser(token, user.id, { [field]: !user[field] });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function handleDelete(user: GisUser) {
    if (!token || !confirm(`Delete ${user.email}?`)) return;
    try {
      await gisApi.admin.deleteUser(token, user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">All Users ({filtered.length})</h2>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by email…" />
        </div>
        {loading ? (
          <p className="px-5 py-6 text-sm text-slate-500">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Active</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-5 py-3 text-slate-200">{u.email}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggle(u, "is_superuser")}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 transition ${
                        u.is_superuser
                          ? "bg-accent/15 text-accent ring-accent/30 hover:bg-accent/25"
                          : "bg-white/5 text-slate-400 ring-white/10 hover:bg-white/10"
                      }`}
                    >
                      {u.is_superuser ? "Admin" : "User"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggle(u, "is_active")}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 transition ${
                        u.is_active
                          ? "bg-primary/15 text-primary ring-primary/30 hover:bg-primary/25"
                          : "bg-red-500/10 text-red-400 ring-red-500/20 hover:bg-red-500/20"
                      }`}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(u)} className="text-slate-600 transition hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={4} className="px-5 py-6 text-sm text-slate-500">No users match your search.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-white">Create User</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="rounded-md bg-white/[0.06] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 ring-1 ring-white/10 outline-none focus:ring-primary/60"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-md bg-white/[0.06] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 ring-1 ring-white/10 outline-none focus:ring-primary/60"
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={isSuper} onChange={(e) => setIsSuper(e.target.checked)} className="accent-primary" />
            Admin
          </label>
          <button
            onClick={handleCreate}
            disabled={creating || !email || !password}
            className="flex items-center gap-2 rounded-md bg-primary/14 px-4 py-2 text-sm font-semibold text-primary ring-1 ring-primary/30 transition hover:bg-primary/22 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> Create
          </button>
        </div>
        {status && <p className="mt-3 text-xs text-slate-400">{status}</p>}
      </Card>
    </div>
  );
}

/* ─── Layers ─── */
function LayersTab() {
  const { token } = useGisStore();
  const [layers, setLayers] = useState<GisLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<GisLayer | null>(null);

  useEffect(() => {
    gisApi.getLayers().then(setLayers).finally(() => setLoading(false));
  }, []);

  const filtered = layers.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()));

  async function handleDelete(layer: GisLayer) {
    if (!token || !confirm(`Delete layer "${layer.name}"?`)) return;
    try {
      await gisApi.deleteLayer(layer.id, token);
      setLayers((prev) => prev.filter((l) => l.id !== layer.id));
      setStatus(`Deleted "${layer.name}"`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <>
      {preview && <LayerPreviewModal layer={preview} onClose={() => setPreview(null)} />}
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Boundary Layers ({filtered.length})</h2>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name…" />
        </div>
        {loading ? (
          <p className="px-5 py-6 text-sm text-slate-500">Loading…</p>
        ) : layers.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">No layers uploaded yet. Use the Upload tab to add GeoJSON layers.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Features</th>
                <th className="px-5 py-3">CRS</th>
                <th className="px-5 py-3">Uploaded</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-5 py-3 text-slate-200">{l.name}</td>
                  <td className="px-5 py-3 text-slate-400">{l.feature_count.toLocaleString()}</td>
                  <td className="px-5 py-3 text-slate-400">{l.crs}</td>
                  <td className="px-5 py-3 text-slate-400">{new Date(l.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setPreview(l)}
                        className="flex items-center gap-1 text-xs text-slate-400 transition hover:text-primary"
                        title="Preview layer on map"
                      >
                        <Eye className="h-3.5 w-3.5" /> Preview
                      </button>
                      <button onClick={() => handleDelete(l)} className="text-slate-600 transition hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-6 text-sm text-slate-500">No layers match your search.</td></tr>
              )}
            </tbody>
          </table>
        )}
        {status && <p className="border-t border-white/10 px-5 py-3 text-xs text-slate-400">{status}</p>}
      </Card>
    </>
  );
}

/* ─── Documents ─── */
function DocumentsTab() {
  const { token } = useGisStore();
  const [docs, setDocs] = useState<GisDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    gisApi.getAllDocuments(token).then(setDocs).finally(() => setLoading(false));
  }, [token]);

  const filtered = docs.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.entity_id.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleDelete(doc: GisDocument) {
    if (!token || !confirm(`Delete "${doc.name}"?`)) return;
    try {
      await gisApi.deleteDocument(doc.id, token);
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <h2 className="text-sm font-semibold text-white">All Documents ({filtered.length})</h2>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or entity…" />
      </div>
      {loading ? (
        <p className="px-5 py-6 text-sm text-slate-500">Loading…</p>
      ) : docs.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">No documents yet. Upload documents via the Upload tab or from a country profile page.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Attached to</th>
              <th className="px-5 py-3">Size</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="px-5 py-3">
                  <a href={gisApi.downloadUrl(d.id)} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {d.name}
                  </a>
                </td>
                <td className="px-5 py-3 text-slate-400 capitalize">{d.entity_type}: {d.entity_id.slice(0, 20)}</td>
                <td className="px-5 py-3 text-slate-400">{d.file_size ? `${(d.file_size / 1024).toFixed(0)} KB` : "—"}</td>
                <td className="px-5 py-3 text-slate-400">{new Date(d.uploaded_at).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleDelete(d)} className="text-slate-600 transition hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-sm text-slate-500">No documents match your search.</td></tr>
            )}
          </tbody>
        </table>
      )}
      {status && <p className="border-t border-white/10 px-5 py-3 text-xs text-slate-400">{status}</p>}
    </Card>
  );
}

/* ─── Access Requests ─── */
function RequestsTab() {
  const { token } = useGisStore();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "denied">("all");

  useEffect(() => {
    if (!token) return;
    gisApi.admin.listRequests(token).then(setRequests).finally(() => setLoading(false));
  }, [token]);

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.user_email.toLowerCase().includes(search.toLowerCase()) ||
      r.layer_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pending = requests.filter((r) => r.status === "pending").length;

  async function handleUpdate(req: RequestItem, newStatus: string) {
    if (!token) return;
    try {
      await gisApi.admin.updateRequest(token, req.id, newStatus);
      setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: newStatus } : r)));
      setStatus(`Request ${newStatus}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Update failed");
    }
  }

  const statusBadge = (s: string) => {
    if (s === "approved") return "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20";
    if (s === "denied")   return "bg-red-500/10 text-red-400 ring-red-500/20";
    return "bg-amber-500/10 text-amber-400 ring-amber-500/20";
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-white">Access Requests</h2>
          {pending > 0 && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/25">
              {pending} pending
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="rounded-md bg-white/[0.05] px-3 py-2 text-xs text-slate-300 ring-1 ring-white/10 outline-none"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
          <SearchBar value={search} onChange={setSearch} placeholder="Search user or layer…" />
        </div>
      </div>

      {loading ? (
        <p className="px-5 py-6 text-sm text-slate-500">Loading…</p>
      ) : requests.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">No access requests yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Layer</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Requested</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="px-5 py-3 text-slate-200">{r.user_email}</td>
                <td className="px-5 py-3 text-slate-400">{r.layer_name}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${statusBadge(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-400">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  {r.status === "pending" && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUpdate(r, "approved")}
                        className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20 transition hover:bg-emerald-500/20"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleUpdate(r, "denied")}
                        className="flex items-center gap-1 rounded-md bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 ring-1 ring-red-500/20 transition hover:bg-red-500/20"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Deny
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-sm text-slate-500">No requests match your filter.</td></tr>
            )}
          </tbody>
        </table>
      )}
      {status && <p className="border-t border-white/10 px-5 py-3 text-xs text-slate-400">{status}</p>}
    </Card>
  );
}

/* ─── Upload ─── */
function UploadTab() {
  const { token, gisLayers } = useGisStore();
  const [geoFile, setGeoFile] = useState<File | null>(null);
  const [uploadingGeo, setUploadingGeo] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [entityType, setEntityType] = useState<"layer" | "nation">("nation");
  const [entityId, setEntityId] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [geoProgress, setGeoProgress] = useState("");
  const [docStatus, setDocStatus] = useState("");
  const geoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const NATIONS = [
    "Fiji","Samoa","Tonga","Vanuatu","Solomon Islands","Kiribati","Tuvalu","Nauru","Palau",
    "Micronesia FSM","Marshall Islands","Cook Islands","Niue","Papua New Guinea","Tokelau",
    "New Caledonia","French Polynesia","Wallis & Futuna","American Samoa","Pitcairn Islands",
    "Norfolk Island","Guam",
  ];

  async function handleGeoUpload() {
    if (!token || !geoFile) return;
    setUploadingGeo(true);
    setGeoProgress("Starting upload…");

    try {
      if (geoFile.name.toLowerCase().endsWith(".zip")) {
        /* bulk ZIP: extract each .geojson and upload sequentially */
        const zip = await JSZip.loadAsync(geoFile);
        const entries = Object.values(zip.files).filter(
          (f) => !f.dir && (f.name.endsWith(".geojson") || f.name.endsWith(".json")),
        );
        if (entries.length === 0) {
          setGeoProgress("No .geojson files found inside ZIP.");
          return;
        }
        const names: string[] = [];
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          setGeoProgress(`Uploading ${i + 1}/${entries.length}: ${entry.name}…`);
          const blob = await entry.async("blob");
          const file = new File([blob], entry.name, { type: "application/geo+json" });
          const layer = await gisApi.uploadLayer(file, token, {});
          names.push(layer.name);
        }
        setGeoProgress(`✓ Uploaded ${names.length} layer${names.length > 1 ? "s" : ""}: ${names.join(", ")}`);
      } else {
        /* single GeoJSON */
        setGeoProgress("Uploading layer…");
        const layer = await gisApi.uploadLayer(geoFile, token, {});
        setGeoProgress(`✓ Layer "${layer.name}" uploaded (${layer.feature_count} features)`);
      }
      setGeoFile(null);
      if (geoRef.current) geoRef.current.value = "";
    } catch (e) {
      setGeoProgress(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingGeo(false);
    }
  }

  async function handleDocUpload() {
    if (!token || !docFile || !entityId) return;
    setUploadingDoc(true);
    setDocStatus("Uploading document…");
    try {
      const fd = new FormData();
      fd.append("file", docFile);
      fd.append("entity_type", entityType);
      fd.append("entity_id", entityId);
      fd.append("name", docName || docFile.name);
      await gisApi.uploadDocument(fd, token);
      setDocStatus(`✓ Document attached to ${entityType}: ${entityId}`);
      setDocFile(null); setDocName("");
      if (docRef.current) docRef.current.value = "";
    } catch (e) {
      setDocStatus(e instanceof Error ? e.message : "Upload failed");
    } finally { setUploadingDoc(false); }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* GeoJSON / ZIP Upload */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/20">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Upload Boundary Layer</h2>
            <p className="text-xs text-slate-500">GeoJSON (WGS 84) or ZIP of multiple GeoJSON files</p>
          </div>
        </div>
        <label
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/15 py-8 text-sm text-slate-400 transition hover:border-primary/40 hover:text-primary"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setGeoFile(f); }}
        >
          <Upload className="h-6 w-6" />
          {geoFile ? (
            <span className="text-slate-200">{geoFile.name}</span>
          ) : (
            <>
              <span>Drop .geojson / .zip or click to browse</span>
              <span className="text-xs text-slate-600">ZIP will extract &amp; upload all contained GeoJSON files</span>
            </>
          )}
          <input
            ref={geoRef}
            type="file"
            accept=".geojson,.json,.zip"
            className="hidden"
            onChange={(e) => setGeoFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button
          onClick={handleGeoUpload}
          disabled={uploadingGeo || !geoFile}
          className="w-full rounded-lg bg-primary/14 py-2.5 text-sm font-semibold text-primary ring-1 ring-primary/30 transition hover:bg-primary/22 disabled:opacity-40"
        >
          {uploadingGeo ? geoProgress || "Uploading…" : "Upload Layer"}
        </button>
        {geoProgress && !uploadingGeo && (
          <p className="rounded-md bg-white/[0.04] px-3 py-2 text-xs text-slate-300">{geoProgress}</p>
        )}
      </Card>

      {/* Document Upload */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-accent/10 ring-1 ring-accent/20">
            <Shield className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Attach Document</h2>
            <p className="text-xs text-slate-500">PDF, DOCX, XLSX — attach to a layer or nation</p>
          </div>
        </div>
        <div className="space-y-2">
          <select
            value={entityType}
            onChange={(e) => { setEntityType(e.target.value as "layer" | "nation"); setEntityId(""); }}
            className="w-full rounded-md bg-white/[0.06] px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10 outline-none focus:ring-primary/60"
          >
            <option value="nation">Attach to Nation</option>
            <option value="layer">Attach to Layer</option>
          </select>
          {entityType === "nation" ? (
            <select value={entityId} onChange={(e) => setEntityId(e.target.value)} className="w-full rounded-md bg-white/[0.06] px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10 outline-none focus:ring-primary/60">
              <option value="">Select nation…</option>
              {NATIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          ) : (
            <select value={entityId} onChange={(e) => setEntityId(e.target.value)} className="w-full rounded-md bg-white/[0.06] px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10 outline-none focus:ring-primary/60">
              <option value="">Select layer…</option>
              {gisLayers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          )}
          <input
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="Document name (optional)"
            className="w-full rounded-md bg-white/[0.06] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 ring-1 ring-white/10 outline-none focus:ring-primary/60"
          />
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/15 py-4 text-sm text-slate-400 transition hover:border-accent/40 hover:text-accent">
            <Upload className="h-4 w-4" />
            {docFile ? docFile.name : "Drop file or click to browse"}
            <input ref={docRef} type="file" accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx" className="hidden" onChange={(e) => setDocFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        <button
          onClick={handleDocUpload}
          disabled={uploadingDoc || !docFile || !entityId}
          className="w-full rounded-lg bg-accent/14 py-2.5 text-sm font-semibold text-accent ring-1 ring-accent/30 transition hover:bg-accent/22 disabled:opacity-40"
        >
          {uploadingDoc ? "Uploading…" : "Attach Document"}
        </button>
        {docStatus && (
          <p className="rounded-md bg-white/[0.04] px-3 py-2 text-xs text-slate-300">{docStatus}</p>
        )}
      </Card>
    </div>
  );
}

/* ─── Activity Log ─── */
function ActivityTab() {
  const { token } = useGisStore();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    gisApi.admin.getAudit(token).then(setEvents).finally(() => setLoading(false));
  }, [token]);

  const filtered = events.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.user.toLowerCase().includes(search.toLowerCase()),
  );

  const typeMeta = (type: AuditEvent["type"]) => {
    if (type === "layer_upload")   return { label: "Layer",    cls: "bg-primary/10 text-primary ring-primary/20" };
    if (type === "doc_upload")     return { label: "Document", cls: "bg-accent/10 text-accent ring-accent/20" };
    return { label: "Request", cls: "bg-amber-500/10 text-amber-400 ring-amber-500/20" };
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <h2 className="text-sm font-semibold text-white">Activity Log ({filtered.length})</h2>
        <SearchBar value={search} onChange={setSearch} placeholder="Search description or user…" />
      </div>
      {loading ? (
        <p className="px-5 py-6 text-sm text-slate-500">Loading…</p>
      ) : events.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">No activity recorded yet.</p>
      ) : (
        <div className="divide-y divide-white/5">
          {filtered.map((e, i) => {
            const { label, cls } = typeMeta(e.type);
            return (
              <div key={i} className="flex items-start gap-4 px-5 py-3 hover:bg-white/[0.02]">
                <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${cls}`}>
                  {label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-200">{e.description}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {e.user} · {e.detail}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-slate-600">
                  {new Date(e.timestamp).toLocaleString()}
                </time>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="px-5 py-6 text-sm text-slate-500">No events match your search.</p>
          )}
        </div>
      )}
    </Card>
  );
}
