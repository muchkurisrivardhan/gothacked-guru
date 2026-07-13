import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

// Visual theme, editable live from the admin portal (/?admin → Theme panel).
export interface SiteTheme {
  hue: number; // primary hue (grid + glow A)
  accentHue: number; // secondary hue (glow B)
  intensity: number; // 0.2..3 multiplier on layer opacity
  gridVisible: boolean;
}

export const DEFAULT_THEME: SiteTheme = { hue: 145, accentHue: 215, intensity: 1, gridVisible: true };

const a = (alpha: number, intensity: number) => Math.min(0.35, alpha * intensity);

// Mouse-driven 3D parallax: each layer shifts at a different depth so the scene
// feels like it has physical distance. Kept subtle and disabled under
// prefers-reduced-motion (ponytail: victim-facing tool — motion must never disorient).
export default function AmbientBackground() {
  const reduce = useReducedMotion();
  const [theme, setTheme] = useState<SiteTheme>(DEFAULT_THEME);

  useEffect(() => {
    fetch("/api/theme")
      .then((r) => (r.ok ? r.json() : null))
      .then((t) => t && setTheme({ ...DEFAULT_THEME, ...t }))
      .catch(() => {});
  }, []);

  const mx = useMotionValue(0); // -1..1
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 22, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 40, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    // Touch devices never fire mousemove, so drive the same parallax from scroll
    // position — one full page of scroll sweeps the depth from top to bottom.
    // ponytail: reuse my/sy so the layers already wired to it just work.
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      my.set(max > 0 ? (window.scrollY / max - 0.5) * 2 : 0);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduce, mx, my]);

  // Nearest layer (grid) moves least; glows are "further" and swing more — that
  // depth difference is what reads as parallax. Signs alternate for a 3D swivel.
  const gridX = useTransform(sx, [-1, 1], [10, -10]);
  const gridY = useTransform(sy, [-1, 1], [10, -10]);
  const glowAX = useTransform(sx, [-1, 1], [-30, 30]);
  const glowAY = useTransform(sy, [-1, 1], [-24, 24]);
  const glowBX = useTransform(sx, [-1, 1], [28, -28]);
  const glowBY = useTransform(sy, [-1, 1], [22, -22]);
  const tiltX = useTransform(sy, [-1, 1], [2.5, -2.5]); // deg
  const tiltY = useTransform(sx, [-1, 1], [-2.5, 2.5]); // deg

  return (
    <motion.div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ perspective: 900, rotateX: reduce ? 0 : tiltX, rotateY: reduce ? 0 : tiltY }}
    >
      {theme.gridVisible && (
        <motion.div style={{ x: reduce ? 0 : gridX, y: reduce ? 0 : gridY }}>
          <div
            className="grid-drift absolute -inset-[140px]"
            style={{
              backgroundImage: `linear-gradient(hsla(${theme.hue},35%,55%,${a(0.055, theme.intensity)}) 1px, transparent 1px), linear-gradient(90deg, hsla(${theme.hue},35%,55%,${a(0.055, theme.intensity)}) 1px, transparent 1px)`,
              backgroundSize: "46px 46px",
              animation: "gridDrift 92s linear infinite",
              willChange: "transform",
            }}
          />
        </motion.div>
      )}

      <motion.div style={{ x: reduce ? 0 : glowAX, y: reduce ? 0 : glowAY }}>
        <div
          className="glow-a absolute -top-[15%] -left-[8%] w-[55%] h-[70%]"
          style={{
            background: `radial-gradient(circle, hsla(${theme.hue},70%,55%,${a(0.055, theme.intensity)}), transparent 68%)`,
            filter: "blur(24px)",
            animation: "glowA 66s ease-in-out infinite",
            willChange: "transform",
          }}
        />
      </motion.div>

      <motion.div style={{ x: reduce ? 0 : glowBX, y: reduce ? 0 : glowBY }}>
        <div
          className="glow-b absolute -bottom-[18%] -right-[8%] w-[58%] h-[72%]"
          style={{
            background: `radial-gradient(circle, hsla(${theme.accentHue},88%,71%,${a(0.05, theme.intensity)}), transparent 68%)`,
            filter: "blur(26px)",
            animation: "glowB 78s ease-in-out infinite",
            willChange: "transform",
          }}
        />
      </motion.div>

      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 80% at 50% -10%, transparent 55%, rgba(5,7,10,0.65) 100%)" }}
      />
    </motion.div>
  );
}
