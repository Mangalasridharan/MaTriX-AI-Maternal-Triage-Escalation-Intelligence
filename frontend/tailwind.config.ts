import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Risk badge variants (used dynamically: badge-${risk_level})
    "badge-low", "badge-moderate", "badge-high", "badge-severe",
    // Severity border (used dynamically: severity-${risk_level})
    "severity-low", "severity-moderate", "severity-high", "severity-severe",
    // Glow classes (used dynamically: glow-${color})
    "glow-violet", "glow-green", "glow-red", "glow-amber", "glow-orange",
    // Color combos used in dynamic class strings (e.g. text-violet-400)
    { pattern: /^(text|bg|border)-(violet|cyan|sky|emerald|amber|pink|rose|slate|orange)-(400|500|600)$/ },
    { pattern: /^(bg|border)-(violet|cyan|sky|emerald|amber|pink|rose|slate|orange)-(10|20|30)$/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--bg-base)",
        surface:    "var(--bg-surface)",
        elevated:   "var(--bg-elevated)",
      },
      animation: {
        "spin-slow":  "spin 8s linear infinite",
        "ping-slow":  "ping 2s ease-out infinite",
        "float":      "float 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
