import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "Light" | "Dark" | "Sepia";

export const THEMES: Theme[] = ["Light", "Dark", "Sepia"];

/** Font label → the CSS variable stack defined in globals.css. */
export const FONT_OPTIONS: { label: string; varStack: string }[] = [
  { label: "Sans-Serif (Modern Clean)", varStack: "var(--font-sans-stack)" },
  { label: "Serif (Playfair)", varStack: "var(--font-serif-stack)" },
  { label: "Serif (Lora)", varStack: "var(--font-lora-stack)" },
  { label: "Modern (Outfit)", varStack: "var(--font-outfit-stack)" },
  { label: "Mono (Tech/Code)", varStack: "var(--font-mono-stack)" },
];

interface SettingsState {
  theme: Theme;
  font: string;
  setTheme: (theme: Theme) => void;
  setFont: (font: string) => void;
  /** Apply current values to the DOM (call on mount + after hydration from backend). */
  apply: () => void;
}

function applyToDom(theme: Theme, font: string) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  const stack =
    FONT_OPTIONS.find((f) => f.label === font)?.varStack ??
    "var(--font-sans-stack)";
  document.body.style.setProperty("--app-font", stack);
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: "Light",
      font: "Sans-Serif (Modern Clean)",
      setTheme: (theme) => {
        set({ theme });
        applyToDom(theme, get().font);
      },
      setFont: (font) => {
        set({ font });
        applyToDom(get().theme, font);
      },
      apply: () => applyToDom(get().theme, get().font),
    }),
    { name: "kisisel-settings" },
  ),
);
