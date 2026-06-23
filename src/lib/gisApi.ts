export const GIS = "/api/gis";

export const LAYER_CATEGORIES = [
  "Boundary",
  "Resource",
  "Infrastructure",
  "Environment",
  "Survey",
  "Other",
] as const;
export type LayerCategory = (typeof LAYER_CATEGORIES)[number];

export const PACIFIC_NATIONS: { code: string; name: string }[] = [
  { code: "FJ", name: "Fiji" },
  { code: "WS", name: "Samoa" },
  { code: "TO", name: "Tonga" },
  { code: "VU", name: "Vanuatu" },
  { code: "SB", name: "Solomon Islands" },
  { code: "KI", name: "Kiribati" },
  { code: "TV", name: "Tuvalu" },
  { code: "NR", name: "Nauru" },
  { code: "PW", name: "Palau" },
  { code: "FM", name: "Micronesia (FSM)" },
  { code: "MH", name: "Marshall Islands" },
  { code: "CK", name: "Cook Islands" },
  { code: "NU", name: "Niue" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PF", name: "French Polynesia" },
  { code: "NC", name: "New Caledonia" },
  { code: "GU", name: "Guam" },
  { code: "AS", name: "American Samoa" },
  { code: "MP", name: "N. Mariana Islands" },
  { code: "WF", name: "Wallis & Futuna" },
  { code: "TK", name: "Tokelau" },
  { code: "PH", name: "Philippines" },
];

export type GisLayer = {
  id: string;
  name: string;
  feature_count: number;
  created_at: string;
  crs: string;
  category: LayerCategory | null;
  country_codes: string[] | null;
  source: string | null;
  description: string | null;
};

export type GisDocument = {
  id: string;
  name: string;
  entity_type: string;
  entity_id: string;
  mime_type: string | null;
  file_size: number | null;
  uploaded_at: string;
};

export type GisUser = {
  id: string;
  email: string;
  is_superuser: boolean;
  is_active: boolean;
  is_verified: boolean;
};

export type RequestItem = {
  id: string;
  user_email: string;
  layer_id: string;
  layer_name: string;
  status: string;
  created_at: string;
};

export type AuditEvent = {
  type: "layer_upload" | "doc_upload" | "access_request";
  timestamp: string;
  description: string;
  user: string;
  detail: string;
};

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

const handleResponse = async <T>(r: Response): Promise<T> => {
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error((d as { detail?: string }).detail ?? `HTTP ${r.status}`);
  }
  return r.json() as Promise<T>;
};

// For DELETE endpoints, which return 204 No Content on success (no body to
// parse). Without this, a failed delete (expired token, 403, 404, ...) was
// silently swallowed and reported to the UI as a success.
const assertOk = async (r: Response): Promise<void> => {
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error((d as { detail?: string }).detail ?? `HTTP ${r.status}`);
  }
};

