/** Supported content languages. English is the pivot for the current (EN) feeds. */
export type ContentLang = 'en' | 'tr';

/** Capitalized column suffix for a language (e.g. 'en' -> 'En'). */
export function langSuffix(lang: ContentLang): 'En' | 'Tr' {
  return lang === 'tr' ? 'Tr' : 'En';
}

/** The language to translate INTO, given the source language. */
export function otherLang(lang: ContentLang): ContentLang {
  return lang === 'tr' ? 'en' : 'tr';
}

/** Human-readable language name for translation prompts. */
export function langName(lang: ContentLang): string {
  return lang === 'tr' ? 'Turkish' : 'English';
}

/** Payload flowing through the enrichment pipeline (one pending article). */
export interface EnrichmentJob {
  articleId: string;
  title: string;
  fullContent: string;
  category: string;
  publisherName: string;
  /** Source language of the article (from its publisher). */
  language: ContentLang;
}
