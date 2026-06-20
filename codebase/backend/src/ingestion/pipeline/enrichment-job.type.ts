/** Payload flowing through the enrichment pipeline (one pending article). */
export interface EnrichmentJob {
  articleId: string;
  title: string;
  fullContent: string;
  category: string;
  publisherName: string;
}
