// ---------------------------------------------------------------------------
// gothacked.guru — SOC / SIEM simulation engine
// A self-contained, in-browser event generator. It reframes the site's real
// domain (India cyber-scams) as security telemetry: each "event" is a scam
// attempt, correlated into "alerts" and "incidents". No backend, no real logs —
// deterministic-ish randomness so the dashboard always feels alive.
// ---------------------------------------------------------------------------

export type Severity = "critical" | "high" | "medium" | "low";

export interface GeoCity {
  name: string;
  x: number; // 0..100 within the map viewBox
  y: number;
}

export interface SocEvent {
  id: number;
  ts: number;
  severity: Severity;
  vector: string; // attack type / scam family
  signature: string; // specific technique
  srcCity: GeoCity;
  srcIp: string;
  status: "detected" | "blocked" | "investigating";
  mitre: string; // faux MITRE-style id
}

export const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

export const SEV_COLOR: Record<Severity, string> = {
  critical: "#ff4d5e",
  high: "#ffb84d",
  medium: "#6ea8fe",
  low: "#3ddc84",
};

export const SEV_WEIGHT: Record<Severity, number> = {
  critical: 0.12,
  high: 0.26,
  medium: 0.34,
  low: 0.28,
};

// Attack vectors mirror the real scam families the site covers.
export const VECTORS: { vector: string; signatures: string[]; skew: Severity }[] = [
  {
    vector: "Sextortion / Blackmail",
    skew: "critical",
    signatures: ["video-call capture", "morphed-photo threat", "screen-record leak", "contact-list scrape"],
  },
  {
    vector: "Digital Arrest",
    skew: "critical",
    signatures: ["fake CBI summons", "courier-parcel scam", "uniform video call", "Aadhaar-misuse claim"],
  },
  {
    vector: "UPI / Payment Fraud",
    skew: "high",
    signatures: ["collect-request trap", "QR reverse-scan", "fake refund", "SIM-swap OTP theft"],
  },
  {
    vector: "Impersonation",
    skew: "high",
    signatures: ["fake bank KYC call", "customer-care spoof", "electricity-bill SMS", "gas-subsidy APK"],
  },
  {
    vector: "Investment / Job Scam",
    skew: "medium",
    signatures: ["task-based crypto", "P2P doubling app", "work-from-home deposit", "trading-group pump"],
  },
  {
    vector: "Romance / Pig-butchering",
    skew: "medium",
    signatures: ["long-con grooming", "customs-gift release fee", "military-officer catfish", "crypto-mentor lure"],
  },
  {
    vector: "Malicious APK",
    skew: "high",
    signatures: ["fake-challan install", "banking-trojan sideload", "wedding-invite APK", "screen-share RAT"],
  },
];

export const CITIES: GeoCity[] = [
  { name: "Delhi", x: 40, y: 30 },
  { name: "Mumbai", x: 26, y: 58 },
  { name: "Bengaluru", x: 40, y: 78 },
  { name: "Hyderabad", x: 44, y: 66 },
  { name: "Chennai", x: 47, y: 82 },
  { name: "Kolkata", x: 66, y: 50 },
  { name: "Pune", x: 29, y: 60 },
  { name: "Ahmedabad", x: 24, y: 46 },
  { name: "Jaipur", x: 34, y: 36 },
  { name: "Lucknow", x: 50, y: 38 },
  { name: "Jamtara", x: 62, y: 47 }, // the (in)famous phishing hub
  { name: "Bharatpur", x: 37, y: 37 },
];

let seq = 1;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function weightedSeverity(skew: Severity): Severity {
  // 45% chance to land on the vector's characteristic severity, else weighted random.
  if (Math.random() < 0.45) return skew;
  const r = Math.random();
  let acc = 0;
  for (const s of SEVERITIES) {
    acc += SEV_WEIGHT[s];
    if (r <= acc) return s;
  }
  return "low";
}

function randIp(): string {
  // Reserved documentation ranges only — never a real routable address.
  const blocks = [203, 45, 117, 192, 106, 14];
  return `${pick(blocks)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

export function makeEvent(now = Date.now()): SocEvent {
  const v = pick(VECTORS);
  const severity = weightedSeverity(v.skew);
  const blocked = Math.random() < (severity === "critical" ? 0.55 : 0.78);
  return {
    id: seq++,
    ts: now,
    severity,
    vector: v.vector,
    signature: pick(v.signatures),
    srcCity: pick(CITIES),
    srcIp: randIp(),
    status: blocked ? "blocked" : severity === "critical" ? "investigating" : "detected",
    mitre: `T${1000 + Math.floor(Math.random() * 600)}`,
  };
}

// Seed a plausible backlog so the dashboard never opens empty.
export function seedEvents(n: number): SocEvent[] {
  const now = Date.now();
  const out: SocEvent[] = [];
  for (let i = 0; i < n; i++) out.push(makeEvent(now - (n - i) * 1400 - Math.random() * 800));
  return out;
}

export const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("en-GB", { hour12: false }) +
  "." +
  String(ts % 1000).padStart(3, "0");
