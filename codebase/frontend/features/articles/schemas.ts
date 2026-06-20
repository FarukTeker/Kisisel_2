import { z } from "zod";

export const enrichmentStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "ENRICHED",
  "FAILED",
]);
export type EnrichmentStatus = z.infer<typeof enrichmentStatusSchema>;

/** One article as served by the backend (AI fields generated once, shared). */
export const articleSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  aiSummary: z.string().nullable(),
  aiHeadings: z.array(z.string()),
  aiFull: z.string().nullable(),
  fullContent: z.string(),
  author: z.string(),
  date: z.string(),
  category: z.string(),
  publisher: z.string(),
  sourceUrl: z.string(),
  sourceId: z.string(),
  imageUrl: z.string().nullable(),
  enrichmentStatus: enrichmentStatusSchema,
  score: z.number().optional(),
});
export type Article = z.infer<typeof articleSchema>;

export const rssSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  category: z.string(),
  language: z.string(),
});
export type RssSource = z.infer<typeof rssSourceSchema>;

// ---- Response envelopes ----

export const sourcesResponseSchema = z.object({
  sources: z.array(rssSourceSchema),
});

export const articleListResponseSchema = z.object({
  articles: z.array(articleSchema),
  source: rssSourceSchema.optional(),
  total: z.number().optional(),
});

export const articleCollectionSchema = z.object({
  articles: z.array(articleSchema),
  total: z.number(),
});
