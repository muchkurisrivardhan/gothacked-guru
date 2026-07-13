import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Load the AdSense script once, only when a publisher id is configured.
const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;
if (adsenseClient) {
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`;
  document.head.appendChild(s);
}

// Apply admin content overrides (edited scams / newly added scams) before the
// first render so search, tree, and detail panels all see the merged content.
// Best-effort: if the API is down, the site renders the built-in content.
async function boot() {
  try {
    const res = await fetch("/api/content");
    if (res.ok) {
      const { applyOverrides } = await import("./data/scams");
      applyOverrides(await res.json());
    }
  } catch {
    /* offline / static hosting — built-in content only */
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

boot();
