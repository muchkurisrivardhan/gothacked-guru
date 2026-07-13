import { useEffect, useRef } from "react";

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface Props {
  slot: string;
  format?: string;
  /** Reserved height so the layout doesn't shift when the ad fills in (avoids CLS). */
  minHeight?: number;
  className?: string;
}

// Google AdSense slot. Set VITE_ADSENSE_CLIENT (and pass a real data-ad-slot id)
// to serve live ads; without it, a labelled reserved placeholder renders so the
// layout is already correct. The script itself is loaded once in main.tsx.
export default function AdSlot({ slot, format = "auto", minHeight = 120, className = "" }: Props) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle script not ready yet — it will pick this slot up on its own.
    }
  }, []);

  return (
    <aside aria-label="Advertisement" className={`mx-auto w-full max-w-3xl ${className}`}>
      <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-ghost/40 text-center mb-1">
        Advertisement
      </div>
      {CLIENT ? (
        <ins
          className="adsbygoogle block"
          style={{ display: "block", minHeight }}
          data-ad-client={CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-xl border border-dashed border-line/70 text-ghost/30 text-[11px] font-mono"
          style={{ minHeight }}
        >
          Ad space · set VITE_ADSENSE_CLIENT
        </div>
      )}
    </aside>
  );
}
