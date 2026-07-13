import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { motion } from "framer-motion";
import { getAllLeaves } from "../data/scams";

interface Props {
  onSelect: (id: string) => void;
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const entries = useMemo(
    () =>
      getAllLeaves()
        .filter((e) => !e.node.comingSoon)
        .map((e) => ({
          id: e.node.id,
          title: e.node.title,
          summary: e.node.summary,
          keywords: e.node.keywords ?? [],
          categoryLabel: e.path[e.path.length - 2]?.shortLabel ?? "",
        })),
    []
  );

  const fuse = useMemo(
    () =>
      new Fuse(entries, {
        keys: [
          { name: "title", weight: 0.5 },
          { name: "keywords", weight: 0.35 },
          { name: "summary", weight: 0.15 },
        ],
        threshold: 0.38,
        ignoreLocation: true,
      }),
    [entries]
  );

  // Fuse's whole-string fuzzy match struggles with natural, multi-word phrases
  // ("loan app threatening me"), so match per-word instead and rank by how
  // many words hit — far more forgiving for how people actually describe a scam.
  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const words = trimmed.split(/\s+/).filter((w) => w.length >= 3);
    if (words.length === 0) return [];

    const scoreById = new Map<string, { item: (typeof entries)[number]; hits: number; best: number }>();
    for (const word of words) {
      for (const r of fuse.search(word)) {
        const existing = scoreById.get(r.item.id);
        const score = r.score ?? 1;
        if (existing) {
          existing.hits += 1;
          existing.best = Math.min(existing.best, score);
        } else {
          scoreById.set(r.item.id, { item: r.item, hits: 1, best: score });
        }
      }
    }

    return Array.from(scoreById.values())
      .sort((a, b) => b.hits - a.hits || a.best - b.best)
      .slice(0, 6)
      .map((v) => ({ item: v.item }));
  }, [query, fuse]);

  // Log searches that found nothing — the clearest signal of scams the site is
  // missing. Debounced so we record the final phrase, not every keystroke.
  // Anonymous: only the query text is sent, never who typed it.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3 || results.length > 0) return;
    const t = setTimeout(() => {
      fetch("/api/miss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      }).catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [query, results]);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Describe what happened…  e.g. 'blackmailed after video call', 'loan app threatening me'"
        className="w-full rounded-full outline-none px-5 py-3.5 text-sm sm:text-base placeholder:text-[#5c6a7a] text-white transition-[border-color,box-shadow] border border-line focus:border-signal focus:shadow-[0_0_0_3px_rgba(61,220,132,0.12),0_0_34px_rgba(61,220,132,0.14)]"
        style={{ background: "rgba(11,15,20,0.72)" }}
      />
      {open && results.length > 0 && (
        <div className="absolute mt-2.5 w-full bg-panel border border-line rounded-2xl overflow-hidden shadow-[0_28px_70px_rgba(0,0,0,0.65)] z-30">
          {results.map((r, i) => (
            <motion.button
              key={r.item.id}
              onMouseDown={() => onSelect(r.item.id)}
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.032 }}
              className="block w-full text-left px-4 py-3 hover:bg-line/40 transition-colors border-b border-line last:border-b-0"
            >
              <div className="text-sm font-medium text-white">{r.item.title}</div>
              <div className="text-xs text-ghost mt-0.5 font-mono tracking-wide">{r.item.categoryLabel}</div>
            </motion.button>
          ))}
        </div>
      )}
      {open && query.trim() && results.length === 0 && (
        <div className="absolute mt-2.5 w-full bg-panel border border-line rounded-2xl px-4 py-3.5 text-sm text-ghost z-30">
          No exact match yet — browse the map below, or describe it in different words.
        </div>
      )}
    </div>
  );
}
