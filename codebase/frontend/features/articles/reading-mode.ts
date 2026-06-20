import type { Article } from "./schemas";

/** Scan = summary, Skim/Headline = headings, Full = full read. */
export type ReadingMode = "S" | "H" | "F";

export const READING_MODE_LABEL: Record<ReadingMode, string> = {
  S: "Scan",
  H: "Skim",
  F: "Full read",
};

export interface ReadingContent {
  /** Short text for S/F modes (null in H mode, which uses `headings`). */
  text: string | null;
  /** Bullet points for H mode. */
  headings: string[];
  /** True while AI fields are still being generated. */
  pending: boolean;
}

/**
 * Resolves what to render for a given reading mode straight from the article's
 * pre-generated AI fields — no per-article network call. Falls back to the RSS
 * summary / full content while enrichment is still in progress.
 */
export function readingContent(article: Article, mode: ReadingMode): ReadingContent {
  const pending = article.enrichmentStatus !== "ENRICHED";

  if (mode === "H") {
    return {
      text: null,
      headings:
        article.aiHeadings.length > 0 ? article.aiHeadings : [article.title],
      pending,
    };
  }

  if (mode === "F") {
    return {
      text: article.aiFull ?? article.fullContent ?? article.summary,
      headings: [],
      pending,
    };
  }

  // Scan
  return {
    text: article.aiSummary ?? article.summary,
    headings: [],
    pending,
  };
}
