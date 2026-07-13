import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

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
