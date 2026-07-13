import { useEffect } from "react";

export function useViewCount(scamId: string | null) {
  useEffect(() => {
    if (!scamId) return;
    fetch(`/api/view/${encodeURIComponent(scamId)}`, { method: "POST" }).catch(() => {
      // Analytics is best-effort only — never block or break the UI if it fails.
    });
  }, [scamId]);
}
