/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05070a",
        panel: "#0b0f14",
        line: "#1c2530",
        signal: "#3ddc84",
        alert: "#ff4d5e",
        warn: "#ffb84d",
        ghost: "#7d8a9a",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        node: "0 0 0 1px rgba(61,220,132,0.25), 0 0 24px rgba(61,220,132,0.12)",
      },
    },
  },
  plugins: [],
};
