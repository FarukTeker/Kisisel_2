import type { LayoutItem } from 'react-grid-layout';

export type WidgetLayoutType = 'card1' | 'card2' | 'card3' | 'card4' | 'card5' | 'card6' | 'editorial' | 'discovery';
export type WidgetKind = 'news' | 'editorial' | 'popular' | 'random';

export interface FeedWidget {
  id: string;
  title: string;
  layoutType: WidgetLayoutType;
  publisherId?: string;
  kind: WidgetKind;
  editorialBody?: string;
  categoryFilter?: string;
}

export interface SharedNewspaper {
  slug: string;
  name: string;
  curator: string;
  description: string;
  readingMode: 'S' | 'H' | 'F';
  widgets: FeedWidget[];
  layout: LayoutItem[];
}

export const DEFAULT_WIDGETS: FeedWidget[] = [
  { id: 'card1', title: 'Tech Today', layoutType: 'card1', publisherId: 'bbc-tech', kind: 'news' },
  { id: 'card2', title: 'Popular Picks', layoutType: 'discovery', kind: 'popular' },
  { id: 'card3', title: 'Science Brief', layoutType: 'card3', publisherId: 'bbc-science', kind: 'news' },
  { id: 'card4', title: 'Guardian Tech', layoutType: 'card4', publisherId: 'the-guardian-tech', kind: 'news' },
  { id: 'card5', title: 'Random Discovery', layoutType: 'discovery', kind: 'random' },
  { id: 'card6', title: 'NASA Feature', layoutType: 'card6', publisherId: 'nasa', kind: 'news' },
];

export const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: 'card1', x: 0, y: 0, w: 1, h: 5, minW: 1, minH: 2 },
  { i: 'card2', x: 1, y: 0, w: 2, h: 2, minW: 1, minH: 1 },
  { i: 'card3', x: 1, y: 2, w: 1, h: 3, minW: 1, minH: 1 },
  { i: 'card4', x: 2, y: 2, w: 1, h: 3, minW: 1, minH: 1 },
  { i: 'card5', x: 0, y: 5, w: 1, h: 3, minW: 1, minH: 1 },
  { i: 'card6', x: 1, y: 5, w: 2, h: 3, minW: 1, minH: 1 },
];

