import { useEffect, useState } from "react";
import { getNodeById } from "../data/scams";

interface StatRow {
  id: string;
  count: number;
}

export default function AdminStats() {
  const [rows, setRows] = useState<StatRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setRows)
      .catch(() => setError("Could not reach the stats API — is the local server running (npm run api)?"));
  }, []);

  return (
    <div className="min-h-full px-6 py-10 max-w-2xl mx-auto">
      <h1 className="text-lg font-mono text-signal mb-1">gothacked.guru — view stats</h1>
      <p className="text-xs text-ghost mb-6">
        Aggregate, anonymous page-view counts only. No IPs, no cookies, no per-visitor data is stored.
        This page has no authentication — remove or protect it before deploying publicly.
      </p>

      {error && <p className="text-alert text-sm">{error}</p>}

      {rows && (
        <div className="space-y-2">
          {rows
            .sort((a, b) => b.count - a.count)
            .map((row) => {
              const node = getNodeById(row.id);
              return (
                <div
                  key={row.id}
                  className="flex items-center justify-between border border-line rounded-lg px-4 py-2.5"
                >
                  <span className="text-sm text-gray-200">{node?.title ?? row.id}</span>
                  <span className="font-mono text-signal text-sm">{row.count}</span>
                </div>
              );
            })}
          {rows.length === 0 && <p className="text-ghost text-sm">No views recorded yet.</p>}
        </div>
      )}
    </div>
  );
}
