import { apiRequest } from "@/lib/api/client";
import {
  dashboardResponseSchema,
  discoverResponseSchema,
  shareResponseSchema,
  sharedResponseSchema,
  type DiscoverNewspaper,
  type Newspaper,
} from "./schemas";
import {
  type LayoutItem,
  type WidgetConfig,
  type WidgetKind,
  type WidgetLayoutType,
} from "./widgets";
import type { ReadingMode } from "@/features/articles/reading-mode";
import type { Theme } from "@/features/settings/store";

export interface DashboardState {
  widgets: WidgetConfig[];
  layout: LayoutItem[];
  readingMode: ReadingMode;
  columns: number;
  theme: Theme;
  font: string;
}

/** Split a backend newspaper into widget config + react-grid-layout geometry. */
export function newspaperToState(np: Newspaper): DashboardState {
  return {
    widgets: np.widgets.map((w) => ({
      id: w.id,
      title: w.title,
      kind: w.kind as WidgetKind,
      layoutType: w.layoutType as WidgetLayoutType,
      publisherId: w.publisherId ?? undefined,
      editorialBody: w.editorialBody ?? undefined,
      categoryFilter: w.categoryFilter ?? undefined,
    })),
    layout: np.widgets.map((w) => ({
      i: w.id,
      x: w.layoutX,
      y: w.layoutY,
      w: w.layoutW,
      h: w.layoutH,
      minW: w.layoutMinW,
      minH: w.layoutMinH,
    })),
    readingMode: np.readingMode,
    columns: np.columns,
    theme: np.theme as Theme,
    font: np.font,
  };
}

/** Merge widget config + layout geometry into the flat rows the backend expects. */
function stateToWidgets(state: DashboardState) {
  return state.widgets.map((w) => {
    const l = state.layout.find((item) => item.i === w.id);
    return {
      id: w.id,
      title: w.title,
      layoutType: w.layoutType,
      kind: w.kind,
      publisherId: w.publisherId,
      editorialBody: w.editorialBody,
      categoryFilter: w.categoryFilter,
      layoutX: l?.x ?? 0,
      layoutY: l?.y ?? 0,
      layoutW: l?.w ?? 1,
      layoutH: l?.h ?? 1,
      layoutMinW: l?.minW ?? 1,
      layoutMinH: l?.minH ?? 1,
    };
  });
}

export async function loadDashboard(): Promise<DashboardState> {
  const data = await apiRequest("/newspapers/dashboard", {
    schema: dashboardResponseSchema,
  });
  return newspaperToState(data.newspaper);
}

export async function saveDashboard(state: DashboardState): Promise<void> {
  await apiRequest("/newspapers/dashboard", {
    method: "POST",
    schema: dashboardResponseSchema,
    body: {
      widgets: stateToWidgets(state),
      readingMode: state.readingMode,
      columns: state.columns,
      theme: state.theme,
      font: state.font,
    },
  });
}

export async function shareDashboard(
  state: DashboardState,
  name: string,
  description: string,
): Promise<string> {
  const data = await apiRequest("/newspapers/share", {
    method: "POST",
    schema: shareResponseSchema,
    body: {
      name,
      description,
      widgets: stateToWidgets(state),
      readingMode: state.readingMode,
      columns: state.columns,
      theme: state.theme,
      font: state.font,
    },
  });
  return data.slug;
}

export async function fetchDiscover(): Promise<DiscoverNewspaper[]> {
  const data = await apiRequest("/newspapers/discover", {
    schema: discoverResponseSchema,
    auth: false,
  });
  return data.newspapers;
}

export async function fetchSharedNewspaper(slug: string): Promise<DashboardState> {
  const data = await apiRequest(`/newspapers/shared/${slug}`, {
    schema: sharedResponseSchema,
    auth: false,
  });
  return newspaperToState(data.newspaper);
}
