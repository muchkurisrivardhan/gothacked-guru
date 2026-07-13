import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CATEGORY_COLOR } from "./TreeGraph";
import { getAllLeaves, getNodeById, findPathToNode } from "../data/scams";
import type { SiteTheme } from "./AmbientBackground";
import { DEFAULT_THEME } from "./AmbientBackground";
import SiemDashboard from "../siem/SiemDashboard";
import AnalyticsView from "./AnalyticsView";

type AdminView = "dashboard" | "siem";

// ---------------------------------------------------------------------------
// gothacked.guru — admin portal
// Full Three.js WebGL scene (loaded from CDN, so node_modules stays untouched):
// a rotating 3D bar chart of the most-clicked scams over a glowing floor grid
// and particle field. Glassmorphic panels float above for stats, trending,
// missed searches, theme editing, and scam content editing.
// ---------------------------------------------------------------------------

interface StatRow {
  id: string;
  count: number;
}
interface TrendRow {
  id: string;
  series: number[];
  recent: number;
  prev: number;
  delta: number;
}
interface MissRow {
  query: string;
  count: number;
}

const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

function loadThree(): Promise<any> {
  return new Promise((resolve, reject) => {
    const w = window as any;
    if (w.THREE) return resolve(w.THREE);
    const existing = document.querySelector(`script[src="${THREE_CDN}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(w.THREE));
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = THREE_CDN;
    s.onload = () => resolve(w.THREE);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function categoryOf(id: string): string {
  const path = findPathToNode(id);
  return path?.[1]?.id ?? "";
}

const SHEETJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
function loadSheetJS(): Promise<any> {
  return new Promise((resolve, reject) => {
    const w = window as any;
    if (w.XLSX) return resolve(w.XLSX);
    const existing = document.querySelector(`script[src="${SHEETJS_CDN}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(w.XLSX));
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = SHEETJS_CDN;
    s.onload = () => resolve(w.XLSX);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

const norm = (s: string) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
// Map a free-text category from the spreadsheet to one of the site's category ids.
function categoryIdFromName(name: string): string {
  const n = norm(name);
  const byLabel = Object.keys(CATEGORY_COLOR).find((id) => {
    const label = getNodeById(id)?.shortLabel ?? "";
    return norm(label) === n || (n && norm(label).includes(n));
  });
  if (byLabel) return byLabel;
  if (/(upi|payment|qr|refund|bank)/.test(n)) return "cat-financial";
  if (/(job|investment|trading|crypto|task)/.test(n)) return "cat-opportunity";
  if (/(romance|dating|pig|matrimon)/.test(n)) return "cat-romance";
  if (/(impersonat|fear|arrest|police|kyc|customercare)/.test(n)) return "cat-impersonation";
  if (/(blackmail|extort|sextort|nude|morph)/.test(n)) return "cat-blackmail";
  return "cat-financial";
}

interface ImportRow {
  category: string;
  catId: string;
  title: string;
  summary: string;
  keywords: string;
  source: string;
}

function labelOf(id: string): string {
  return getNodeById(id)?.shortLabel ?? getNodeById(id)?.title ?? id;
}

// ---------------------------------------------------------------------------
// Three.js scene — 3D bars for the top-clicked scams
// ---------------------------------------------------------------------------

function ThreeScene({ stats }: { stats: StatRow[] }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef(stats);
  statsRef.current = stats;

  useEffect(() => {
    let disposed = false;
    let renderer: any;
    let frame = 0;
    const mount = mountRef.current;
    if (!mount) return;

    loadThree().then((THREE: any) => {
      if (disposed || !mountRef.current) return;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x05070a, 0.028);

      const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 200);
      camera.position.set(0, 7, 20);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      mount.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0x8899aa, 0.55));
      const key = new THREE.PointLight(0x3ddc84, 1.1, 60);
      key.position.set(8, 14, 10);
      scene.add(key);
      const rim = new THREE.PointLight(0x6ea8fe, 0.9, 60);
      rim.position.set(-10, 8, -8);
      scene.add(rim);

      const grid = new THREE.GridHelper(70, 46, 0x1d2a38, 0x121b26);
      grid.position.y = -0.01;
      scene.add(grid);

      // Particle field
      const pGeo = new THREE.BufferGeometry();
      const pCount = 420;
      const pos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 70;
        pos[i * 3 + 1] = Math.random() * 24;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 70;
      }
      pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const particles = new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ color: 0x3ddc84, size: 0.07, transparent: true, opacity: 0.5 })
      );
      scene.add(particles);

      // Bar group — rebuilt when stats arrive
      const barGroup = new THREE.Group();
      scene.add(barGroup);
      const bars: { mesh: any; target: number }[] = [];

      function makeLabel(text: string, count: number): any {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext("2d")!;
        ctx.font = "600 44px system-ui, sans-serif";
        ctx.fillStyle = "rgba(230,237,243,0.92)";
        ctx.textAlign = "center";
        ctx.fillText(text.slice(0, 22), 256, 56);
        ctx.font = "400 36px monospace";
        ctx.fillStyle = "rgba(61,220,132,0.9)";
        ctx.fillText(String(count), 256, 104);
        const tex = new THREE.CanvasTexture(canvas);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
        sprite.scale.set(4.6, 1.15, 1);
        return sprite;
      }

      function buildBars(rows: StatRow[]) {
        while (barGroup.children.length) barGroup.remove(barGroup.children[0]);
        bars.length = 0;
        const top = [...rows].sort((a, b) => b.count - a.count).slice(0, 10);
        const max = Math.max(...top.map((r) => r.count), 1);
        const radius = Math.max(5.5, top.length * 1.05);
        top.forEach((row, i) => {
          const angle = (i / top.length) * Math.PI * 2;
          const height = 0.4 + (row.count / max) * 7;
          const colorHex = CATEGORY_COLOR[categoryOf(row.id)] ?? "#e6edf3";
          const color = new THREE.Color(colorHex);
          const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 1, 1.1),
            new THREE.MeshStandardMaterial({
              color,
              emissive: color,
              emissiveIntensity: 0.32,
              transparent: true,
              opacity: 0.92,
              roughness: 0.35,
              metalness: 0.25,
            })
          );
          mesh.position.set(Math.cos(angle) * radius, 0.05, Math.sin(angle) * radius);
          mesh.scale.y = 0.01;
          barGroup.add(mesh);
          bars.push({ mesh, target: height });

          const label = makeLabel(labelOf(row.id), row.count);
          label.position.set(Math.cos(angle) * radius, height + 1.15, Math.sin(angle) * radius);
          barGroup.add(label);
        });
      }

      let built = 0;
      const mouse = { x: 0, y: 0 };
      const onMouse = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("mousemove", onMouse, { passive: true });
      window.addEventListener("resize", onResize);

      const clock = new THREE.Clock();
      function animate() {
        if (disposed) return;
        frame = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        if (statsRef.current.length && built !== statsRef.current.length) {
          built = statsRef.current.length;
          buildBars(statsRef.current);
        }

        // Bars grow in with an ease-out
        for (const b of bars) {
          const y = b.mesh.scale.y + (b.target - b.mesh.scale.y) * 0.06;
          b.mesh.scale.y = y;
          b.mesh.position.y = y / 2;
        }

        barGroup.rotation.y = t * 0.12;
        particles.rotation.y = t * 0.015;

        camera.position.x += (mouse.x * 5 - camera.position.x) * 0.03;
        camera.position.y += (7 - mouse.y * 2.5 - camera.position.y) * 0.03;
        camera.lookAt(0, 2.4, 0);

        renderer.render(scene, camera);
      }
      animate();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      if (renderer) {
        renderer.dispose();
        renderer.domElement?.remove();
      }
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0" />;
}

