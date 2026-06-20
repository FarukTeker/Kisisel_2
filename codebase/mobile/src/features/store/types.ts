/** Domain model — ported from the archive's Models.swift, adapted for the hybrid app. */

export type ReadingMode = 'S' | 'H' | 'F'; // Scan | Skim(H) | Full

export const READING_MODES: { value: ReadingMode; label: string; detail: string; icon: string }[] = [
  { value: 'S', label: 'Scan', detail: 'Headlines only — fastest pass', icon: 'list-outline' },
  { value: 'H', label: 'Skim', detail: 'Short summaries with metadata', icon: 'reorder-four-outline' },
  { value: 'F', label: 'Full read', detail: 'One story at a time, in depth', icon: 'document-text-outline' },
];

export type WidgetKind = 'news' | 'editorial' | 'popular' | 'random';
export type WidgetSize = 'compact' | 'regular' | 'large';

export const WIDGET_SIZES: { value: WidgetSize; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'regular', label: 'Regular' },
  { value: 'large', label: 'Large' },
];

export interface FeedWidget {
  id: string;
  title: string;
  kind: WidgetKind;
  sourceId?: string;
  categoryFilter?: string;
  size: WidgetSize;
  editorialBody?: string;
  order: number;
}

export interface MyNewspaper {
  id: string;
  name: string;
  description: string;
  readingMode: ReadingMode;
  widgets: FeedWidget[];
}

export const WIDGET_KIND_META: Record<
  WidgetKind,
  { label: string; description: string; icon: string }
> = {
  news: {
    label: 'Source feed',
    description: 'Pulls live articles from a chosen publisher.',
    icon: 'newspaper-outline',
  },
  editorial: {
    label: 'Editorial note',
    description: 'Your own commentary, attributed to you.',
    icon: 'chatbubble-ellipses-outline',
  },
  popular: {
    label: 'Popular picks',
    description: 'Cross-source trending picks, scored automatically.',
    icon: 'flame-outline',
  },
  random: {
    label: 'Random discovery',
    description: 'A shuffled sample to break the filter bubble.',
    icon: 'shuffle-outline',
  },
};

export const CATEGORIES = ['Technology', 'Science', 'Finance', 'Food', 'Culture'];
