"use client";

import { useSettingsStore } from "@/features/settings/store";
import { translate, type TranslationKey } from "./dictionary";

/**
 * Returns a `t(key)` translator bound to the currently selected language.
 * Usage: `const t = useT(); t("nav.discover")`.
 */
export function useT() {
  const language = useSettingsStore((s) => s.language);
  return (key: TranslationKey): string => translate(key, language);
}
