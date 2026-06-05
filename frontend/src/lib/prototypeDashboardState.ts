import type { LayoutItem } from 'react-grid-layout';
import type { FeedWidget } from '@/lib/prototypeNewspapers';
import { getCurrentPrototypeUser } from '@/lib/prototypeState';
import { DEFAULT_LAYOUT, DEFAULT_WIDGETS } from '@/lib/prototypeNewspapers';

export interface PrototypeDashboardState {
  widgets: FeedWidget[];
  layout: LayoutItem[];
  readingMode: 'S' | 'H' | 'F';
}

// Map old mock publisher IDs → live RSS source IDs
const MOCK_TO_LIVE: Record<string, string> = {
  'tech-today': 'bbc-tech',
  'culinary-delights': 'bbc-tech',
  'science-digest': 'bbc-science',
  'global-finance': 'the-guardian-tech',
};

function migrateMockPublishers(state: PrototypeDashboardState): PrototypeDashboardState {
  const migrated = state.widgets.map((w) =>
    w.publisherId && MOCK_TO_LIVE[w.publisherId]
      ? { ...w, publisherId: MOCK_TO_LIVE[w.publisherId] }
      : w,
  );
  return { ...state, widgets: migrated };
}

function canUseStorage() {
  return typeof window !== 'undefined';
}

function getDashboardKey() {
  const currentUser = getCurrentPrototypeUser();
  return currentUser ? `prototypeDashboard:${currentUser.id}` : null;
}

export function getDefaultDashboardState(): PrototypeDashboardState {
  return {
    widgets: DEFAULT_WIDGETS,
    layout: DEFAULT_LAYOUT,
    readingMode: 'F',
  };
}

export function loadPrototypeDashboardState(): PrototypeDashboardState {
  if (!canUseStorage()) return getDefaultDashboardState();

  const key = getDashboardKey();
  if (!key) return getDefaultDashboardState();

  const raw = localStorage.getItem(key);
  if (!raw) return getDefaultDashboardState();

  try {
    const parsed = JSON.parse(raw) as PrototypeDashboardState;
    return migrateMockPublishers(parsed);
  } catch {
    return getDefaultDashboardState();
  }
}

export function savePrototypeDashboardState(state: PrototypeDashboardState) {
  if (!canUseStorage()) return;

  const key = getDashboardKey();
  if (!key) return;

  localStorage.setItem(key, JSON.stringify(state));
}
