import type { RssSource } from '../rss/rss-source.type';

/** A normalized article produced by NormalizeStage and persisted by PersistStage. */
export interface NormalizedArticle {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  author: string;
  date: string;
  category: string;
  sourceUrl: string;
  sourceId: string;
  imageUrl?: string;
  contentHash: string;
}

/** Payload flowing through the ingestion pipeline (one RSS item). */
export interface IngestionItem {
  source: RssSource;
  rawItem: Record<string, unknown>;
  /** The daily edition (yyyy-mm-dd, Istanbul) this item is being ingested into. */
  editionDate: string;
  article?: NormalizedArticle;
}
