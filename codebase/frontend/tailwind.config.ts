import type { Config } from "tailwindcss";

/**
 * Single source of truth for the Kişisel color palette and design tokens.
 * Loaded by app/globals.css via `@config "../tailwind.config.ts"`.
 * Use semantic class names (bg-paper, text-ink, bg-brand, …) across the app.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    // react-bento emits col-span/row-span utility classes from its dist bundle.
    "./node_modules/react-bento/dist/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        // Warm paper background tones
        paper: "#f3eee6",
        "paper-soft": "#f9f5ee",
        "paper-deep": "#efe6d8",
        surface: "#fffdf8",
        "surface-hover": "#f8f3eb",
        // Ink / text
        ink: "#171717",
        "ink-soft": "#5f5b54",
        muted: "#6a665f",
        // Brand / accents
        brand: "#2647d6",
        "brand-hover": "#1d37a4",
        accent: "#315efb",
        // Borders
        line: "rgba(23,23,23,0.12)",
        // Reading-mode accents (Scan / Skim / Full)
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
