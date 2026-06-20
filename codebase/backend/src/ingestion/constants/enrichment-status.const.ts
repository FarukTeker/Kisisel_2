export const EnrichmentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  ENRICHED: 'ENRICHED',
  FAILED: 'FAILED',
} as const;

export type EnrichmentStatus =
  (typeof EnrichmentStatus)[keyof typeof EnrichmentStatus];

/** After this many failed attempts an article is marked FAILED (terminal). */
export const MAX_ENRICH_RETRIES = 4;
