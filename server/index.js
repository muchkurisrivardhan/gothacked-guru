import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function jsonFile(name, fallback) {
  const file = path.join(DATA_DIR, name);
  return {
    read() {
      try {
        return JSON.parse(fs.readFileSync(file, "utf-8"));
      } catch {
        return structuredClone(fallback);
      }
    },
    write(data) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    },
  };
}

const views = jsonFile("views.json", {}); // { scamId: totalCount }
const events = jsonFile("events.json", {}); // { scamId: { "YYYY-MM-DD": count } }
const misses = jsonFile("misses.json", {}); // { query: count } — searches with 0 results
const theme = jsonFile("theme.json", { hue: 145, accentHue: 215, intensity: 1, gridVisible: true });
const overrides = jsonFile("overrides.json", { edits: {}, added: [] });

// Change this password before deploying. Can also be set via env: ADMIN_PASSWORD.
const config = jsonFile("admin.json", { password: "gothacked-admin" });
if (!fs.existsSync(path.join(DATA_DIR, "admin.json"))) config.write({ password: "gothacked-admin" });
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || config.read().password;

const today = () => new Date().toISOString().slice(0, 10);

const app = express();
app.use(express.json({ limit: "1mb" }));

// ---------- Public: anonymous, aggregate-only. No IP/cookie/UA is ever stored. ----------

app.post("/api/view/:id", (req, res) => {
  const { id } = req.params;
  if (!id || id.length > 100) return res.status(400).end();

  const counts = views.read();
  counts[id] = (counts[id] ?? 0) + 1;
  views.write(counts);

  const ev = events.read();
  ev[id] = ev[id] ?? {};
  ev[id][today()] = (ev[id][today()] ?? 0) + 1;
  events.write(ev);

  res.status(204).end();
});

// A search that returned zero results — the strongest signal of missing content.
app.post("/api/miss", (req, res) => {
  const q = String(req.body?.query ?? "").trim().toLowerCase().slice(0, 80);
  if (q.length < 3) return res.status(204).end();
  const m = misses.read();
  m[q] = (m[q] ?? 0) + 1;
  misses.write(m);
  res.status(204).end();
});

// Legacy alias used by the dev-only stats page (aggregate counts, no per-user data).
app.get("/api/stats", (_req, res) => {
  const counts = views.read();
  res.json(Object.entries(counts).map(([id, count]) => ({ id, count })));
});

app.get("/api/theme", (_req, res) => res.json(theme.read()));
app.get("/api/content", (_req, res) => res.json(overrides.read()));

// ---------- Admin: password-protected ----------

function requireAdmin(req, res, next) {
  if (req.headers["x-admin-key"] === ADMIN_PASSWORD) return next();
  res.status(401).json({ error: "unauthorized" });
}

app.post("/api/admin/login", (req, res) => {
  if (String(req.body?.password ?? "") === ADMIN_PASSWORD) return res.json({ ok: true });
  res.status(401).json({ ok: false });
});

app.get("/api/admin/stats", requireAdmin, (_req, res) => {
  const counts = views.read();
  res.json(Object.entries(counts).map(([id, count]) => ({ id, count })));
});

// Daily buckets for the last N days, per scam — powers the trending panel.
app.get("/api/admin/trends", requireAdmin, (req, res) => {
  const days = Math.min(Number(req.query.days) || 14, 90);
  const ev = events.read();
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000);
    return d.toISOString().slice(0, 10);
  });
  const rows = Object.entries(ev).map(([id, byDay]) => {
    const series = dates.map((d) => byDay[d] ?? 0);
    const half = Math.floor(days / 2);
    const prev = series.slice(0, half).reduce((a, b) => a + b, 0);
    const recent = series.slice(half).reduce((a, b) => a + b, 0);
    return { id, series, recent, prev, delta: recent - prev };
  });
  res.json({ dates, rows });
});

// Serve the review spreadsheet the daily task writes to, so the browser can
// parse it (with SheetJS) and import approved rows. 404 until the task runs.
const IMPORT_DIR = path.join(__dirname, "..", "import");
const IMPORT_FILE = path.join(IMPORT_DIR, "scam-inbox.xlsx");

app.get("/api/admin/import-file", requireAdmin, (_req, res) => {
  if (!fs.existsSync(IMPORT_FILE)) return res.status(404).json({ error: "no import file yet" });
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("X-Import-Mtime", String(fs.statSync(IMPORT_FILE).mtimeMs));
  fs.createReadStream(IMPORT_FILE).pipe(res);
});

app.get("/api/admin/misses", requireAdmin, (_req, res) => {
  const m = misses.read();
  res.json(
    Object.entries(m)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50)
  );
});

app.put("/api/admin/theme", requireAdmin, (req, res) => {
  const t = theme.read();
  const b = req.body ?? {};
  if (typeof b.hue === "number") t.hue = Math.max(0, Math.min(360, b.hue));
  if (typeof b.accentHue === "number") t.accentHue = Math.max(0, Math.min(360, b.accentHue));
  if (typeof b.intensity === "number") t.intensity = Math.max(0.2, Math.min(3, b.intensity));
  if (typeof b.gridVisible === "boolean") t.gridVisible = b.gridVisible;
  theme.write(t);
  res.json(t);
});

// Content overrides: edits patch existing nodes by id; added nodes attach under a category.
app.put("/api/admin/content", requireAdmin, (req, res) => {
  const b = req.body ?? {};
  const cur = overrides.read();
  if (b.edit && typeof b.edit.id === "string") {
    cur.edits[b.edit.id] = { ...(cur.edits[b.edit.id] ?? {}), ...b.edit.patch };
  }
  if (b.add && typeof b.add.parentId === "string" && b.add.node?.id) {
    cur.added = cur.added.filter((a) => a.node.id !== b.add.node.id);
    cur.added.push(b.add);
  }
  if (typeof b.removeAdded === "string") {
    cur.added = cur.added.filter((a) => a.node.id !== b.removeAdded);
  }
  if (typeof b.clearEdit === "string") {
    delete cur.edits[b.clearEdit];
  }
  overrides.write(cur);
  res.json(cur);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT} (admin password: set in server/data/admin.json)`);
});