export const SHARED_NEWSPAPERS: SharedNewspaper[] = [
  {
    slug: 'share-19d2b8',
    name: 'Morning Signal',
    curator: 'Ece Karaca',
    description: 'A shareable front page that mixes high-signal stories, serendipity, and curator commentary.',
    readingMode: 'S',
    widgets: [
      { id: 'card1', title: 'Tech Lead', layoutType: 'card1', publisherId: 'bbc-tech', kind: 'news' },
      { id: 'card2', title: 'Popular Picks', layoutType: 'discovery', kind: 'popular' },
      { id: 'editorial-1', title: 'Why this matters today', layoutType: 'editorial', kind: 'editorial', editorialBody: 'These stories should be read together: the market optimism, the AI adoption curve, and the governance gaps all point to the same tension between speed and public accountability.' },
      { id: 'card4', title: 'Science Column', layoutType: 'card4', publisherId: 'bbc-science', kind: 'news' },
      { id: 'card5', title: 'Random Discovery', layoutType: 'discovery', kind: 'random' },
      { id: 'card6', title: 'NASA Feature', layoutType: 'card6', publisherId: 'nasa', kind: 'news' },
    ],
    layout: [
      { i: 'card1', x: 0, y: 0, w: 1, h: 5, minW: 1, minH: 2 },
      { i: 'card2', x: 1, y: 0, w: 2, h: 2, minW: 1, minH: 1 },
      { i: 'editorial-1', x: 1, y: 2, w: 2, h: 2, minW: 1, minH: 1 },
      { i: 'card4', x: 0, y: 5, w: 1, h: 3, minW: 1, minH: 1 },
      { i: 'card5', x: 1, y: 4, w: 1, h: 3, minW: 1, minH: 1 },
      { i: 'card6', x: 1, y: 7, w: 2, h: 3, minW: 1, minH: 1 },
    ],
  },
  {
    slug: 'campus-brief',
    name: 'Campus Brief',
    curator: 'Subhan Akbenli',
    description: 'Student-centered curation around campus life, education policy, and public commentary.',
    readingMode: 'H',
    widgets: [
      { id: 'campus-1', title: 'Tech Brief', layoutType: 'card2', publisherId: 'bbc-tech', kind: 'news' },
      { id: 'campus-editorial', title: 'Student lens', layoutType: 'editorial', kind: 'editorial', editorialBody: 'This layout frames national policy through how it changes student housing, tuition pressure, and participation in campus governance.' },
      { id: 'campus-random', title: 'Random Discovery', layoutType: 'discovery', kind: 'random' },
    ],
    layout: [
      { i: 'campus-1', x: 0, y: 0, w: 3, h: 2, minW: 1, minH: 1 },
      { i: 'campus-editorial', x: 0, y: 2, w: 2, h: 2, minW: 1, minH: 1 },
      { i: 'campus-random', x: 2, y: 2, w: 1, h: 2, minW: 1, minH: 1 },
    ],
  },
  {
    slug: 'signal-radar',
    name: 'Signal Radar',
    curator: 'Yasin Sezgin',
    description: 'A compact signal-first newspaper for readers who want fast trend awareness and a clean full-source path.',
    readingMode: 'S',
    widgets: [
      { id: 'radar-pop', title: 'Popular Picks', layoutType: 'discovery', kind: 'popular' },
      { id: 'radar-news', title: 'Science Column', layoutType: 'card4', publisherId: 'bbc-science', kind: 'news' },
      { id: 'radar-news-2', title: 'Guardian Tech', layoutType: 'card3', publisherId: 'the-guardian-tech', kind: 'news' },
    ],
    layout: [
      { i: 'radar-pop', x: 0, y: 0, w: 3, h: 2, minW: 1, minH: 1 },
      { i: 'radar-news', x: 0, y: 2, w: 2, h: 3, minW: 1, minH: 1 },
      { i: 'radar-news-2', x: 2, y: 2, w: 1, h: 3, minW: 1, minH: 1 },
    ],
  },
  {
    slug: 'deep-space',
    name: 'Deep Space',
    curator: 'Alara Yıldız',
    description: 'Science-heavy curation for curious minds — space, climate, and the edge of human knowledge.',
    readingMode: 'F',
    widgets: [
      { id: 'ds-1', title: 'NASA Feature', layoutType: 'card5', publisherId: 'nasa', kind: 'news' },
      { id: 'ds-2', title: 'Science Brief', layoutType: 'card1', publisherId: 'bbc-science', kind: 'news' },
      { id: 'ds-editorial', title: 'Why science matters', layoutType: 'editorial', kind: 'editorial', editorialBody: 'Every story here starts with a question we haven\'t answered yet. Science isn\'t just news — it\'s the slow, cumulative act of refusing to be wrong forever.' },
      { id: 'ds-random', title: 'Serendipity', layoutType: 'discovery', kind: 'random' },
    ],
    layout: [
      { i: 'ds-1', x: 0, y: 0, w: 2, h: 4, minW: 1, minH: 2 },
      { i: 'ds-2', x: 2, y: 0, w: 1, h: 4, minW: 1, minH: 2 },
      { i: 'ds-editorial', x: 0, y: 4, w: 2, h: 2, minW: 1, minH: 1 },
      { i: 'ds-random', x: 2, y: 4, w: 1, h: 2, minW: 1, minH: 1 },
    ],
  },
  {
    slug: 'tech-pulse',
    name: 'Tech Pulse',
    curator: 'Kerem Doğan',
    description: 'Daily briefing on what\'s shipping, what\'s hyped, and what actually matters in technology.',
    readingMode: 'H',
    widgets: [
      { id: 'tp-1', title: 'BBC Tech', layoutType: 'card2', publisherId: 'bbc-tech', kind: 'news' },
      { id: 'tp-2', title: 'Guardian Tech', layoutType: 'card2', publisherId: 'the-guardian-tech', kind: 'news' },
      { id: 'tp-3', title: 'Hacker News', layoutType: 'card4', publisherId: 'hacker-news', kind: 'news' },
      { id: 'tp-pop', title: 'Trending Now', layoutType: 'discovery', kind: 'popular' },
      { id: 'tp-editorial', title: 'The signal vs. the noise', layoutType: 'editorial', kind: 'editorial', editorialBody: 'Treat this as your morning filter. If a story appears in both BBC Tech and The Guardian, it\'s the signal. Everything else is context.' },
    ],
    layout: [
      { i: 'tp-1', x: 0, y: 0, w: 1, h: 3, minW: 1, minH: 1 },
      { i: 'tp-2', x: 1, y: 0, w: 1, h: 3, minW: 1, minH: 1 },
      { i: 'tp-3', x: 2, y: 0, w: 1, h: 3, minW: 1, minH: 1 },
      { i: 'tp-pop', x: 0, y: 3, w: 2, h: 2, minW: 1, minH: 1 },
      { i: 'tp-editorial', x: 2, y: 3, w: 1, h: 2, minW: 1, minH: 1 },
    ],
  },
  {
    slug: 'slow-read',
    name: 'Slow Read',
    curator: 'Melis Şahin',
    description: 'Long-form, thoughtful reading for a Sunday morning. One big story, space to think.',
    readingMode: 'F',
    widgets: [
      { id: 'sr-1', title: 'Cover Story', layoutType: 'card6', publisherId: 'the-guardian-tech', kind: 'news' },
      { id: 'sr-editorial', title: 'Editor\'s note', layoutType: 'editorial', kind: 'editorial', editorialBody: 'I chose the Guardian today because long-form journalism is becoming a luxury. This layout gives each piece the space it deserves — no summaries, no shortcuts.' },
      { id: 'sr-2', title: 'Science Sidebar', layoutType: 'card3', publisherId: 'bbc-science', kind: 'news' },
    ],
    layout: [
      { i: 'sr-1', x: 0, y: 0, w: 2, h: 5, minW: 1, minH: 2 },
      { i: 'sr-editorial', x: 2, y: 0, w: 1, h: 3, minW: 1, minH: 1 },
      { i: 'sr-2', x: 2, y: 3, w: 1, h: 2, minW: 1, minH: 1 },
    ],
  },
  {
    slug: 'headline-scan',
    name: 'Headline Scan',
    curator: 'Berk Arslan',
    description: 'Minimal, fast. All five sources, headline-only mode. Get in, get out, be informed.',
    readingMode: 'H',
    widgets: [
      { id: 'hs-1', title: 'BBC Tech', layoutType: 'card4', publisherId: 'bbc-tech', kind: 'news' },
      { id: 'hs-2', title: 'BBC Science', layoutType: 'card4', publisherId: 'bbc-science', kind: 'news' },
      { id: 'hs-3', title: 'Guardian', layoutType: 'card4', publisherId: 'the-guardian-tech', kind: 'news' },
      { id: 'hs-4', title: 'Hacker News', layoutType: 'card4', publisherId: 'hacker-news', kind: 'news' },
      { id: 'hs-5', title: 'NASA', layoutType: 'card4', publisherId: 'nasa', kind: 'news' },
      { id: 'hs-pop', title: 'Popular', layoutType: 'discovery', kind: 'popular' },
    ],
    layout: [
      { i: 'hs-1', x: 0, y: 0, w: 1, h: 3, minW: 1, minH: 1 },
      { i: 'hs-2', x: 1, y: 0, w: 1, h: 3, minW: 1, minH: 1 },
      { i: 'hs-3', x: 2, y: 0, w: 1, h: 3, minW: 1, minH: 1 },
      { i: 'hs-4', x: 0, y: 3, w: 1, h: 3, minW: 1, minH: 1 },
      { i: 'hs-5', x: 1, y: 3, w: 1, h: 3, minW: 1, minH: 1 },
      { i: 'hs-pop', x: 2, y: 3, w: 1, h: 3, minW: 1, minH: 1 },
    ],
  },
];

export function getSharedNewspaperBySlug(slug: string) {
  return SHARED_NEWSPAPERS.find((item) => item.slug === slug);
}