export const gisApi = {
  /* ── Layers ── */
  getLayers: (): Promise<GisLayer[]> =>
    fetch(`${GIS}/layers`).then((r) => (r.ok ? r.json() : [])),

  uploadLayer: (
    file: File,
    token: string,
    meta: { name?: string; category?: string; country_codes?: string[]; source?: string; description?: string },
  ): Promise<GisLayer> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", meta.name ?? file.name.replace(/\.(geo)?json$/i, ""));
    if (meta.category) fd.append("category", meta.category);
    if (meta.country_codes?.length) fd.append("country_codes", JSON.stringify(meta.country_codes));
    if (meta.source) fd.append("source", meta.source);
    if (meta.description) fd.append("description", meta.description);
    return fetch(`${GIS}/layers/upload`, {
      method: "POST",
      headers: authHeader(token),
      body: fd,
    }).then((r) => handleResponse<GisLayer>(r));
  },

  deleteLayer: (id: string, token: string): Promise<void> =>
    fetch(`${GIS}/layers/${id}`, { method: "DELETE", headers: authHeader(token) }).then(assertOk),

  /* ── Documents ── */
  getAllDocuments: (token: string): Promise<GisDocument[]> =>
    fetch(`${GIS}/documents`, { headers: authHeader(token) }).then((r) => (r.ok ? r.json() : [])),

  getDocuments: (entityType: string, entityId: string): Promise<GisDocument[]> =>
    fetch(`${GIS}/documents?entity_type=${entityType}&entity_id=${encodeURIComponent(entityId)}`).then(
      (r) => (r.ok ? r.json() : []),
    ),

  uploadDocument: (fd: FormData, token: string): Promise<GisDocument> =>
    fetch(`${GIS}/documents`, {
      method: "POST",
      headers: authHeader(token),
      body: fd,
    }).then((r) => handleResponse<GisDocument>(r)),

  deleteDocument: (id: string, token: string): Promise<void> =>
    fetch(`${GIS}/documents/${id}`, { method: "DELETE", headers: authHeader(token) }).then(assertOk),

  downloadUrl: (docId: string) => `${GIS}/documents/${docId}/download`,

  /* ── Access requests ── */
  requestAccess: (token: string, layerId: string): Promise<void> =>
    fetch(`${GIS}/requests`, {
      method: "POST",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify({ layer_id: layerId }),
    }).then((r) => handleResponse<unknown>(r)).then(() => undefined),

  /* ── Auth ── */
  login: (email: string, password: string): Promise<{ access_token: string }> => {
    const fd = new FormData();
    fd.append("username", email);
    fd.append("password", password);
    return fetch(`${GIS}/auth/jwt/login`, { method: "POST", body: fd }).then((r) =>
      handleResponse<{ access_token: string }>(r),
    );
  },

  me: (token: string): Promise<GisUser> =>
    fetch(`${GIS}/users/me`, { headers: authHeader(token) }).then((r) => r.json()),

  /* ── Admin ── */
  admin: {
    listUsers: (token: string): Promise<GisUser[]> =>
      fetch(`${GIS}/admin/users`, { headers: authHeader(token) }).then((r) =>
        handleResponse<GisUser[]>(r),
      ),

    createUser: (
      token: string,
      payload: { email: string; password: string; is_superuser: boolean },
    ): Promise<GisUser> =>
      fetch(`${GIS}/admin/users`, {
        method: "POST",
        headers: { ...authHeader(token), "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, is_active: true, is_verified: true }),
      }).then((r) => handleResponse<GisUser>(r)),

    updateUser: (
      token: string,
      id: string,
      patch: { is_active?: boolean; is_superuser?: boolean },
    ): Promise<GisUser> =>
      fetch(`${GIS}/admin/users/${id}`, {
        method: "PATCH",
        headers: { ...authHeader(token), "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }).then((r) => handleResponse<GisUser>(r)),

    deleteUser: (token: string, id: string): Promise<void> =>
      fetch(`${GIS}/admin/users/${id}`, { method: "DELETE", headers: authHeader(token) }).then(assertOk),

    listRequests: (token: string): Promise<RequestItem[]> =>
      fetch(`${GIS}/admin/requests`, { headers: authHeader(token) }).then((r) =>
        handleResponse<RequestItem[]>(r),
      ),

    updateRequest: (token: string, id: string, status: string): Promise<unknown> =>
      fetch(`${GIS}/requests/${id}`, {
        method: "PATCH",
        headers: { ...authHeader(token), "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((r) => handleResponse<unknown>(r)),

    getAudit: (token: string): Promise<AuditEvent[]> =>
      fetch(`${GIS}/admin/audit`, { headers: authHeader(token) }).then((r) =>
        handleResponse<AuditEvent[]>(r),
      ),
  },

  /* ── Map ── */
  // MapLibre fetches tiles from inside a Web Worker, which has no implicit
  // document base URL — a relative path here throws "Failed to construct
  // 'Request': Failed to parse URL". Must be absolute.
  tileUrl: (layerId: string) =>
    `${window.location.origin}${GIS}/tiles/${layerId}/{z}/{x}/{y}.pbf`,
  featuresUrl: (layerId: string) => `${GIS}/features?layer_id=${layerId}&limit=500`,
};

export const LAYER_COLORS = [
  "#00E5FF", "#8A3FFC", "#00D084", "#F4B400", "#FF5B5B",
  "#0A7EA4", "#FF8C42", "#7B68EE", "#2DD4BF", "#F97316",
] as const;
