import { motion } from "framer-motion";

export default function Header() {
  const quickExit = () => {
    window.location.replace("https://www.google.com");
  };

  return (
    <header className="flex items-center justify-between gap-4 px-4 sm:px-8 py-5">
      <div style={{ perspective: 600 }}>
        <motion.div
          className="font-mono text-lg sm:text-xl font-bold text-white inline-block cursor-default"
          style={{ transformStyle: "preserve-3d" }}
          whileHover={{ rotateX: -12, rotateY: 12, scale: 1.04 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
        >
          gothacked
          <span className="text-signal" style={{ textShadow: "0 0 12px rgba(61,220,132,0.6)" }}>
            .guru
          </span>
        </motion.div>
        <p className="text-xs text-ghost mt-0.5">
          Figure out what happened. Know exactly what to do next.
        </p>
      </div>
      <button
        onClick={quickExit}
        className="text-xs font-mono border border-line rounded-full px-3 py-2 text-ghost hover:border-alert hover:text-alert transition-colors shrink-0"
        title="Instantly leave this site"
      >
        Quick exit ↗
      </button>
    </header>
  );
}
