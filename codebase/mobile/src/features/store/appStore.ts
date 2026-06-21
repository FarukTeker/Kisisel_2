import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { getAuthToken } from '@/features/auth/store';
import {
  fetchArticles,
  fetchPopular,
  fetchRandom,
  fetchSources,
} from '@/lib/api/articles';
import {
  fetchDashboard,
  fetchDiscover,
  fetchSharedNewspaper,
  saveDashboard,
  shareDashboard,
} from '@/lib/api/newspapers';
import { fromBackendWidget, toBackendWidget } from '@/features/store/widget-map';
import type {
  FeedWidget,
  MyNewspaper,
  ReadingMode,
  WidgetKind,
  WidgetSize,
} from '@/features/store/types';
import { WIDGET_KIND_META } from '@/features/store/types';
import type { Article, DiscoverItem, SharedNewspaper, Source } from '@/lib/types';

const KEYS = {
  onboarded: 'kisisel.onboarded',
  follows: 'kisisel.follows',
  customSources: 'kisisel.customSources',
  publishedSlug: 'kisisel.publishedSlug',
};

export interface CustomSource {
  id: string;
  name: string;
  category: string;
  feedUrl: string;
  isCustom: true;
}

let idCounter = 0;
function genId(prefix = 'w'): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

const EMPTY_NEWSPAPER: MyNewspaper = {
  id: 'my-newspaper',
  name: 'My Newspaper',
  description: 'A personal front page composed of the sources and rhythms you care about.',
  readingMode: 'H',
  widgets: [],
};

interface AppState {
  // session / flow
  onboarded: boolean;
  hydrated: boolean;

  // newspaper + edit
  myNewspaper: MyNewspaper;
  dashboardLoaded: boolean;
  editMode: boolean;
  selectedWidgetId: string | null;

  // data (hybrid: live API)
  sources: Source[];
  customSources: CustomSource[];
  articlesBySource: Record<string, Article[]>;
  popular: Article[];
  random: Article[];
  sourceAddError: string | null;

  // discover / social
  discover: DiscoverItem[];
  followedSlugs: string[];
  publishedSlug: string | null;

  // actions
  hydrateLocal: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  bootstrapForUser: () => Promise<void>;
  resetForLogout: () => void;

  loadSources: () => Promise<void>;
  loadArticles: (sourceId: string) => Promise<void>;
  loadDiscovery: () => Promise<void>;

  setReadingMode: (mode: ReadingMode) => void;
  toggleEditMode: () => void;
  setSelectedWidget: (id: string | null) => void;
  addWidget: (kind: WidgetKind, sourceId?: string) => void;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, direction: -1 | 1) => void;
  resizeWidget: (id: string, size: WidgetSize) => void;
  setCategoryFilter: (id: string, category?: string) => void;
  setEditorialBody: (id: string, text: string) => void;

  allSources: () => (Source | CustomSource)[];
  articlesForWidget: (widget: FeedWidget) => Article[];

  isFollowing: (slug: string) => boolean;
  toggleFollow: (slug: string) => Promise<void>;
  openShared: (slug: string) => Promise<SharedNewspaper>;
  forkNewspaper: (shared: SharedNewspaper) => Promise<void>;
  publish: () => Promise<string>;

  addCustomSource: (name: string, feedUrl: string, category: string) => Promise<boolean>;
  removeCustomSource: (id: string) => Promise<void>;
}

// ---- dashboard persistence (debounced) ---------------------------------------

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave(get: () => AppState) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void persistDashboard(get);
  }, 800);
}
async function persistDashboard(get: () => AppState) {
  if (!getAuthToken()) return;
  const np = get().myNewspaper;
  try {
    await saveDashboard({
      widgets: np.widgets.map(toBackendWidget),
      readingMode: np.readingMode,
    });
  } catch {
    // best-effort; UI keeps local state regardless
  }
}

// ---- store -------------------------------------------------------------------

