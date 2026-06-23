import { Upload, X, ChevronDown, Check } from "lucide-react";
import { useRef, useState } from "react";
import { LAYER_CATEGORIES, PACIFIC_NATIONS, type LayerCategory } from "../lib/gisApi";

type Props = {
  onClose: () => void;
  onUpload: (file: File, meta: {
    name: string;
    category: LayerCategory | "";
    country_codes: string[];
    source: string;
    description: string;
  }) => Promise<void>;
  uploading: boolean;
};

export function UploadLayerModal({ onClose, onUpload, uploading }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<LayerCategory | "">("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File) {
    setFile(f);
    if (!name) setName(f.name.replace(/\.(geo)?json$/i, ""));
  }

  function toggleCode(code: string) {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  async function handleSubmit() {
    if (!file || !name.trim() || !category) return;
    await onUpload(file, {
      name: name.trim(),
      category,
      country_codes: selectedCodes,
      source: source.trim(),
      description: description.trim(),
    });
  }

  const selectedNames = PACIFIC_NATIONS
    .filter((n) => selectedCodes.includes(n.code))
    .map((n) => n.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-2xl shadow-purple overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between bg-white/[0.04] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Upload Layer</p>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-5 py-4 space-y-4">

          {/* File drop */}
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) pickFile(f);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-6 text-xs transition ${
              dragOver
                ? "border-primary/70 bg-primary/10 text-primary"
                : file
                ? "border-emerald-400/50 bg-emerald-400/5 text-emerald-300"
                : "border-white/15 text-slate-400 hover:border-primary/50 hover:text-primary"
            }`}
          >
            <Upload className="h-5 w-5" />
            {file ? (
              <>
                <span className="font-medium">{file.name}</span>
                <span className="text-slate-500">{(file.size / 1024).toFixed(0)} KB — click to change</span>
              </>
            ) : (
              <span>Drop .geojson or click to browse</span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".geojson,.json"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
            />
          </label>

          {/* Layer name */}
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Layer Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fiji EEZ 2024"
              className="w-full rounded-lg bg-white/[0.06] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 ring-1 ring-white/10 outline-none focus:ring-primary/60"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Category <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {LAYER_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
                    category === cat
                      ? "bg-primary/20 text-primary ring-primary/60"
                      : "bg-white/[0.04] text-slate-400 ring-white/10 hover:ring-primary/30 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Country multi-select */}
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Countries / Territories
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCountryOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-lg bg-white/[0.06] px-3 py-2 text-sm ring-1 ring-white/10 outline-none focus:ring-primary/60 text-left"
              >
                <span className={selectedCodes.length ? "text-slate-100" : "text-slate-600"}>
                  {selectedCodes.length === 0
                    ? "Select countries…"
                    : selectedCodes.length === 1
                    ? selectedNames[0]
                    : `${selectedCodes.length} selected`}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${countryOpen ? "rotate-180" : ""}`} />
              </button>

              {countryOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/10 bg-slate-900 shadow-xl max-h-52 overflow-y-auto">
                  {PACIFIC_NATIONS.map((n) => (
                    <button
                      key={n.code}
                      type="button"
                      onClick={() => toggleCode(n.code)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06] transition"
                    >
                      <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition ${
                        selectedCodes.includes(n.code)
                          ? "border-primary bg-primary/20"
                          : "border-white/20"
                      }`}>
                        {selectedCodes.includes(n.code) && <Check className="h-2.5 w-2.5 text-primary" />}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 w-6 flex-shrink-0">{n.code}</span>
                      <span>{n.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCodes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedNames.map((name, i) => (
                  <span
                    key={selectedCodes[i]}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary ring-1 ring-primary/20"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => toggleCode(selectedCodes[i])}
                      className="hover:text-white"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Source */}
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-slate-400">Source</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. SPC, Marine Regions, NMFS"
              className="w-full rounded-lg bg-white/[0.06] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 ring-1 ring-white/10 outline-none focus:ring-primary/60"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-slate-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief notes about this layer…"
              className="w-full resize-none rounded-lg bg-white/[0.06] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 ring-1 ring-white/10 outline-none focus:ring-primary/60"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg py-2 text-xs font-semibold text-slate-400 ring-1 ring-white/10 transition hover:text-white hover:ring-white/25"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading || !file || !name.trim() || !category}
              className="flex-1 rounded-lg bg-primary/14 py-2 text-xs font-semibold text-primary ring-1 ring-primary/30 transition hover:bg-primary/22 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading…" : "Upload Layer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
