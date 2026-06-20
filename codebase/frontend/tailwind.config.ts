import type { Config } from "tailwindcss";

/**
 * Single source of truth for the Kişisel design tokens. Loaded by app/globals.css
 * via `@config "../tailwind.config.ts"`. Semantic colors reference CSS variables
 * defined per `[data-theme]` in globals.css, so `bg-surface`/`text-ink`/… react to
 * the active theme (Light/Dark/Sepia) at runtime.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-reactive (CSS-var backed)
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        ink: "var(--foreground)",
        "ink-soft": "var(--text-soft)",
        muted: "var(--text-muted)",
        brand: "var(--primary)",
        "brand-hover": "var(--primary-hover)",
        line: "var(--border)",
        // Reading-mode accents (Scan / Skim / Full) — constant across themes
        scan: "#2647d6",
        skim: "#7c3aed",
        full: "#059669",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      borderRadius: {
        card: "20px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 16px 30px rgba(17,24,39,0.08)",
        lift: "0 22px 50px rgba(17,24,39,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
