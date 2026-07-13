import { useState } from "react";
import Header from "./components/Header";
import Disclaimer from "./components/Disclaimer";
import SearchBar from "./components/SearchBar";
import TreeGraph, { CATEGORY_COLOR } from "./components/TreeGraph";
import ScamDetailPanel from "./components/ScamDetailPanel";
import AdminPortal from "./components/AdminPortal";
import AmbientBackground from "./components/AmbientBackground";
import AdSlot from "./components/AdSlot";
import { findPathToNode, getNodeById } from "./data/scams";
import type { ScamNode } from "./types";

const LEGEND = [
  { label: "Blackmail / Extortion", color: CATEGORY_COLOR["cat-blackmail"] },
  { label: "Impersonation / Fear", color: CATEGORY_COLOR["cat-impersonation"] },
  { label: "Payment / UPI", color: CATEGORY_COLOR["cat-financial"] },
  { label: "Job / Investment", color: CATEGORY_COLOR["cat-opportunity"] },
  { label: "Romance", color: CATEGORY_COLOR["cat-romance"] },
];

export default function App() {
  const params = new URLSearchParams(window.location.search);
  // Password-protected admin portal. Holds both the analytics dashboard and the
  // SOC monitor as tabs — ?siem just deep-links to the SOC tab after login.
  // Dev-only: the whole portal (and its bundle) is stripped from production builds.
  const isAdmin = import.meta.env.DEV && (params.has("admin") || params.has("siem"));
  const adminView = params.has("siem") ? "siem" : "dashboard";

  const [expanded, setExpanded] = useState<Set<string>>(new Set(["root"]));
  const [selectedLeafId, setSelectedLeafId] = useState<string | null>(null);

  const selectedNode: ScamNode | null = selectedLeafId ? getNodeById(selectedLeafId) : null;

  const handleToggle = (node: ScamNode) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(node.id)) next.delete(node.id);
      else next.add(node.id);
      return next;
    });
  };

  const handleOpenLeaf = (node: ScamNode) => setSelectedLeafId(node.id);

  const handleSearchSelect = (id: string) => {
    const path = findPathToNode(id);
    if (path) {
      setExpanded((prev) => {
        const next = new Set(prev);
        path.forEach((n) => next.add(n.id));
        return next;
      });
    }
    const node = getNodeById(id);
    if (node && !node.children) setSelectedLeafId(id);
  };

  if (isAdmin) return <AdminPortal initialView={adminView} />;

  return (
    <div className="relative min-h-full flex flex-col overflow-x-hidden">
      <AmbientBackground />

      <div className="relative z-[1] flex flex-col flex-1">
        <Header />
        <Disclaimer />

        <main className="flex-1 flex flex-col gap-6 px-4 sm:px-8 pb-16">
          {/* Ad unit 1 of 4 — top leaderboard. Each slot id must be a distinct
              AdSense unit; swap the placeholders once units are created. */}
          <AdSlot slot="0000000001" minHeight={90} />

          <SearchBar onSelect={handleSearchSelect} />

          <div className="flex flex-col items-center gap-4">
            <p className="text-xs text-ghost text-center max-w-md">
              Tap a node to open its branch. Tap a scam's name to get the full step-by-step guide.
            </p>
            <TreeGraph
              expanded={expanded}
              onToggle={handleToggle}
              onOpenLeaf={handleOpenLeaf}
              selectedLeafId={selectedLeafId}
            />
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 font-mono text-[10.5px] text-ghost tracking-wide">
              {LEGEND.map((l) => (
                <span key={l.label} className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: l.color, boxShadow: `0 0 8px ${l.color}80` }}
                  />
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Ad unit 2 of 4 — in-feed, below the tree. */}
          <AdSlot slot="0000000002" className="mt-8" minHeight={140} />

          {/* Ad unit 3 of 4 — footer anchor. */}
          <AdSlot slot="0000000003" className="mt-4" minHeight={250} />
        </main>

        <ScamDetailPanel node={selectedNode} onClose={() => setSelectedLeafId(null)} />

        <footer className="text-center text-[11px] text-ghost/60 py-6">
          gothacked.guru is an independent, non-commercial resource. No accounts. No tracking of individuals.
        </footer>
      </div>
    </div>
  );
}
