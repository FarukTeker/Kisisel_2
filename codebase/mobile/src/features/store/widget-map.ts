import type { FeedWidget, WidgetKind, WidgetSize } from '@/features/store/types';

/**
 * FeedWidget (mobile model) <-> backend WidgetDto. The backend stores `kind`
 * verbatim and react-grid-layout geometry; we encode the mobile `size`/`order`
 * into layoutH/layoutY so a saved dashboard round-trips.
 */

const SIZE_TO_H: Record<WidgetSize, number> = { compact: 4, regular: 8, large: 12 };

function hToSize(h: number): WidgetSize {
  if (h <= 5) return 'compact';
  if (h <= 9) return 'regular';
  return 'large';
}

function kindToLayoutType(kind: WidgetKind): string {
  if (kind === 'editorial') return 'editorial';
  if (kind === 'popular' || kind === 'random') return 'discovery';
  return 'card1';
}

export interface BackendWidget {
  id: string;
  title: string;
  layoutType: string;
  kind: string;
  publisherId?: string | null;
  editorialBody?: string | null;
  categoryFilter?: string | null;
  layoutY?: number;
  layoutH?: number;
}

export function toBackendWidget(w: FeedWidget): Record<string, unknown> {
  return {
    id: w.id,
    title: w.title || 'Untitled',
    layoutType: kindToLayoutType(w.kind),
    kind: w.kind,
    publisherId: w.kind === 'news' ? (w.sourceId ?? null) : null,
    editorialBody: w.kind === 'editorial' ? (w.editorialBody ?? '') : null,
    categoryFilter: w.categoryFilter ?? null,
    layoutX: 0,
    layoutY: w.order,
    layoutW: 4,
    layoutH: SIZE_TO_H[w.size],
    layoutMinW: 1,
    layoutMinH: 1,
  };
}

export function fromBackendWidget(w: BackendWidget, index: number): FeedWidget {
  const kind = (['news', 'editorial', 'popular', 'random'] as const).includes(w.kind as WidgetKind)
    ? (w.kind as WidgetKind)
    : 'news';
  return {
    id: w.id,
    title: w.title,
    kind,
    sourceId: w.publisherId ?? undefined,
    categoryFilter: w.categoryFilter ?? undefined,
    editorialBody: w.editorialBody ?? undefined,
    size: hToSize(w.layoutH ?? 8),
    order: w.layoutY ?? index,
  };
}
