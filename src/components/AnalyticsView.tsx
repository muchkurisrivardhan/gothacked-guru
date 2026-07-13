import { useMemo } from "react";
import { motion } from "framer-motion";
import { CATEGORY_COLOR } from "./TreeGraph";
import { getAllLeaves, getNodeById, findPathToNode } from "../data/scams";

// ---------------------------------------------------------------------------
// Analytics view — clean, card-based dashboard in the gothacked palette.
// Layout mirrors a classic marketing-analytics dashboard (KPI cards → combo
// chart → donut + line → heat/treemap) but rendered dark with signal-green
// accents and driven entirely by the site's real, anonymous aggregates.
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

const categoryOf = (id: string) => findPathToNode(id)?.[1]?.id ?? "";
const labelOf = (id: string) => getNodeById(id)?.shortLabel ?? getNodeById(id)?.title ?? id;
const catLabel = (id: string) => getNodeById(id)?.shortLabel ?? id;

function lastDates(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.now() - (n - 1 - i) * 86400000);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  });
}

// Catmull-Rom → cubic bezier, for smooth line charts.
function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function Card({ label, value, sub, trend, gradient, delay }: {
  label: string;
  value: string;
  sub?: string;
  trend?: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative rounded-2xl p-4 overflow-hidden border border-white/10"
      style={{ background: gradient, boxShadow: "0 16px 40px rgba(0,0,0,0.45)" }}
    >
      <div className="absolute -right-6 -top-8 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.12)", filter: "blur(6px)" }} />
      <div className="relative">
        <div className="text-2xl font-bold text-white leading-none">{value}</div>
        <div className="text-[11px] text-white/80 mt-1.5">{label}</div>
        {(sub || trend) && (
          <div className="flex items-center gap-1.5 mt-2">
            {trend && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/25 text-white">{trend}</span>
            )}
            {sub && <span className="text-[10px] text-white/70">{sub}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Panel({ title, hint, children, className = "" }: { title: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line p-5 ${className}`} style={{ background: "rgba(11,15,20,0.82)" }}>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {hint && <p className="text-[11px] text-ghost mt-0.5">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

const RANGES = [
  { days: 7, label: "Last 7 days" },
  { days: 14, label: "Last 14 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
];

export default function AnalyticsView({
  stats,
  trends,
  missed,
  rangeDays,
  onRangeChange,
}: {
  stats: StatRow[];
  trends: TrendRow[];
  missed: MissRow[];
  rangeDays: number;
  onRangeChange: (d: number) => void;
}) {
  const days = trends[0]?.series.length ?? rangeDays;
  const dates = useMemo(() => lastDates(days), [days]);
  const rangeLabel = RANGES.find((r) => r.days === rangeDays)?.label ?? `Last ${rangeDays} days`;

  // ---- KPIs ----
  const allTimeOpens = useMemo(() => stats.reduce((a, b) => a + b.count, 0), [stats]);
  const rangeOpens = useMemo(() => trends.reduce((a, b) => a + b.series.reduce((x, y) => x + y, 0), 0), [trends]);
  const totalRecent = useMemo(() => trends.reduce((a, b) => a + b.recent, 0), [trends]);
  const totalPrev = useMemo(() => trends.reduce((a, b) => a + b.prev, 0), [trends]);
  const overallDelta = totalRecent - totalPrev;
  const deltaPct = totalPrev > 0 ? Math.round((overallDelta / totalPrev) * 100) : null;
  const missTotal = useMemo(() => missed.reduce((a, b) => a + b.count, 0), [missed]);
  const topRiser = useMemo(() => [...trends].sort((a, b) => b.delta - a.delta)[0], [trends]);
  const coveredCount = useMemo(() => stats.filter((s) => s.count > 0).length, [stats]);
  const totalGuides = useMemo(() => getAllLeaves().length, []);
  const coveragePct = totalGuides ? Math.round((coveredCount / totalGuides) * 100) : 0;

  // ---- Combo chart: daily totals (bars) + cumulative (line) ----
  const daily = useMemo(() => {
    const arr = new Array(days).fill(0);
    for (const t of trends) t.series.forEach((v, i) => (arr[i] += v));
    return arr as number[];
  }, [trends, days]);
  const cumulative = useMemo(() => {
    let run = 0;
    return daily.map((v) => (run += v));
  }, [daily]);

  // ---- Donut: opens grouped by category ----
  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of stats) {
      const c = categoryOf(s.id);
      if (c) m.set(c, (m.get(c) ?? 0) + s.count);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [stats]);
  const catTotal = byCategory.reduce((a, [, v]) => a + v, 0);

  // ---- Momentum: top-3 categories' daily series ----
  const momentum = useMemo(() => {
    const m = new Map<string, number[]>();
    for (const t of trends) {
      const c = categoryOf(t.id);
      if (!c) continue;
      const acc = m.get(c) ?? new Array(days).fill(0);
      t.series.forEach((v, i) => (acc[i] += v));
      m.set(c, acc);
    }
    return [...m.entries()]
      .sort((a, b) => b[1].reduce((x, y) => x + y, 0) - a[1].reduce((x, y) => x + y, 0))
      .slice(0, 3);
  }, [trends, days]);

  // ---- Treemap/heat: categories → member scams sized by opens ----
  const heat = useMemo(() => {
    const countById = new Map(stats.map((s) => [s.id, s.count] as const));
    const groups = new Map<string, { id: string; label: string; count: number }[]>();
    for (const { node } of getAllLeaves()) {
      const c = categoryOf(node.id);
      if (!c) continue;
      const list = groups.get(c) ?? [];
      list.push({ id: node.id, label: labelOf(node.id), count: countById.get(node.id) ?? 0 });
      groups.set(c, list);
    }
    return [...groups.entries()]
      .map(([cat, items]) => ({
        cat,
        items: items.sort((a, b) => b.count - a.count),
        total: items.reduce((a, b) => a + b.count, 0),
      }))
      .sort((a, b) => b.total - a.total);
  }, [stats]);
  const heatMax = Math.max(...heat.flatMap((g) => g.items.map((i) => i.count)), 1);

  function exportCsv() {
    const lines: string[] = [];
    lines.push(`gothacked.guru analytics export,${new Date().toISOString()}`);
    lines.push(`Range,${rangeLabel}`);
    lines.push("");
    lines.push("KPI,Value");
    lines.push(`Opens in range,${rangeOpens}`);
    lines.push(`All-time opens,${allTimeOpens}`);
    lines.push(`Guide coverage,${coveragePct}% (${coveredCount}/${totalGuides})`);
    lines.push(`Content gaps (missed searches),${missTotal}`);
    lines.push("");
    lines.push("Scam,Category,All-time opens");
    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
    [...stats].sort((a, b) => b.count - a.count).forEach((s) =>
      lines.push([esc(labelOf(s.id)), esc(catLabel(categoryOf(s.id))), s.count].join(","))
    );
    lines.push("");
    lines.push("Missed search,Count");
    missed.forEach((m) => lines.push([esc(m.query), m.count].join(",")));

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gothacked-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const CW = 620; // combo chart viewBox width
  const CH = 210;
  const barMax = Math.max(...daily, 1);
  const cumMax = Math.max(...cumulative, 1);

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs text-ghost">
          Showing <span className="text-white font-medium">{rangeLabel.toLowerCase()}</span> · {rangeOpens.toLocaleString()} opens in range
        </p>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs">
            <span className="text-ghost">Filter by</span>
            <div className="relative">
              <select
                value={rangeDays}
                onChange={(e) => onRangeChange(Number(e.target.value))}
                className="appearance-none rounded-lg border border-line bg-panel text-white pl-3 pr-8 py-1.5 text-xs outline-none focus:border-signal transition-colors cursor-pointer"
              >
                {RANGES.map((r) => (
                  <option key={r.days} value={r.days}>{r.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ghost text-[10px]">▼</span>
            </div>
          </label>
          <button
            onClick={exportCsv}
            className="rounded-lg border border-line bg-panel text-white px-3 py-1.5 text-xs hover:border-signal/60 hover:text-signal transition-colors"
          >
            ⭳ Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-line bg-panel text-white px-3 py-1.5 text-xs hover:border-signal/60 hover:text-signal transition-colors"
          >
            ⎙ Print / PDF
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <Card label={`Opens · ${rangeLabel.toLowerCase()}`} value={rangeOpens.toLocaleString()} gradient="linear-gradient(135deg,#0f9d58,#3ddc84)" delay={0.02}
          trend={deltaPct === null ? (overallDelta >= 0 ? `▲ +${overallDelta}` : `▼ ${overallDelta}`) : `${overallDelta >= 0 ? "▲" : "▼"} ${overallDelta >= 0 ? "+" : ""}${deltaPct}%`}
          sub="vs prior half" />
        <Card label="All-time opens" value={allTimeOpens.toLocaleString()} gradient="linear-gradient(135deg,#0b6a8c,#1fb6c0)" delay={0.06} sub={`${stats.length} guides opened`} />
        <Card label="Guide coverage" value={`${coveragePct}%`} gradient="linear-gradient(135deg,#1663c7,#4c8dff)" delay={0.1} sub={`${coveredCount}/${totalGuides} guides opened`} />
        <Card label="Content gaps" value={String(missTotal)} gradient="linear-gradient(135deg,#9a6400,#ffb84d)" delay={0.14} sub={`${missed.length} unique searches`} />
        <Card label="Top riser" value={topRiser && topRiser.delta > 0 ? `+${topRiser.delta}` : "—"} gradient="linear-gradient(135deg,#6d28d9,#c17bff)" delay={0.18}
          sub={topRiser && topRiser.delta > 0 ? labelOf(topRiser.id) : "no rising scam yet"} />
      </div>

      {/* Combo chart */}
      <Panel title="Guide opens over time" hint={`Daily opens (bars) and cumulative total (line), last ${days} days`}>
        {daily.every((v) => v === 0) ? (
          <p className="text-xs text-ghost">No daily activity recorded yet — data fills in as visitors open guides.</p>
        ) : (
          <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full" style={{ maxHeight: 240 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3ddc84" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3ddc84" stopOpacity="0.25" />
              </linearGradient>
              <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6ea8fe" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#6ea8fe" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75, 1].map((g) => (
              <line key={g} x1={0} x2={CW} y1={CH - 24 - g * (CH - 44)} y2={CH - 24 - g * (CH - 44)} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            ))}
            {daily.map((v, i) => {
              const bw = (CW / days) * 0.5;
              const x = (i + 0.5) * (CW / days) - bw / 2;
              const h = (v / barMax) * (CH - 44);
              return (
                <motion.rect
                  key={i}
                  x={x}
                  width={bw}
                  initial={{ height: 0, y: CH - 24 }}
                  animate={{ height: h, y: CH - 24 - h }}
                  transition={{ duration: 0.6, delay: i * 0.02 }}
                  rx={2}
                  fill="url(#barGrad)"
                />
              );
            })}
            {(() => {
              const pts = cumulative.map((v, i) => [(i + 0.5) * (CW / days), CH - 24 - (v / cumMax) * (CH - 44)] as [number, number]);
              const path = smoothPath(pts);
              return (
                <>
                  <path d={`${path} L ${pts[pts.length - 1][0]},${CH - 24} L ${pts[0][0]},${CH - 24} Z`} fill="url(#lineFill)" />
                  <motion.path d={path} fill="none" stroke="#6ea8fe" strokeWidth={2.5}
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1 }}
                    style={{ filter: "drop-shadow(0 0 6px rgba(110,168,254,0.6))" }} />
                </>
              );
            })()}
            {dates.map((d, i) =>
              i % 2 === 0 ? (
                <text key={i} x={(i + 0.5) * (CW / days)} y={CH - 8} fontSize={9} fill="#7d8a9a" textAnchor="middle" fontFamily="monospace">
                  {d.split(" ")[0]}
                </text>
              ) : null
            )}
          </svg>
        )}
        <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-ghost">
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#3ddc84" }} /> daily opens</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-4 h-[2px]" style={{ background: "#6ea8fe" }} /> cumulative</span>
        </div>
      </Panel>

      {/* Donut + momentum */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Opens by scam category" hint="Which threat families visitors need help with most">
          {catTotal === 0 ? (
            <p className="text-xs text-ghost">No category data yet.</p>
          ) : (
            <div className="flex items-center gap-5">
              <Donut data={byCategory} total={catTotal} />
              <div className="flex flex-col gap-2 text-xs">
                {byCategory.map(([cat, v]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CATEGORY_COLOR[cat] ?? "#e6edf3" }} />
                    <span className="text-white w-28 truncate">{catLabel(cat)}</span>
                    <span className="text-ghost font-mono tabular-nums">{Math.round((v / catTotal) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Category momentum" hint="Daily opens for your top 3 categories">
          {momentum.length === 0 ? (
            <p className="text-xs text-ghost">Momentum appears once daily opens accumulate.</p>
          ) : (
            <>
              <svg viewBox="0 0 620 180" className="w-full" style={{ maxHeight: 200 }}>
                {(() => {
                  const max = Math.max(...momentum.flatMap(([, s]) => s), 1);
                  return momentum.map(([cat, series]) => {
                    const pts = series.map((v, i) => [(i / (days - 1)) * 600 + 10, 160 - (v / max) * 140] as [number, number]);
                    const color = CATEGORY_COLOR[cat] ?? "#e6edf3";
                    return (
                      <motion.path key={cat} d={smoothPath(pts)} fill="none" stroke={color} strokeWidth={2.2}
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }}
                        style={{ filter: `drop-shadow(0 0 5px ${color}80)` }} />
                    );
                  });
                })()}
              </svg>
              <div className="flex flex-wrap gap-3 mt-1 text-[11px] font-mono text-ghost">
                {momentum.map(([cat]) => (
                  <span key={cat} className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-[2px]" style={{ background: CATEGORY_COLOR[cat] ?? "#e6edf3" }} />
                    {catLabel(cat)}
                  </span>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>

      {/* Heat / treemap */}
      <Panel title="Scam coverage heatmap" hint="Every guide, grouped by category and shaded by how often it's opened. Dark cells are under-used or new content.">
        <div className="space-y-2.5">
          {heat.map((g) => (
            <div key={g.cat}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: CATEGORY_COLOR[g.cat] ?? "#e6edf3" }}>
                  {catLabel(g.cat)}
                </span>
                <span className="text-[10px] font-mono text-ghost">{g.total} opens</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {g.items.map((it) => {
                  const base = CATEGORY_COLOR[g.cat] ?? "#3ddc84";
                  const intensity = 0.14 + (it.count / heatMax) * 0.86;
                  return (
                    <div
                      key={it.id}
                      title={`${it.label}: ${it.count} opens`}
                      className="rounded-md px-2.5 py-2 border border-white/5 min-w-[92px] flex-1"
                      style={{ background: base, opacity: intensity, maxWidth: 180 }}
                    >
                      <div className="text-[10.5px] font-medium text-black/85 leading-tight truncate">{it.label}</div>
                      <div className="text-[13px] font-bold text-black/80 tabular-nums">{it.count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Donut({ data, total }: { data: [string, number][]; total: number }) {
  const R = 32;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg viewBox="0 0 90 90" className="w-28 h-28 shrink-0 -rotate-90">
      <circle cx={45} cy={45} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={11} />
      {data.map(([cat, v]) => {
        const frac = v / total;
        const seg = (
          <circle
            key={cat}
            cx={45}
            cy={45}
            r={R}
            fill="none"
            stroke={CATEGORY_COLOR[cat] ?? "#e6edf3"}
            strokeWidth={11}
            strokeDasharray={`${frac * C} ${C - frac * C}`}
            strokeDashoffset={-offset}
            style={{ filter: `drop-shadow(0 0 3px ${(CATEGORY_COLOR[cat] ?? "#e6edf3")}90)`, transition: "stroke-dasharray .6s, stroke-dashoffset .6s" }}
          />
        );
        offset += frac * C;
        return seg;
      })}
      <text x={45} y={45} textAnchor="middle" dominantBaseline="central" transform="rotate(90 45 45)" fontSize={13} fill="#e6edf3" fontFamily="monospace">
        {total}
      </text>
    </svg>
  );
}
