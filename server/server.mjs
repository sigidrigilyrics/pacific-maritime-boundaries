import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const dataPath = path.join(root, "data", "platformData.json");
const port = Number(process.env.PORT ?? 5199);

function readData() {
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function sendJson(res, payload, status = 200) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function sendNotFound(res) {
  sendJson(res, { error: "Not found" }, 404);
}

function platformStats(data) {
  const completed = data.countries.filter((country) => country.boundaryStatus === "Completed").length;
  const inProgress = data.countries.filter((country) => country.boundaryStatus === "In Progress").length;
  const notStarted = data.countries.filter((country) => country.boundaryStatus === "Not Started").length;
  const noData = data.countries.filter((country) => country.boundaryStatus === "No Data").length;

  return {
    countries: data.countries.length,
    globalEezShare: "~20%",
    sharedBoundaries: 48,
    treaties: 36,
    highSeasDeclarations: 10,
    datasets: "120+",
    countryStatus: { completed, inProgress, notStarted, noData },
    pathwayProgress: {
      maritimeZones: 75,
      treaty: 62,
      ecs: 42,
      depositsPublication: 69,
    },
  };
}

function searchData(data, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const collections = [
    ["country", data.countries],
    ["treaty", data.treaties],
    ["dataset", data.datasets],
    ["ecs", data.ecsRecords],
  ];

  return collections.flatMap(([type, items]) =>
    items
      .filter((item) => JSON.stringify(item).toLowerCase().includes(needle))
      .slice(0, 12)
      .map((item) => ({ type, id: item.id, title: item.name ?? item.title ?? item.country, item })),
  );
}

function handleApi(req, res, url) {
  const data = readData();
  const segments = url.pathname.split("/").filter(Boolean);
  const [, resource, id] = segments;

  if (url.pathname === "/api/health") {
    return sendJson(res, { ok: true, service: "Pacific Maritime Boundaries API" });
  }
  if (url.pathname === "/api/stats") {
    return sendJson(res, platformStats(data));
  }
  if (url.pathname === "/api/platform") {
    return sendJson(res, { ...data, stats: platformStats(data) });
  }
  if (url.pathname === "/api/search") {
    return sendJson(res, searchData(data, url.searchParams.get("q") ?? ""));
  }

  const resourceMap = {
    countries: data.countries,
    treaties: data.treaties,
    datasets: data.datasets,
    ecs: data.ecsRecords,
    "treaty-progress": data.treatyProgress,
  };

  if (!resource || !(resource in resourceMap)) return sendNotFound(res);
  const collection = resourceMap[resource];
  if (!id) return sendJson(res, collection);

  const item = collection.find((entry) => entry.id === id);
  return item ? sendJson(res, item) : sendNotFound(res);
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
  }[ext] ?? "application/octet-stream";
}

// Vite content-hashes everything under /assets/ (a new build emits new
// filenames), so those can be cached forever. Everything else — especially
// index.html, which references the current asset hashes by name — must
// never be cached, or browsers can keep serving a stale build indefinitely
// with no way to detect a new one shipped.
function cacheControlFor(requestPath) {
  return requestPath.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache";
}

function serveStatic(req, res, url) {
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(distDir, requested));

  if (!filePath.startsWith(distDir)) return sendNotFound(res);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { "Content-Type": contentType(filePath), "Cache-Control": cacheControlFor(requested) });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const spaIndex = path.join(distDir, "index.html");
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
  fs.createReadStream(spaIndex).pipe(res);
}

const GIS_API_URL = (() => {
  try { return new URL(process.env.GIS_API_URL || "http://localhost:8000"); }
  catch { return new URL("http://localhost:8000"); }
})();

function proxyToGis(req, res, url) {
  const targetPath = "/api" + url.pathname.slice("/api/gis".length) + url.search;
  const options = {
    hostname: GIS_API_URL.hostname,
    port: Number(GIS_API_URL.port) || (GIS_API_URL.protocol === "https:" ? 443 : 80),
    path: targetPath,
    method: req.method,
    headers: { ...req.headers, host: GIS_API_URL.host },
    family: 6,
  };
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on("error", () => {
    if (!res.headersSent) sendJson(res, { error: "GIS backend unavailable" }, 502);
  });
  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (url.pathname.startsWith("/api/gis/")) {
    proxyToGis(req, res, url);
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    try {
      handleApi(req, res, url);
    } catch (error) {
      sendJson(res, { error: error instanceof Error ? error.message : "API error" }, 500);
    }
    return;
  }
  serveStatic(req, res, url);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Pacific Maritime Boundaries full-stack server running at http://0.0.0.0:${port}`);
});
