import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CITIES,
  SEV_COLOR,
  SEVERITIES,
  VECTORS,
  fmtTime,
  makeEvent,
  seedEvents,
  type SocEvent,
  type Severity,
} from "./engine";

// ---------------------------------------------------------------------------
// gothacked.guru — Security Operations Center (simulated)
// A mission-control view that reframes India cyber-scam activity as live SOC
// telemetry. Everything is generated in-browser by ./engine — no real logs.
// Design tokens reused from the site: signal/alert/warn/ghost + JetBrains Mono.
// ---------------------------------------------------------------------------

const MAX_FEED = 40;
const MAX_INCIDENTS = 8;

// Approximate, stylised India silhouette (0..100 space; cities share these coords).
const INDIA_PATH =
  "M35,14 L44,18 L48,26 L58,29 L68,33 L73,39 L78,42 L74,48 L67,50 L64,56 L60,61 L55,72 L50,82 L46,92 L42,84 L39,74 L34,64 L29,57 L23,50 L20,45 L26,42 L28,36 L32,30 L30,22 Z";

function Tile({ label, value, sub, color, delay }: { label: string; value: string; sub?: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative rounded-xl border border-line px-4 py-3 overflow-hidden"
      style={{ background: "rgba(11,15,20,0.9)" }}
    >
      <div className="absolute left-0 top-0 h-full w-[3px]" style={{ background: color, boxShadow: `0 0 14px ${color}` }} />
      <div className="text-[10px] font-mono uppercase tracking-widest text-ghost">{label}</div>
      <div className="text-2xl font-semibold text-white tabular-nums leading-tight mt-1" style={{ textShadow: `0 0 18px ${color}55` }}>
        {value}
      </div>
      {sub && <div className="text-[10.5px] font-mono mt-0.5" style={{ color }}>{sub}</div>}
    </motion.div>
  );
}

