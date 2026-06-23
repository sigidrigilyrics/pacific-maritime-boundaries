import { Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { gisApi, type GisDocument, type LayerCategory, PACIFIC_NATIONS } from "../lib/gisApi";
import { useGisStore } from "../store/useGisStore";
import { UploadLayerModal } from "./UploadLayerModal";

// Category pill colours
const CAT_COLORS: Record<string, string> = {
  Boundary:       "bg-cyan-400/10 text-cyan-300 ring-cyan-400/25",
  Resource:       "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25",
  Infrastructure: "bg-amber-400/10 text-amber-300 ring-amber-400/25",
  Environment:    "bg-green-400/10 text-green-300 ring-green-400/25",
  Survey:         "bg-violet-400/10 text-violet-300 ring-violet-400/25",
  Other:          "bg-slate-400/10 text-slate-300 ring-slate-400/25",
};

function countryName(code: string) {
  return PACIFIC_NATIONS.find((n) => n.code === code)?.name ?? code;
}

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const { token, gisLayers, addGisLayer, removeGisLayer } = useGisStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingGeo, setUploadingGeo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docEntityType, setDocEntityType] = useState<"layer" | "nation">("layer");
  const [docEntityId, setDocEntityId] = useState("");
  const [docName, setDocName] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const docInputRef = useRef<HTMLInputElement>(null);

  const NATIONS = [
    "Fiji","Samoa","Tonga","Vanuatu","Solomon Islands","Kiribati","Tuvalu",
    "Nauru","Palau","Micronesia FSM","Marshall Islands","Cook Islands","Niue","Papua New Guinea",
  ];

  async function handleGeoUpload(
    file: File,
    meta: { name: string; category: LayerCategory | ""; country_codes: string[]; source: string; description: string },
  ) {
    if (!token) return;
    setUploadingGeo(true);
    setStatus("Uploading layer…");
    try {
      const layer = await gisApi.uploadLayer(file, token, meta);
      addGisLayer(layer);
      setStatus(`Layer "${layer.name}" added`);
      setShowUploadModal(false);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingGeo(false);
    }
  }

  async function handleDeleteLayer(id: string, name: string) {
    if (!token || !confirm(`Delete layer "${name}"?`)) return;
    try {
      await gisApi.deleteLayer(id, token);
      removeGisLayer(id);
      setStatus(`Deleted "${name}"`);
    } catch {
      setStatus("Delete failed");
    }
  }

  async function handleDocUpload() {
    if (!token || !docFile || !docEntityId) return;
    setUploadingDoc(true);
    setStatus("Uploading document…");
    try {
      const fd = new FormData();
      fd.append("file", docFile);
      fd.append("entity_type", docEntityType);
      fd.append("entity_id", docEntityId);
      fd.append("name", docName || docFile.name);
      await gisApi.uploadDocument(fd, token);
      setStatus("Document uploaded");
      setDocFile(null);
      setDocName("");
      if (docInputRef.current) docInputRef.current.value = "";
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingDoc(false);
    }
  }

  return (
    <>
      {showUploadModal && (
        <UploadLayerModal
          uploading={uploadingGeo}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleGeoUpload}
        />
      )}

      <div className="glass-panel absolute bottom-16 right-5 z-30 w-[300px] overflow-hidden rounded-xl shadow-purple">
        <div className="flex items-center justify-between bg-white/[0.04] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Manage Data</p>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-4 py-3 space-y-5">

          {/* Upload GeoJSON — opens modal */}
          <section>
            <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">Upload Boundary Layer</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/15 py-4 text-xs text-slate-400 transition hover:border-primary/50 hover:text-primary"
            >
              <Upload className="h-4 w-4" />
              Click to upload .geojson
            </button>
          </section>

          {/* Active layers */}
          {gisLayers.length > 0 && (
            <section>
              <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">Active Layers</p>
              <div className="space-y-2">
                {gisLayers.map((l) => (
                  <div key={l.id} className="rounded-lg bg-white/[0.04] px-3 py-2.5 text-xs">
                    {/* Name + delete */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0 truncate font-medium text-slate-100">{l.name}</span>
                      <button
                        onClick={() => handleDeleteLayer(l.id, l.name)}
                        className="flex-shrink-0 text-slate-500 transition hover:text-red-400 mt-0.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Tags row */}
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {l.category && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${CAT_COLORS[l.category] ?? CAT_COLORS.Other}`}>
                          {l.category}
                        </span>
                      )}
                      {l.country_codes?.map((code) => (
                        <span key={code} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-400 ring-1 ring-white/10">
                          {countryName(code)}
                        </span>
                      ))}
                    </div>

                    {/* Source + feature count */}
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                      {l.source && <span>{l.source}</span>}
                      {l.source && <span>·</span>}
                      <span>{l.feature_count.toLocaleString()} features</span>
                    </div>

                    {l.description && (
                      <p className="mt-1 text-[10px] text-slate-500 line-clamp-2">{l.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Upload Document */}
          <section>
            <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">Attach Document</p>
            <div className="space-y-2">
              <select
                value={docEntityType}
                onChange={(e) => { setDocEntityType(e.target.value as "layer" | "nation"); setDocEntityId(""); }}
                className="w-full rounded-md bg-white/[0.06] px-3 py-2 text-xs text-slate-200 ring-1 ring-white/10 outline-none focus:ring-primary/60"
              >
                <option value="layer">Attach to Layer</option>
                <option value="nation">Attach to Nation</option>
              </select>

              {docEntityType === "nation" ? (
                <select
                  value={docEntityId}
                  onChange={(e) => setDocEntityId(e.target.value)}
                  className="w-full rounded-md bg-white/[0.06] px-3 py-2 text-xs text-slate-200 ring-1 ring-white/10 outline-none focus:ring-primary/60"
                >
                  <option value="">Select nation…</option>
                  {NATIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              ) : (
                <select
                  value={docEntityId}
                  onChange={(e) => setDocEntityId(e.target.value)}
                  className="w-full rounded-md bg-white/[0.06] px-3 py-2 text-xs text-slate-200 ring-1 ring-white/10 outline-none focus:ring-primary/60"
                >
                  <option value="">Select layer…</option>
                  {gisLayers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              )}

              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Document name (optional)"
                className="w-full rounded-md bg-white/[0.06] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 ring-1 ring-white/10 outline-none focus:ring-primary/60"
              />
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 py-3 text-xs text-slate-400 transition hover:border-primary/50 hover:text-primary">
                <Upload className="h-3.5 w-3.5" />
                {docFile ? docFile.name : "Drop PDF/doc or click"}
                <input
                  ref={docInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx"
                  className="hidden"
                  onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <button
                onClick={handleDocUpload}
                disabled={uploadingDoc || !docFile || !docEntityId}
                className="w-full rounded-lg bg-primary/14 py-2 text-xs font-semibold text-primary ring-1 ring-primary/30 transition hover:bg-primary/22 disabled:opacity-40"
              >
                {uploadingDoc ? "Uploading…" : "Attach Document"}
              </button>
            </div>
          </section>

          {status && (
            <p className="rounded-md bg-white/[0.04] px-3 py-2 text-xs text-slate-400">{status}</p>
          )}
        </div>
      </div>
    </>
  );
}