export const useAppStore = create<AppState>((set, get) => ({
  onboarded: false,
  hydrated: false,
  myNewspaper: EMPTY_NEWSPAPER,
  dashboardLoaded: false,
  editMode: false,
  selectedWidgetId: null,
  sources: [],
  customSources: [],
  articlesBySource: {},
  popular: [],
  random: [],
  sourceAddError: null,
  discover: [],
  followedSlugs: [],
  publishedSlug: null,

  hydrateLocal: async () => {
    const [onboarded, follows, custom, slug] = await Promise.all([
      AsyncStorage.getItem(KEYS.onboarded),
      AsyncStorage.getItem(KEYS.follows),
      AsyncStorage.getItem(KEYS.customSources),
      AsyncStorage.getItem(KEYS.publishedSlug),
    ]);
    set({
      onboarded: onboarded === '1',
      followedSlugs: follows ? (JSON.parse(follows) as string[]) : [],
      customSources: custom ? (JSON.parse(custom) as CustomSource[]) : [],
      publishedSlug: slug,
      hydrated: true,
    });
  },

  completeOnboarding: async () => {
    set({ onboarded: true });
    await AsyncStorage.setItem(KEYS.onboarded, '1');
  },

  bootstrapForUser: async () => {
    await get().loadSources();
    await get().loadDiscovery();
    // Dashboard
    try {
      const np = await fetchDashboard();
      const widgets = np.widgets
        .map((w, i) => fromBackendWidget(w, i))
        .sort((a, b) => a.order - b.order)
        .map((w, i) => ({ ...w, order: i }));
      set({
        myNewspaper: {
          id: np.id,
          name: np.name,
          description: np.description ?? EMPTY_NEWSPAPER.description,
          readingMode: (np.readingMode as ReadingMode) ?? 'H',
          widgets,
        },
        dashboardLoaded: true,
      });
    } catch {
      set({ dashboardLoaded: true });
    }
    // Prefetch article corpus for the sources used by the dashboard.
    const used = new Set(get().myNewspaper.widgets.map((w) => w.sourceId).filter(Boolean) as string[]);
    await Promise.all([...used].map((id) => get().loadArticles(id)));
  },

  resetForLogout: () => {
    if (saveTimer) clearTimeout(saveTimer);
    set({
      myNewspaper: EMPTY_NEWSPAPER,
      dashboardLoaded: false,
      editMode: false,
      selectedWidgetId: null,
      articlesBySource: {},
      popular: [],
      random: [],
    });
  },

  loadSources: async () => {
    try {
      const sources = await fetchSources();
      set({ sources });
    } catch {
      // ignore; UI shows empty source list
    }
    try {
      const [popular, random] = await Promise.all([fetchPopular(8), fetchRandom(6)]);
      set({ popular, random });
    } catch {
      /* ignore */
    }
  },

  loadArticles: async (sourceId: string) => {
    if (!sourceId || sourceId.startsWith('custom-')) return; // custom feeds aren't fetchable
    if (get().articlesBySource[sourceId]) return;
    try {
      const { articles } = await fetchArticles({ sourceId, limit: 20 });
      set((s) => ({ articlesBySource: { ...s.articlesBySource, [sourceId]: articles } }));
    } catch {
      /* ignore */
    }
  },

  loadDiscovery: async () => {
    try {
      const discover = await fetchDiscover();
      set({ discover });
    } catch {
      /* ignore */
    }
  },

  setReadingMode: (mode) => {
    set((s) => ({ myNewspaper: { ...s.myNewspaper, readingMode: mode } }));
    scheduleSave(get);
  },

  toggleEditMode: () =>
    set((s) => ({ editMode: !s.editMode, selectedWidgetId: s.editMode ? null : s.selectedWidgetId })),

  setSelectedWidget: (id) => set({ selectedWidgetId: id }),

  addWidget: (kind, sourceId) => {
    const title =
      kind === 'news'
        ? (get().allSources().find((s) => s.id === sourceId)?.name ?? 'News feed')
        : WIDGET_KIND_META[kind].label;
    const widget: FeedWidget = {
      id: genId(),
      title,
      kind,
      sourceId: kind === 'news' ? sourceId : undefined,
      size: 'regular',
      editorialBody: kind === 'editorial' ? '' : undefined,
      order: get().myNewspaper.widgets.length,
    };
    set((s) => ({
      myNewspaper: { ...s.myNewspaper, widgets: [...s.myNewspaper.widgets, widget] },
      selectedWidgetId: widget.id,
    }));
    if (sourceId) void get().loadArticles(sourceId);
    scheduleSave(get);
  },

  removeWidget: (id) => {
    set((s) => {
      const widgets = s.myNewspaper.widgets
        .filter((w) => w.id !== id)
        .map((w, i) => ({ ...w, order: i }));
      return {
        myNewspaper: { ...s.myNewspaper, widgets },
        selectedWidgetId: s.selectedWidgetId === id ? null : s.selectedWidgetId,
      };
    });
    scheduleSave(get);
  },

  moveWidget: (id, direction) => {
    set((s) => {
      const ordered = [...s.myNewspaper.widgets].sort((a, b) => a.order - b.order);
      const from = ordered.findIndex((w) => w.id === id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= ordered.length) return s;
      [ordered[from], ordered[to]] = [ordered[to], ordered[from]];
      const widgets = ordered.map((w, i) => ({ ...w, order: i }));
      return { myNewspaper: { ...s.myNewspaper, widgets } };
    });
    scheduleSave(get);
  },

  resizeWidget: (id, size) => {
    set((s) => ({
      myNewspaper: {
        ...s.myNewspaper,
        widgets: s.myNewspaper.widgets.map((w) => (w.id === id ? { ...w, size } : w)),
      },
    }));
    scheduleSave(get);
  },

  setCategoryFilter: (id, category) => {
    set((s) => ({
      myNewspaper: {
        ...s.myNewspaper,
        widgets: s.myNewspaper.widgets.map((w) => (w.id === id ? { ...w, categoryFilter: category } : w)),
      },
    }));
    scheduleSave(get);
  },

  setEditorialBody: (id, text) => {
    set((s) => ({
      myNewspaper: {
        ...s.myNewspaper,
        widgets: s.myNewspaper.widgets.map((w) => (w.id === id ? { ...w, editorialBody: text } : w)),
      },
    }));
    scheduleSave(get);
  },

  allSources: () => [...get().sources, ...get().customSources],

  articlesForWidget: (widget) => {
    const s = get();
    if (widget.kind === 'popular') return s.popular;
    if (widget.kind === 'random') return s.random;
    if (widget.kind === 'news' && widget.sourceId) {
      const all = s.articlesBySource[widget.sourceId] ?? [];
      if (!widget.categoryFilter) return all;
      const filtered = all.filter((a) => a.category === widget.categoryFilter);
      return filtered.length ? filtered : all;
    }
    return [];
  },

  isFollowing: (slug) => get().followedSlugs.includes(slug),

  toggleFollow: async (slug) => {
    const next = get().followedSlugs.includes(slug)
      ? get().followedSlugs.filter((s) => s !== slug)
      : [...get().followedSlugs, slug];
    set({ followedSlugs: next });
    await AsyncStorage.setItem(KEYS.follows, JSON.stringify(next));
  },

  openShared: (slug) => fetchSharedNewspaper(slug),

  forkNewspaper: async (shared) => {
    const widgets = shared.widgets
      .map((w, i) => fromBackendWidget(w, i))
      .sort((a, b) => a.order - b.order)
      .map((w, i) => ({ ...w, id: genId(), order: i }));
    set((s) => ({
      myNewspaper: {
        ...s.myNewspaper,
        name: `${shared.name} (mine)`,
        description: `Forked from ${shared.curator?.name ?? 'a curator'}'s "${shared.name}".`,
        widgets,
      },
    }));
    const used = new Set(widgets.map((w) => w.sourceId).filter(Boolean) as string[]);
    await Promise.all([...used].map((id) => get().loadArticles(id)));
    await persistDashboard(get);
  },

  publish: async () => {
    const np = get().myNewspaper;
    const { slug } = await shareDashboard({
      name: np.name,
      description: np.description,
      widgets: np.widgets.map(toBackendWidget),
      readingMode: np.readingMode,
    });
    set({ publishedSlug: slug });
    await AsyncStorage.setItem(KEYS.publishedSlug, slug);
    void get().loadDiscovery();
    return slug;
  },

  addCustomSource: async (name, feedUrl, category) => {
    set({ sourceAddError: null });
    const url = feedUrl.trim();
    if (!/^https?:\/\/.+\..+/.test(url)) {
      set({ sourceAddError: 'Enter a valid feed URL (https://…).' });
      return false;
    }
    if (get().allSources().some((s) => 'feedUrl' in s && (s as CustomSource).feedUrl === url)) {
      set({ sourceAddError: 'This source is already in your library.' });
      return false;
    }
    const source: CustomSource = {
      id: `custom-${genId('s')}`,
      name: name.trim(),
      category,
      feedUrl: url,
      isCustom: true,
    };
    const next = [...get().customSources, source];
    set({ customSources: next });
    await AsyncStorage.setItem(KEYS.customSources, JSON.stringify(next));
    return true;
  },

  removeCustomSource: async (id) => {
    const next = get().customSources.filter((s) => s.id !== id);
    set((s) => ({
      customSources: next,
      myNewspaper: {
        ...s.myNewspaper,
        widgets: s.myNewspaper.widgets.map((w) =>
          w.sourceId === id ? { ...w, sourceId: undefined } : w,
        ),
      },
    }));
    await AsyncStorage.setItem(KEYS.customSources, JSON.stringify(next));
  },
}));