function Panel({ title, right, children, className = "" }: { title: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line flex flex-col min-h-0 ${className}`} style={{ background: "rgba(9,12,17,0.9)" }}>
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-line">
        <h2 className="text-[11px] font-mono uppercase tracking-widest text-signal">{title}</h2>
        {right}
      </header>
      <div className="flex-1 min-h-0 p-4">{children}</div>
    </section>
  );
}

function severityDots(counts: Record<Severity, number>, total: number) {
  return SEVERITIES.map((s) => ({ s, pct: total ? (counts[s] / total) * 100 : 0 }));
}

export default function SiemDashboard({
  tabSwitch,
  onExit,
}: {
  tabSwitch?: React.ReactNode;
  onExit?: () => void;
} = {}) {
  const [events, setEvents] = useState<SocEvent[]>(() => seedEvents(MAX_FEED));
  const [clock, setClock] = useState(Date.now());
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1); // events per tick multiplier
  const totalRef = useRef(events.length);

  // Cumulative counters (don't reset as the feed window slides).
  const [cumulative, setCumulative] = useState({ total: events.length, blocked: 0, critical: 0 });

  useEffect(() => {
    const clockId = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(clockId);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      const n = Math.max(1, Math.round(rate * (0.6 + Math.random() * 1.2)));
      setEvents((prev) => {
        const fresh: SocEvent[] = [];
        for (let i = 0; i < n; i++) fresh.push(makeEvent());
        totalRef.current += n;
        const merged = [...fresh, ...prev].slice(0, MAX_FEED);
        setCumulative((c) => ({
          total: c.total + n,
          blocked: c.blocked + fresh.filter((e) => e.status === "blocked").length,
          critical: c.critical + fresh.filter((e) => e.severity === "critical").length,
        }));
        return merged;
      });
    }, 1600);
    return () => clearInterval(id);
  }, [paused, rate]);

  // ---- Derived analytics over the live window ----
  const sevCounts = useMemo(() => {
    const c: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const e of events) c[e.severity]++;
    return c;
  }, [events]);

  const vectorCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of events) m.set(e.vector, (m.get(e.vector) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [events]);

  const cityCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of events) m.set(e.srcCity.name, (m.get(e.srcCity.name) ?? 0) + 1);
    return m;
  }, [events]);

  const incidents = useMemo(
    () => events.filter((e) => e.severity === "critical" || e.severity === "high").slice(0, MAX_INCIDENTS),
    [events]
  );

  // Alert timeline — bucketed counts of the last ~20 pushes by severity band.
  const timeline = useMemo(() => {
    const buckets = 28;
    const arr = Array.from({ length: buckets }, () => ({ crit: 0, other: 0 }));
    events.forEach((e, i) => {
      const b = Math.min(buckets - 1, Math.floor((i / MAX_FEED) * buckets));
      if (e.severity === "critical") arr[b].crit++;
      else arr[b].other++;
    });
    return arr.reverse();
  }, [events]);

  const blockedPct = cumulative.total ? Math.round((cumulative.blocked / cumulative.total) * 100) : 0;
  const activeCrit = sevCounts.critical;
  const threatLevel: { label: string; color: string } =
    activeCrit >= 6 ? { label: "SEVERE", color: "#ff4d5e" } : activeCrit >= 3 ? { label: "ELEVATED", color: "#ffb84d" } : { label: "GUARDED", color: "#3ddc84" };

  const eventsPerMin = Math.round(rate * 37);

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ background: "#05070a" }}>
      {/* Top command bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-line" style={{ background: "rgba(9,12,17,0.95)" }}>
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70" style={{ background: "#3ddc84" }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: "#3ddc84" }} />
          </span>
          <div>
            <div className="font-mono text-sm tracking-widest text-white">
              GOTHACKED<span className="text-signal">·</span>SOC
            </div>
            <div className="text-[10px] text-ghost font-mono -mt-0.5">Threat Operations Center — India · simulated telemetry</div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-[9.5px] font-mono uppercase tracking-widest text-ghost">Threat level</div>
            <div className="font-mono text-sm font-semibold tracking-wider" style={{ color: threatLevel.color, textShadow: `0 0 14px ${threatLevel.color}` }}>
              {threatLevel.label}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9.5px] font-mono uppercase tracking-widest text-ghost">UTC clock</div>
            <div className="font-mono text-sm tabular-nums text-white">{new Date(clock).toLocaleTimeString("en-GB", { hour12: false })}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaused((p) => !p)}
              className="text-[11px] font-mono border border-line rounded-md px-3 py-1.5 text-ghost hover:text-white hover:border-signal/50 transition-colors"
            >
              {paused ? "▶ Resume" : "❚❚ Freeze"}
            </button>
            <div className="flex items-center gap-1 border border-line rounded-md px-2 py-1">
              <span className="text-[10px] font-mono text-ghost">RATE</span>
              {[1, 2, 4].map((r) => (
                <button
                  key={r}
                  onClick={() => setRate(r)}
                  className={`text-[10px] font-mono px-1.5 rounded ${rate === r ? "text-signal" : "text-ghost"}`}
                >
                  {r}×
                </button>
              ))}
            </div>
            {tabSwitch}
            {onExit ? (
              <button onClick={onExit} className="text-[11px] font-mono text-ghost hover:text-white transition-colors ml-1">
                exit ↩
              </button>
            ) : (
              <a href="/" className="text-[11px] font-mono text-ghost hover:text-white transition-colors ml-1">exit ↩</a>
            )}
          </div>
        </div>
      </header>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 px-5 pt-4">
        <Tile label="Events / min" value={String(eventsPerMin)} sub="ingest rate" color="#3ddc84" delay={0.02} />
        <Tile label="Total processed" value={cumulative.total.toLocaleString()} sub="this session" color="#6ea8fe" delay={0.06} />
        <Tile label="Active criticals" value={String(activeCrit)} sub="in live window" color="#ff4d5e" delay={0.1} />
        <Tile label="Auto-blocked" value={`${blockedPct}%`} sub="of all events" color="#3ddc84" delay={0.14} />
        <Tile label="Open incidents" value={String(incidents.length)} sub="need triage" color="#ffb84d" delay={0.18} />
        <Tile label="Source hotspots" value={String(cityCounts.size)} sub="cities active" color="#e879f9" delay={0.22} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 px-5 py-4 flex-1 min-h-0">
        {/* Live event stream */}
        <Panel
          title="Live event stream"
          className="xl:col-span-4 h-[420px] xl:h-auto"
          right={<span className="text-[10px] font-mono text-ghost">{paused ? "frozen" : "streaming"}</span>}
        >
          <div className="h-full overflow-hidden font-mono text-[11px] leading-relaxed">
            <AnimatePresence initial={false}>
              {events.slice(0, 22).map((e) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -14, backgroundColor: `${SEV_COLOR[e.severity]}22` }}
                  animate={{ opacity: 1, x: 0, backgroundColor: "rgba(0,0,0,0)" }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2 py-[3px] border-b border-line/40"
                >
                  <span className="text-ghost tabular-nums">{fmtTime(e.ts).slice(0, 12)}</span>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: SEV_COLOR[e.severity], boxShadow: `0 0 6px ${SEV_COLOR[e.severity]}` }} />
                  <span className="text-white truncate">{e.vector}</span>
                  <span className="text-ghost truncate hidden sm:inline">· {e.signature}</span>
                  <span className="ml-auto text-ghost shrink-0">{e.srcCity.name}</span>
                  <span
                    className="shrink-0 uppercase text-[9px] px-1 rounded"
                    style={{ color: e.status === "blocked" ? "#3ddc84" : e.status === "investigating" ? "#ff4d5e" : "#ffb84d" }}
                  >
                    {e.status === "blocked" ? "blk" : e.status === "investigating" ? "inv" : "det"}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Panel>

        {/* Geo threat map */}
        <Panel title="Geo threat map — India" className="xl:col-span-5 h-[420px] xl:h-auto" right={<span className="text-[10px] font-mono text-ghost">origin of activity</span>}>
          <div className="relative h-full w-full flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-full max-h-[340px]" style={{ filter: "drop-shadow(0 0 20px rgba(61,220,132,0.12))" }}>
              <defs>
                <radialGradient id="soc-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(61,220,132,0.25)" />
                  <stop offset="100%" stopColor="rgba(61,220,132,0)" />
                </radialGradient>
              </defs>

              {/* faint reference grid */}
              {Array.from({ length: 11 }).map((_, i) => (
                <g key={i} stroke="rgba(120,150,170,0.06)" strokeWidth={0.2}>
                  <line x1={i * 10} y1={0} x2={i * 10} y2={100} />
                  <line x1={0} y1={i * 10} x2={100} y2={i * 10} />
                </g>
              ))}

              <path d={INDIA_PATH} fill="rgba(61,220,132,0.05)" stroke="rgba(61,220,132,0.4)" strokeWidth={0.5} strokeLinejoin="round" />

              {/* SOC core node (Bengaluru-ish) */}
              <circle cx={40} cy={78} r={2.4} fill="url(#soc-glow)" />
              <circle cx={40} cy={78} r={1} fill="#3ddc84" />

              {/* attack arcs from active cities to the SOC core */}
              {CITIES.filter((c) => (cityCounts.get(c.name) ?? 0) > 0).map((c) => {
                const mx = (c.x + 40) / 2 + (c.y - 78) * 0.18;
                const my = (c.y + 78) / 2 - Math.abs(c.x - 40) * 0.22;
                const count = cityCounts.get(c.name) ?? 0;
                const hot = count >= 3;
                return (
                  <g key={c.name}>
                    <path
                      d={`M${c.x},${c.y} Q${mx},${my} 40,78`}
                      fill="none"
                      stroke={hot ? "#ff4d5e" : "#6ea8fe"}
                      strokeWidth={0.35}
                      strokeOpacity={0.5}
                      strokeDasharray="1.5 2"
                      className="dash-flow"
                    />
                    <circle cx={c.x} cy={c.y} r={0.9 + Math.min(count, 6) * 0.28} fill={hot ? "#ff4d5e" : "#6ea8fe"}>
                      <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={c.x} cy={c.y} r={2.4} fill="none" stroke={hot ? "#ff4d5e" : "#6ea8fe"} strokeWidth={0.25} opacity={0.5}>
                      <animate attributeName="r" values="1;4;1" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                    <text x={c.x + 2} y={c.y - 1.4} fontSize={2.1} fill="rgba(230,237,243,0.75)" fontFamily="monospace">
                      {c.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Panel>

        {/* Right column: severity + vectors */}
        <div className="xl:col-span-3 flex flex-col gap-3 min-h-0">
          <Panel title="Severity mix" className="flex-1">
            <div className="flex items-center gap-4">
              <SeverityDonut counts={sevCounts} total={events.length} />
              <div className="flex flex-col gap-1.5 text-[11px] font-mono">
                {severityDots(sevCounts, events.length).map(({ s, pct }) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm" style={{ background: SEV_COLOR[s] }} />
                    <span className="text-white capitalize w-16">{s}</span>
                    <span className="text-ghost tabular-nums">{Math.round(pct)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Top attack vectors" className="flex-1">
            <div className="flex flex-col gap-2">
              {vectorCounts.slice(0, 6).map(([vec, n]) => {
                const max = vectorCounts[0]?.[1] ?? 1;
                const skew = VECTORS.find((v) => v.vector === vec)?.skew ?? "medium";
                return (
                  <div key={vec} className="text-[11px] font-mono">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-white truncate pr-2">{vec}</span>
                      <span className="text-ghost tabular-nums">{n}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        animate={{ width: `${(n / max) * 100}%` }}
                        transition={{ duration: 0.6 }}
                        style={{ background: SEV_COLOR[skew], boxShadow: `0 0 8px ${SEV_COLOR[skew]}80` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>

      {/* Bottom: timeline + incidents */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 px-5 pb-5">
        <Panel title="Alert timeline" className="xl:col-span-4 h-40" right={<span className="text-[10px] font-mono text-ghost">crit ▮ vs other ▯</span>}>
          <div className="h-full flex items-end gap-[3px]">
            {timeline.map((b, i) => {
              const tot = b.crit + b.other;
              const h = Math.max(4, (tot / 6) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col justify-end gap-[1px]" style={{ height: "100%" }}>
                  <div style={{ height: `${(b.crit / Math.max(tot, 1)) * h}%`, background: "#ff4d5e", boxShadow: "0 0 6px #ff4d5e88" }} className="rounded-sm" />
                  <div style={{ height: `${(b.other / Math.max(tot, 1)) * h}%`, background: "rgba(110,168,254,0.6)" }} className="rounded-sm" />
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Open incidents — needs triage" className="xl:col-span-8 h-40" right={<span className="text-[10px] font-mono text-ghost">critical &amp; high severity</span>}>
          <div className="h-full overflow-auto">
            <table className="w-full text-[11px] font-mono">
              <thead className="text-ghost uppercase text-[9.5px] tracking-widest">
                <tr className="text-left">
                  <th className="pb-1.5 font-normal">Sev</th>
                  <th className="pb-1.5 font-normal">Vector</th>
                  <th className="pb-1.5 font-normal hidden sm:table-cell">Technique</th>
                  <th className="pb-1.5 font-normal">Origin</th>
                  <th className="pb-1.5 font-normal hidden md:table-cell">Src IP</th>
                  <th className="pb-1.5 font-normal">MITRE</th>
                  <th className="pb-1.5 font-normal">State</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {incidents.map((e) => (
                    <motion.tr
                      key={e.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-t border-line/40"
                    >
                      <td className="py-1">
                        <span className="uppercase text-[9.5px] px-1.5 py-0.5 rounded" style={{ color: SEV_COLOR[e.severity], background: `${SEV_COLOR[e.severity]}1a` }}>
                          {e.severity.slice(0, 4)}
                        </span>
                      </td>
                      <td className="py-1 text-white">{e.vector}</td>
                      <td className="py-1 text-ghost hidden sm:table-cell">{e.signature}</td>
                      <td className="py-1 text-ghost">{e.srcCity.name}</td>
                      <td className="py-1 text-ghost hidden md:table-cell tabular-nums">{e.srcIp}</td>
                      <td className="py-1 text-ghost">{e.mitre}</td>
                      <td className="py-1" style={{ color: e.status === "blocked" ? "#3ddc84" : e.status === "investigating" ? "#ff4d5e" : "#ffb84d" }}>
                        {e.status}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <footer className="text-center text-[10px] text-ghost/60 font-mono pb-4">
        Simulated SOC — all events are synthetic, generated in your browser. No real logs, IPs, or persons. gothacked.guru
      </footer>
    </div>
  );
}

function SeverityDonut({ counts, total }: { counts: Record<Severity, number>; total: number }) {
  const R = 30;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const segs = SEVERITIES.map((s) => {
    const frac = total ? counts[s] / total : 0;
    const seg = { s, dash: frac * C, offset };
    offset += frac * C;
    return seg;
  });
  return (
    <svg viewBox="0 0 80 80" className="w-24 h-24 shrink-0 -rotate-90">
      <circle cx={40} cy={40} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={9} />
      {segs.map((seg) => (
        <circle
          key={seg.s}
          cx={40}
          cy={40}
          r={R}
          fill="none"
          stroke={SEV_COLOR[seg.s]}
          strokeWidth={9}
          strokeDasharray={`${seg.dash} ${C - seg.dash}`}
          strokeDashoffset={-seg.offset}
          style={{ filter: `drop-shadow(0 0 4px ${SEV_COLOR[seg.s]}90)`, transition: "stroke-dasharray 0.6s, stroke-dashoffset 0.6s" }}
        />
      ))}
      <text x={40} y={40} textAnchor="middle" dominantBaseline="central" className="rotate-90" fontSize={12} fill="#e6edf3" fontFamily="monospace" transform="rotate(90 40 40)">
        {total}
      </text>
    </svg>
  );
}
