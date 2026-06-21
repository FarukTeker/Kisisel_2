import { z } from "zod";

export const readingModeSchema = z.enum(["S", "H", "F"]);

/** A widget row as stored/returned by the backend (geometry inline). */
export const widgetRowSchema = z.object({
  id: z.string(),
  title: z.string(),
  layoutType: z.string(),
  kind: z.string(),
  publisherId: z.string().nullable().optional(),
  editorialBody: z.string().nullable().optional(),
  categoryFilter: z.string().nullable().optional(),
  layoutX: z.number(),
  layoutY: z.number(),
  layoutW: z.number(),
  layoutH: z.number(),
  layoutMinW: z.number(),
  layoutMinH: z.number(),
});

export const newspaperSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  readingMode: readingModeSchema,
  columns: z.number(),
  theme: z.string(),
  font: z.string(),
  curatorId: z.string(),
  widgets: z.array(widgetRowSchema),
  curator: z.object({ name: z.string() }).optional(),
});

export const dashboardResponseSchema = z.object({ newspaper: newspaperSchema });
export const sharedResponseSchema = z.object({ newspaper: newspaperSchema });
export const shareResponseSchema = z.object({ slug: z.string() });

/** Lightweight metadata for the Discover listing. */
export const discoverNewspaperSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  curator: z.string(),
  curatorId: z.string(),
  readingMode: readingModeSchema,
  widgetCount: z.number(),
  widgets: z.array(z.object({ kind: z.string(), layoutType: z.string() })),
});
export const discoverResponseSchema = z.object({
  newspapers: z.array(discoverNewspaperSchema),
});
export type DiscoverNewspaper = z.infer<typeof discoverNewspaperSchema>;

export type WidgetRow = z.infer<typeof widgetRowSchema>;
export type Newspaper = z.infer<typeof newspaperSchema>;
