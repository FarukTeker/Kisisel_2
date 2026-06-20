import type { LayoutItem } from 'react-grid-layout';
import type { FeedWidget } from '@/lib/prototypeNewspapers';
import { DEFAULT_LAYOUT, DEFAULT_WIDGETS } from '@/lib/prototypeNewspapers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface PrototypeDashboardState {
  widgets: FeedWidget[];
  layout: LayoutItem[];
  readingMode: 'S' | 'H' | 'F';
}

export function getDefaultDashboardState(): PrototypeDashboardState {
  return {
    widgets: DEFAULT_WIDGETS,
    layout: DEFAULT_LAYOUT,
    readingMode: 'F',
  };
}

export async function loadDashboardState(): Promise<PrototypeDashboardState> {
  try {
    const res = await fetch(`${API_BASE}/newspapers/dashboard`, { credentials: 'include' });
    if (!res.ok) return getDefaultDashboardState();
    
    const data = await res.json();
    if (!data.newspaper || !data.newspaper.widgets || data.newspaper.widgets.length === 0) {
      return getDefaultDashboardState();
    }

    const widgets: FeedWidget[] = data.newspaper.widgets.map((w: any) => ({
      id: w.id,
      title: w.title,
      layoutType: w.layoutType,
      kind: w.kind,
      publisherId: w.publisherId || undefined,
      editorialBody: w.editorialBody || undefined,
      categoryFilter: w.categoryFilter || undefined,
    }));

    const layout: LayoutItem[] = data.newspaper.widgets.map((w: any) => ({
      i: w.id,
      x: w.layoutX,
      y: w.layoutY,
      w: w.layoutW,
      h: w.layoutH,
      minW: w.layoutMinW,
      minH: w.layoutMinH,
    }));

    return {
      widgets,
      layout,
      readingMode: data.newspaper.readingMode,
    };
  } catch {
    return getDefaultDashboardState();
  }
}

export async function saveDashboardState(state: PrototypeDashboardState) {
  try {
    const combinedWidgets = state.widgets.map(w => {
      const l = state.layout.find(item => item.i === w.id);
      return {
        ...w,
        layoutX: l?.x || 0,
        layoutY: l?.y || 0,
        layoutW: l?.w || 1,
        layoutH: l?.h || 1,
        layoutMinW: l?.minW || 1,
        layoutMinH: l?.minH || 1,
      };
    });

    await fetch(`${API_BASE}/newspapers/dashboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        widgets: combinedWidgets,
        readingMode: state.readingMode,
      }),
      credentials: 'include',
    });
  } catch (error) {
    console.error('Failed to save dashboard', error);
  }
}

export async function shareDashboard(state: PrototypeDashboardState, name: string, description: string) {
  try {
    const combinedWidgets = state.widgets.map(w => {
      const l = state.layout.find(item => item.i === w.id);
      return {
        ...w,
        layoutX: l?.x || 0,
        layoutY: l?.y || 0,
        layoutW: l?.w || 1,
        layoutH: l?.h || 1,
        layoutMinW: l?.minW || 1,
        layoutMinH: l?.minH || 1,
      };
    });

    const res = await fetch(`${API_BASE}/newspapers/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        widgets: combinedWidgets,
        readingMode: state.readingMode,
      }),
      credentials: 'include',
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    return data.slug;
  } catch {
    return null;
  }
}
