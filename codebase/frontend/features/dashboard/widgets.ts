export type WidgetKind = "news" | "popular" | "random" | "editorial";

/** A widget on the dashboard. `width`/`height` are react-bento grid spans. */
export interface WidgetConfig {
  id: string;
  title: string;
  kind: WidgetKind;
  sourceId?: string;
  editorialBody?: string;
  width: number;
  height: number;
}

/** Default front page (ported from the legacy prototype), sized for a 4-col bento grid. */
export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "tech-today", title: "Tech Today", kind: "news", sourceId: "bbc-tech", width: 2, height: 4 },
  { id: "popular", title: "Popular Picks", kind: "popular", width: 2, height: 2 },
  { id: "science", title: "Science Brief", kind: "news", sourceId: "bbc-science", width: 2, height: 2 },
  { id: "guardian", title: "Guardian Tech", kind: "news", sourceId: "the-guardian-tech", width: 1, height: 3 },
  { id: "nasa", title: "NASA Feature", kind: "news", sourceId: "nasa", width: 1, height: 3 },
  { id: "random", title: "Serendipity", kind: "random", width: 2, height: 2 },
];