// ---------------------------------------------------------------------------
// Glass panel wrapper
// ---------------------------------------------------------------------------

function Panel({ title, hint, children, delay = 0 }: { title: string; hint?: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="rounded-2xl border border-line p-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
      style={{ background: "rgba(11,15,20,0.84)", backdropFilter: "blur(14px)" }}
    >
      <h2 className="font-mono text-[13px] tracking-widest uppercase text-signal mb-0.5">{title}</h2>
      {hint && <p className="text-[11px] text-ghost mb-3">{hint}</p>}
      {children}
    </motion.section>
  );
}

// ---------------------------------------------------------------------------
// Main portal
// ---------------------------------------------------------------------------

export default function AdminPortal({ initialView = "dashboard" }: { initialView?: AdminView }) {
  const [key, setKey] = useState<string | null>(() => sessionStorage.getItem("gg-admin-key"));
  const [pw, setPw] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [view, setView] = useState<AdminView>(initialView);

  const [stats, setStats] = useState<StatRow[]>([]);
  const [trends, setTrends] = useState<TrendRow[]>([]);
  const [missed, setMissed] = useState<MissRow[]>([]);
  const [rangeDays, setRangeDays] = useState(14); // date-range filter for time-based panels
  const [theme, setTheme] = useState<SiteTheme>(DEFAULT_THEME);
  const [saved, setSaved] = useState<string | null>(null);

  const leaves = useMemo(() => getAllLeaves(), []);
  const categories = useMemo(
    () => Object.keys(CATEGORY_COLOR).map((id) => ({ id, label: getNodeById(id)?.shortLabel ?? id })),
    []
  );

  // Content editor state
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newCat, setNewCat] = useState("cat-financial");

  // Import-from-spreadsheet state
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [importBusy, setImportBusy] = useState(false);

  const authed = (path: string, init?: RequestInit) =>
    fetch(path, { ...init, headers: { ...(init?.headers ?? {}), "x-admin-key": key ?? "", "Content-Type": "application/json" } });

  useEffect(() => {
    if (!key) return;
    authed("/api/admin/stats")
      .then((r) => {
        if (r.status === 401) {
          sessionStorage.removeItem("gg-admin-key");
          setKey(null);
          return [];
        }
        return r.json();
      })
      .then(setStats)
      .catch(() => {});
    authed("/api/admin/misses").then((r) => r.json()).then(setMissed).catch(() => {});
    fetch("/api/theme").then((r) => r.json()).then((t) => setTheme({ ...DEFAULT_THEME, ...t })).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Trends refetch whenever the date-range filter changes.
  useEffect(() => {
    if (!key) return;
    authed(`/api/admin/trends?days=${rangeDays}`).then((r) => r.json()).then((d) => setTrends(d.rows ?? [])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, rangeDays]);

  useEffect(() => {
    if (!editId) return;
    const n = getNodeById(editId);
    setEditTitle(n?.title ?? "");
    setEditSummary(n?.summary ?? "");
  }, [editId]);

  const flash = (msg: string) => {
    setSaved(msg);
    setTimeout(() => setSaved(null), 2200);
  };

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    }).catch(() => null);
    if (r?.ok) {
      sessionStorage.setItem("gg-admin-key", pw);
      setKey(pw);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  }

  async function saveTheme() {
    const r = await authed("/api/admin/theme", { method: "PUT", body: JSON.stringify(theme) }).catch(() => null);
    flash(r?.ok ? "Theme saved — reload the main site to see it." : "Save failed — is the API running?");
  }

  async function saveEdit() {
    if (!editId) return;
    const r = await authed("/api/admin/content", {
      method: "PUT",
      body: JSON.stringify({ edit: { id: editId, patch: { title: editTitle, summary: editSummary } } }),
    }).catch(() => null);
    flash(r?.ok ? "Edit saved — applies on next page load." : "Save failed — is the API running?");
  }

  async function addScam() {
    const t = newTitle.trim();
    if (t.length < 4) return flash("Give the new scam a longer title first.");
    const id = t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
    const r = await authed("/api/admin/content", {
      method: "PUT",
      body: JSON.stringify({
        add: {
          parentId: newCat,
          node: { id, title: t, shortLabel: t.slice(0, 24), summary: newSummary.trim(), comingSoon: true },
        },
      }),
    }).catch(() => null);
    if (r?.ok) {
      setNewTitle("");
      setNewSummary("");
      flash(`Added "${t}" as coming-soon under ${getNodeById(newCat)?.shortLabel ?? newCat}.`);
    } else {
      flash("Add failed — is the API running?");
    }
  }

  // Read the daily-filled spreadsheet, show approved rows for a final review.
  async function openImport() {
    setImportMsg(null);
    setImportRows([]);
    try {
      const res = await authed("/api/admin/import-file");
      if (res.status === 404) {
        setImportOpen(true);
        setImportMsg("No spreadsheet yet — the daily task creates import/scam-inbox.xlsx. You can also drop your own file there.");
        return;
      }
      if (!res.ok) throw new Error("fetch failed");
      const buf = await res.arrayBuffer();
      const XLSX = await loadSheetJS();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
      const headerIdx = aoa.findIndex((r) => r.map((c) => norm(c)).includes("title") && r.map((c) => norm(c)).includes("approved"));
      if (headerIdx === -1) throw new Error("no header");
      const cols = aoa[headerIdx].map((c) => norm(c));
      const col = (name: string) => cols.indexOf(name);
      const rows: ImportRow[] = [];
      for (const r of aoa.slice(headerIdx + 1)) {
        const approved = norm(r[col("approved")]);
        const title = String(r[col("title")] ?? "").trim();
        if (approved !== "yes" || title.length < 4) continue;
        const category = String(r[col("category")] ?? "").trim();
        rows.push({
          category,
          catId: categoryIdFromName(category),
          title,
          summary: String(r[col("summary")] ?? "").trim(),
          keywords: String(r[col("keywords")] ?? "").trim(),
          source: String(r[col("source")] ?? "").trim(),
        });
      }
      setImportRows(rows);
      setImportOpen(true);
      if (rows.length === 0) setImportMsg("No rows are marked approved=YES yet. Set the 'approved' column to YES for the scams you want, save the file, and try again.");
    } catch {
      setImportOpen(true);
      setImportMsg("Couldn't read the spreadsheet. Make sure import/scam-inbox.xlsx exists and the API is running.");
    }
  }

  async function confirmImport() {
    setImportBusy(true);
    let ok = 0;
    for (const row of importRows) {
      const id = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
      const keywords = row.keywords ? row.keywords.split(/[,;]/).map((k) => k.trim()).filter(Boolean) : undefined;
      const r = await authed("/api/admin/content", {
        method: "PUT",
        body: JSON.stringify({
          add: { parentId: row.catId, node: { id, title: row.title, shortLabel: row.title.slice(0, 24), summary: row.summary, keywords, comingSoon: true } },
        }),
      }).catch(() => null);
      if (r?.ok) ok++;
    }
    setImportBusy(false);
    setImportOpen(false);
    flash(`Imported ${ok} of ${importRows.length} scam${importRows.length === 1 ? "" : "s"} — they're live on the map now.`);
  }

  const inputCls =
    "w-full rounded-lg bg-black/40 border border-line px-3 py-2 text-sm text-white outline-none focus:border-signal transition-colors";

  // ---------- Login gate ----------
  if (!key) {
    return (
      <div className="relative min-h-screen overflow-hidden" style={{ background: "#05070a" }}>
        <ThreeScene stats={[]} />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <motion.form
            onSubmit={login}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-sm rounded-2xl border border-line p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
            style={{ background: "rgba(11,15,20,0.78)", backdropFilter: "blur(16px)" }}
          >
            <h1 className="font-mono text-signal text-sm tracking-widest uppercase mb-1">gothacked.guru</h1>
            <p className="text-white text-lg font-semibold mb-6">Admin Portal</p>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Admin password"
              className={inputCls + " text-center mb-3"}
              autoFocus
            />
            {loginError && <p className="text-alert text-xs mb-3">Wrong password (or the API isn't running).</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-signal/15 border border-signal/50 text-signal py-2 text-sm font-medium hover:bg-signal/25 transition-colors"
            >
              Enter
            </button>
            <p className="text-[10.5px] text-ghost mt-4">Password lives in server/data/admin.json — change the default.</p>
          </motion.form>
        </div>
      </div>
    );
  }

  const TabSwitch = (
    <div className="flex items-center gap-1 border border-line rounded-lg p-1" style={{ background: "rgba(0,0,0,0.35)" }}>
      {([
        { id: "dashboard", label: "Analytics" },
        { id: "siem", label: "SOC Monitor" },
      ] as { id: AdminView; label: string }[]).map((t) => (
        <button
          key={t.id}
          onClick={() => setView(t.id)}
          className={`text-xs font-mono px-3 py-1.5 rounded-md transition-colors ${
            view === t.id ? "bg-signal/15 text-signal" : "text-ghost hover:text-white"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  // ---------- SOC monitor tab (gated: only reachable once authed) ----------
  if (view === "siem") {
    return <SiemDashboard tabSwitch={TabSwitch} onExit={() => setView("dashboard")} />;
  }

  // ---------- Analytics dashboard tab ----------
  return (
    <div className="relative min-h-screen" style={{ background: "#05070a" }}>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 40% at 15% 0%, rgba(61,220,132,0.06), transparent 60%), radial-gradient(60% 40% at 85% 10%, rgba(110,168,254,0.05), transparent 60%)",
        }}
      />

      <div className="relative z-10 px-4 sm:px-8 py-6 max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 gap-3 flex-wrap"
        >
          <div>
            <h1 className="font-mono text-signal text-sm tracking-widest uppercase">gothacked.guru — admin</h1>
            <p className="text-[11px] text-ghost">Live, anonymous aggregates — what visitors open, search, and can't find.</p>
          </div>
          <div className="flex items-center gap-3">
            {TabSwitch}
            <a href="/" className="text-xs text-ghost hover:text-white transition-colors">← site</a>
            <button
              onClick={() => {
                sessionStorage.removeItem("gg-admin-key");
                setKey(null);
              }}
              className="text-xs border border-line rounded-lg px-3 py-1.5 text-ghost hover:text-white hover:border-signal/50 transition-colors"
            >
              Lock
            </button>
          </div>
        </motion.header>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-signal/50 bg-black/85 text-signal text-xs px-4 py-2"
          >
            {saved}
          </motion.div>
        )}

        <AnalyticsView stats={stats} trends={trends} missed={missed} rangeDays={rangeDays} onRangeChange={setRangeDays} />

        {/* Missed-search detail — direct content-gap list */}
        {missed.length > 0 && (
          <Panel title="Missed searches" hint="What visitors typed and found nothing for — your clearest content gaps" delay={0.05}>
            <div className="flex flex-wrap gap-2">
              {missed.map((m) => (
                <span key={m.query} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-black/30 px-3 py-1 text-xs text-white">
                  {m.query}
                  <span className="font-mono text-[10px] text-signal">×{m.count}</span>
                </span>
              ))}
            </div>
          </Panel>
        )}

        <div className="mt-8 mb-3">
          <h2 className="font-mono text-signal text-xs tracking-widest uppercase">Controls</h2>
          <p className="text-[11px] text-ghost">Edit the live site without a rebuild.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* Theme */}
          <Panel title="Site background" hint="Changes the live site's ambient colors. Saved for every visitor." delay={0.2}>
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-ghost mb-1">
                  <span>Primary hue (grid + glow)</span>
                  <span className="font-mono" style={{ color: `hsl(${theme.hue},70%,60%)` }}>{theme.hue}°</span>
                </div>
                <input type="range" min={0} max={360} value={theme.hue} className="w-full accent-[var(--tw-signal,#3ddc84)]"
                  onChange={(e) => setTheme({ ...theme, hue: Number(e.target.value) })} />
              </div>
              <div>
                <div className="flex justify-between text-ghost mb-1">
                  <span>Accent hue (second glow)</span>
                  <span className="font-mono" style={{ color: `hsl(${theme.accentHue},80%,68%)` }}>{theme.accentHue}°</span>
                </div>
                <input type="range" min={0} max={360} value={theme.accentHue} className="w-full"
                  onChange={(e) => setTheme({ ...theme, accentHue: Number(e.target.value) })} />
              </div>
              <div>
                <div className="flex justify-between text-ghost mb-1">
                  <span>Intensity</span>
                  <span className="font-mono">{theme.intensity.toFixed(1)}×</span>
                </div>
                <input type="range" min={0.2} max={3} step={0.1} value={theme.intensity} className="w-full"
                  onChange={(e) => setTheme({ ...theme, intensity: Number(e.target.value) })} />
              </div>
              <label className="flex items-center gap-2 text-ghost cursor-pointer">
                <input type="checkbox" checked={theme.gridVisible}
                  onChange={(e) => setTheme({ ...theme, gridVisible: e.target.checked })} />
                Show background grid
              </label>
              <div
                className="h-14 rounded-lg border border-line"
                style={{
                  background: `radial-gradient(circle at 25% 40%, hsla(${theme.hue},70%,55%,${Math.min(0.5, 0.3 * theme.intensity)}), transparent 60%), radial-gradient(circle at 75% 60%, hsla(${theme.accentHue},88%,71%,${Math.min(0.5, 0.28 * theme.intensity)}), transparent 60%), #05070a`,
                }}
              />
              <button onClick={saveTheme}
                className="w-full rounded-lg bg-signal/15 border border-signal/50 text-signal py-2 font-medium hover:bg-signal/25 transition-colors">
                Save theme
              </button>
            </div>
          </Panel>

          {/* Edit existing scam */}
          <Panel title="Edit a scam" hint="Patches the live content — no rebuild, no redeploy" delay={0.25}>
            <div className="space-y-3 text-xs">
              <select value={editId} onChange={(e) => setEditId(e.target.value)} className={inputCls}>
                <option value="">Choose a scam…</option>
                {leaves.map((l) => (
                  <option key={l.node.id} value={l.node.id}>
                    {l.path[l.path.length - 2]?.shortLabel} — {l.node.title}
                  </option>
                ))}
              </select>
              {editId && (
                <>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" className={inputCls} />
                  <textarea value={editSummary} onChange={(e) => setEditSummary(e.target.value)} placeholder="Summary" rows={4} className={inputCls} />
                  <button onClick={saveEdit}
                    className="w-full rounded-lg bg-signal/15 border border-signal/50 text-signal py-2 font-medium hover:bg-signal/25 transition-colors">
                    Save edit
                  </button>
                </>
              )}
            </div>
          </Panel>

          {/* Add new scam + intel */}
          <Panel title="Add a new scam" hint="Appears on the map as 'coming soon' until you write the full guide" delay={0.3}>
            <div className="space-y-3 text-xs">
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Scam title, e.g. 'Digital arrest video call'" className={inputCls} />
              <select value={newCat} onChange={(e) => setNewCat(e.target.value)} className={inputCls}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <textarea value={newSummary} onChange={(e) => setNewSummary(e.target.value)} placeholder="One-paragraph summary of how the scam works" rows={3} className={inputCls} />
              <button onClick={addScam}
                className="w-full rounded-lg bg-signal/15 border border-signal/50 text-signal py-2 font-medium hover:bg-signal/25 transition-colors">
                Add scam
              </button>
              <div className="border-t border-line pt-3 mt-1">
                <p className="font-mono text-[10px] tracking-widest uppercase text-ghost mb-2">Intel sources</p>
                <div className="flex flex-col gap-1.5">
                  <a className="text-signal/90 hover:text-signal" href="https://www.cert-in.org.in" target="_blank" rel="noreferrer">CERT-In advisories ↗</a>
                  <a className="text-signal/90 hover:text-signal" href="https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx" target="_blank" rel="noreferrer">RBI press releases ↗</a>
                  <a className="text-signal/90 hover:text-signal" href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">cybercrime.gov.in (I4C) ↗</a>
                  <p className="text-ghost text-[11px] mt-1">A weekly automated sweep also drops reports into <span className="font-mono">intel/</span>.</p>
                </div>
              </div>
            </div>
          </Panel>

          {/* Import from spreadsheet */}
          <Panel title="Import from spreadsheet" hint="Bulk-add scams the daily task queued for you — review, then import" delay={0.35}>
            <div className="space-y-3 text-xs">
              <p className="text-ghost leading-relaxed">
                Each day, a scheduled task researches new scams and appends them to
                <span className="font-mono text-white"> import/scam-inbox.xlsx</span>. Open it, read each row, set
                <span className="text-signal"> approved = YES</span> for the ones you want, save, then import here.
              </p>
              <button onClick={openImport}
                className="w-full rounded-lg bg-signal/15 border border-signal/50 text-signal py-2 font-medium hover:bg-signal/25 transition-colors">
                Review &amp; import from Excel
              </button>
              <p className="text-ghost/70 text-[11px]">Imported scams appear as “coming soon” until you fill in the full guide.</p>
            </div>
          </Panel>
        </div>
      </div>

      {/* Import review modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-line"
            style={{ background: "rgba(11,15,20,0.98)" }}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
              <div>
                <h3 className="text-sm font-semibold text-white">Review before import</h3>
                <p className="text-[11px] text-ghost">{importRows.length} approved {importRows.length === 1 ? "scam" : "scams"} ready to add</p>
              </div>
              <button onClick={() => setImportOpen(false)} className="text-ghost hover:text-white text-lg leading-none">×</button>
            </div>

            <div className="flex-1 overflow-auto p-5">
              {importMsg && <p className="text-warn text-xs mb-3">{importMsg}</p>}
              {importRows.length > 0 && (
                <div className="space-y-2.5">
                  {importRows.map((r, i) => (
                    <div key={i} className="rounded-lg border border-line p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-sm" style={{ background: CATEGORY_COLOR[r.catId] ?? "#e6edf3" }} />
                        <span className="text-white text-sm font-medium">{r.title}</span>
                        <span className="text-[10px] font-mono text-ghost ml-auto">{getNodeById(r.catId)?.shortLabel ?? r.catId}</span>
                      </div>
                      {r.summary && <p className="text-ghost text-[11.5px] leading-relaxed">{r.summary}</p>}
                      {r.source && <p className="text-ghost/60 text-[10px] mt-1 font-mono">source: {r.source}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-line">
              <button onClick={() => setImportOpen(false)} className="text-xs border border-line rounded-lg px-4 py-2 text-ghost hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmImport}
                disabled={importRows.length === 0 || importBusy}
                className="text-xs rounded-lg px-4 py-2 font-medium bg-signal/15 border border-signal/50 text-signal hover:bg-signal/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {importBusy ? "Importing…" : `Import ${importRows.length || ""} scam${importRows.length === 1 ? "" : "s"}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
