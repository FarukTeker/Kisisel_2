export type WidgetKind = "news" | "editorial" | "popular" | "random";
export type WidgetLayoutType =
  | "card1"
  | "card2"
  | "card3"
  | "card4"
  | "card5"
  | "card6"
  | "editorial"
  | "discovery";

/** Content/config of a widget (geometry lives separately in `LayoutItem`). */
export interface WidgetConfig {
  id: string;
  title: string;
  kind: WidgetKind;
  layoutType: WidgetLayoutType;
  publisherId?: string;
  editorialBody?: string;
  categoryFilter?: string;
}

/** react-grid-layout geometry for one widget (keyed by `i === widget.id`). */
export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export const WIDGET_TEMPLATES: {
  id: WidgetLayoutType;
  label: string;
  description: string;
}[] = [
  { id: "card1", label: "Feature", description: "Large story with image and long body." },
  { id: "card2", label: "Wide Brief", description: "Horizontal image and short summary." },
  { id: "card3", label: "Compact", description: "Small image with concise body text." },
  { id: "card4", label: "Text Column", description: "Text-first column for reading." },
  { id: "card5", label: "Visual Story", description: "Title, large image, and body." },
  { id: "card6", label: "Gallery", description: "Wide feature with image strip." },
  { id: "editorial", label: "Editorial", description: "Curator commentary block." },
  { id: "discovery", label: "Discovery", description: "Popular or random high-signal stories." },
];

export const CATEGORIES = [
  "All",
  "Technology",
  "Science",
  "Food",
  "Finance",
  "Culture",
];

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "card1", title: "Tech Today", layoutType: "card1", publisherId: "bbc-tech", kind: "news" },
  { id: "card2", title: "Popular Picks", layoutType: "discovery", kind: "popular" },
  { id: "card3", title: "Science Brief", layoutType: "card3", publisherId: "bbc-science", kind: "news" },
  { id: "card4", title: "Guardian Tech", layoutType: "card4", publisherId: "the-guardian-tech", kind: "news" },
  { id: "card5", title: "Serendipity", layoutType: "discovery", kind: "random" },
  { id: "card6", title: "NASA Feature", layoutType: "card6", publisherId: "nasa", kind: "news" },
];

export const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: "card1", x: 0, y: 0, w: 1, h: 5, minW: 1, minH: 2 },
  { i: "card2", x: 1, y: 0, w: 2, h: 2, minW: 1, minH: 1 },
  { i: "card3", x: 1, y: 2, w: 1, h: 3, minW: 1, minH: 1 },
  { i: "card4", x: 2, y: 2, w: 1, h: 3, minW: 1, minH: 1 },
  { i: "card5", x: 0, y: 5, w: 1, h: 3, minW: 1, minH: 1 },
  { i: "card6", x: 1, y: 5, w: 2, h: 3, minW: 1, minH: 1 },
];

/** Initial geometry for a freshly added widget, placed at the bottom of the grid. */
export function initialLayoutFor(
  id: string,
  layoutType: WidgetLayoutType,
  existing: LayoutItem[],
): LayoutItem {
  const bottomY = existing.reduce((max, it) => Math.max(max, it.y + it.h), 0);
  const isWide = layoutType === "card2" || layoutType === "card6";
  const isTall = layoutType === "card1" || layoutType === "card5";
  const isEditorial = layoutType === "editorial";
  const isDiscovery = layoutType === "discovery";
  return {
    i: id,
    x: 0,
    y: bottomY,
    w: isEditorial || isWide || isDiscovery ? 2 : 1,
    h: isEditorial ? 3 : isDiscovery ? 2 : isTall ? 4 : 3,
    minW: 1,
    minH: 1,
  };
}
