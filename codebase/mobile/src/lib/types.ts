import { z } from 'zod';

/**
 * Mirror of the backend response shapes. Keep in sync with:
 *  - backend/src/articles/dto/article-response.dto.ts
 *  - backend/src/newspapers/dto/widget.dto.ts + prisma/schema.prisma
 */

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
  enrichmentStatus: z.string(),
  score: z.number().optional(),
});
export type Article = z.infer<typeof articleSchema>;

export const sourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().optional(),
  category: z.string().optional(),
  language: z.string().optional(),
});
export type Source = z.infer<typeof sourceSchema>;

export const widgetSchema = z.object({
  id: z.string(),
  title: z.string(),
  layoutType: z.string(),
  kind: z.string(),
  publisherId: z.string().nullable().optional(),
  editorialBody: z.string().nullable().optional(),
  categoryFilter: z.string().nullable().optional(),
  layoutY: z.number().optional(),
  layoutH: z.number().optional(),
});
export type Widget = z.infer<typeof widgetSchema>;

/** Summary card shown on the Discover list. */
export const discoverItemSchema = z.object({
  slug: z.string(),
  name: z.string(),
  curator: z.string().nullable().optional(),
  widgetCount: z.number(),
  widgets: z.array(z.object({ kind: z.string(), layoutType: z.string() })),
});
export type DiscoverItem = z.infer<typeof discoverItemSchema>;

/** Full shared newspaper returned by /newspapers/shared/:slug. */
export const sharedNewspaperSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  theme: z.string().nullable().optional(),
  font: z.string().nullable().optional(),
  widgets: z.array(widgetSchema),
  curator: z.object({ name: z.string().nullable() }).nullable().optional(),
});
export type SharedNewspaper = z.infer<typeof sharedNewspaperSchema>;

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});
export type AuthUser = z.infer<typeof authUserSchema>;
