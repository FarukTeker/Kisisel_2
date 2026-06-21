"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Responsive, useContainerWidth, type Layout } from "react-grid-layout";
import Navbar from "@/components/layout/Navbar";
import Widget from "@/components/news/Widget";
import SettingsModal from "@/components/dashboard/SettingsModal";
import Toast from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import { useT } from "@/features/i18n/useT";
import { useAuthStore } from "@/features/auth/store";
import { useSettingsStore } from "@/features/settings/store";
import { useEditions } from "@/features/articles/queries";
import {
  useDashboard,
  useSaveDashboard,
  useShareDashboard,
  useShareStatus,
} from "@/features/dashboard/queries";
import { ApiError } from "@/lib/api/client";
import type { DashboardState } from "@/features/dashboard/api";
import {
  DEFAULT_LAYOUT,
  DEFAULT_WIDGETS,
  initialLayoutFor,
  type LayoutItem,
  type WidgetConfig,
} from "@/features/dashboard/widgets";
import type { ReadingMode } from "@/features/articles/reading-mode";

export default function Dashboard() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const t = useT();
  const { data: loaded, isLoading } = useDashboard();
  const save = useSaveDashboard();
  const share = useShareDashboard();
  const { data: shareStatus } = useShareStatus();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const theme = useSettingsStore((s) => s.theme);
  const font = useSettingsStore((s) => s.font);
  const language = useSettingsStore((s) => s.language);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setFont = useSettingsStore((s) => s.setFont);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const applySettings = useSettingsStore((s) => s.apply);

  const [name, setName] = useState("My Newspaper");
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [layout, setLayout] = useState<LayoutItem[]>(DEFAULT_LAYOUT);
  const [readingMode, setReadingMode] = useState<ReadingMode>("S");
  const [columns, setColumns] = useState(3);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // History: which daily edition to view (undefined = latest/today).
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const { data: editions } = useEditions();

  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1200 });

  // Auth guard.
  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  // Apply persisted theme/font on mount.
  useEffect(() => {
    applySettings();
  }, [applySettings]);

  // Hydrate local state once the backend dashboard arrives.
  useEffect(() => {
    if (!loaded || hydrated) return;
    if (loaded.widgets.length > 0) {
      setWidgets(loaded.widgets);
      setLayout(loaded.layout);
    }
    if (loaded.name) setName(loaded.name);
    setReadingMode(loaded.readingMode);
    setColumns(loaded.columns);
    setTheme(loaded.theme);
    setFont(loaded.font);
    setLanguage(loaded.language);
    setHydrated(true);
  }, [loaded, hydrated, setTheme, setFont, setLanguage]);

  // Debounced autosave. `stateRef` always holds the latest state so we can flush
  // it on unmount (otherwise a quick navigation within the debounce window drops
  // the last edit).
  const saveRef = useRef(save);
  saveRef.current = save;
  const stateRef = useRef<DashboardState | null>(null);
  stateRef.current = hydrated
    ? { name, widgets, layout, readingMode, columns, theme, font, language }
    : null;

  useEffect(() => {
    if (!hydrated) return;
    const state: DashboardState = { name, widgets, layout, readingMode, columns, theme, font, language };
    const t = setTimeout(() => saveRef.current.mutate(state), 500);
    return () => clearTimeout(t);
  }, [name, widgets, layout, readingMode, columns, theme, font, language, hydrated]);

  // Flush the latest state when leaving the page.
  useEffect(() => {
    return () => {
      if (stateRef.current) saveRef.current.mutate(stateRef.current);
    };
  }, []);

  const selectedWidget = selectedId
    ? widgets.find((w) => w.id === selectedId) ?? null
    : null;

  const updateWidget = useCallback((id: string, patch: Partial<WidgetConfig>) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
    if (patch.layoutType) {
      setLayout((prev) =>
        prev.map((item) => {
          if (item.i === id) {
            const isWide = patch.layoutType === "card2" || patch.layoutType === "card6";
            const isTall = patch.layoutType === "card1" || patch.layoutType === "card5";
            const isEditorial = patch.layoutType === "editorial";
            const isDiscovery = patch.layoutType === "discovery";
            return {
              ...item,
              w: isEditorial || isWide || isDiscovery ? 2 : 1,
              h: isEditorial ? 3 : isDiscovery ? 2 : isTall ? 4 : 3,
            };
          }
          return item;
        })
      );
    }
  }, []);

  const deleteWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    setLayout((prev) => prev.filter((l) => l.i !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const addWidget = useCallback(
    (w: { title: string; kind: WidgetConfig["kind"]; layoutType: WidgetConfig["layoutType"]; publisherId?: string }) => {
      const id = `widget-${crypto.randomUUID()}`;
      const config: WidgetConfig = {
        id,
        title: w.title,
        kind: w.kind,
        layoutType: w.layoutType,
        publisherId: w.publisherId,
        editorialBody: w.kind === "editorial" ? "" : undefined,
      };
      setWidgets((prev) => [...prev, config]);
      setLayout((prev) => [...prev, initialLayoutFor(id, w.layoutType, prev)]);
      setToast(`Added “${w.title}”`);
    },
    [],
  );

  async function handleShare() {
    // Guard early so the daily rules are clear even before hitting the API.
    if (shareStatus && !shareStatus.isOpen) {
      setToast(t("share.opensAt").replace("{hour}", String(shareStatus.opensAtHour)));
      return;
    }
    if (shareStatus?.alreadySharedToday) {
      setToast(t("share.alreadyToday"));
      return;
    }
    try {
      const state: DashboardState = { name, widgets, layout, readingMode, columns, theme, font, language };
      const slug = await share.mutateAsync({ state, name, description: "" });
      const url = `${window.location.origin}/newspaper/${slug}`;
      await navigator.clipboard.writeText(url).catch(() => {});
      setToast(`${t("share.success")} ${url}`);
      setSettingsOpen(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setToast(t("share.alreadyToday"));
      } else if (err instanceof ApiError && err.status === 403) {
        setToast(t("share.opensAt").replace("{hour}", String(shareStatus?.opensAtHour ?? 9)));
      } else {
        setToast(t("share.failed"));
      }
    }
  }

  if (!token || (isLoading && !hydrated)) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm font-semibold text-muted">Loading…</p>
      </main>
    );
  }

  const cols = { lg: columns, md: columns, sm: 1, xs: 1, xxs: 1 };
  const rgLayout = layout as unknown as Layout;

  return (
    <div className="min-h-screen">
      <Navbar
        readingMode={readingMode}
        setReadingMode={setReadingMode}
        editMode={editMode}
        setEditMode={(v) => {
          setEditMode(v);
          if (!v) setSelectedId(null);
        }}
        onShare={handleShare}
        canShare={shareStatus?.canShare ?? true}
        onSettings={() => {
          setSelectedId(null);
          setSettingsOpen(true);
        }}
        editions={editions ?? []}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <main ref={containerRef} className="mx-auto max-w-6xl px-4 py-6">
        {mounted && (
          <Responsive
            className={`feed-rgl ${editMode ? "feed-rgl-editing" : ""}`}
            width={width}
            layouts={{ lg: rgLayout, md: rgLayout, sm: rgLayout, xs: rgLayout, xxs: rgLayout }}
            breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 0, xxs: 0 }}
            cols={cols}
            rowHeight={readingMode === "F" ? 120 : 96}
            margin={[20, 20]}
            containerPadding={[0, 0]}
            dragConfig={{
              enabled: editMode,
              cancel: ".widget-settings-btn, .react-resizable-handle, button, input, textarea, select, a",
              threshold: 3,
            }}
            resizeConfig={{ enabled: editMode, handles: ["se"] }}
            onLayoutChange={(next: Layout) => setLayout(next as unknown as LayoutItem[])}
          >
            {widgets.map((w) => (
              <div key={w.id}>
                <Widget
                  config={w}
                  mode={readingMode}
                  editionDate={selectedDate}
                  editMode={editMode}
                  selected={selectedId === w.id}
                  onSelect={() => setSelectedId(w.id)}
                  onSettings={() => {
                    setSelectedId(w.id);
                    setSettingsOpen(true);
                  }}
                  onDelete={() => setDeleteConfirmId(w.id)}
                />
              </div>
            ))}
          </Responsive>
        )}
      </main>
 
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        selectedWidget={selectedWidget}
        name={name}
        onNameChange={setName}
        columns={columns}
        onColumnsChange={setColumns}
        onAddWidget={addWidget}
        onUpdateWidget={updateWidget}
        onDeleteWidget={deleteWidget}
        onShare={handleShare}
        shareStatus={shareStatus}
      />
 
      <Toast message={toast} onDone={() => setToast(null)} />

      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title={t("widget.deleteConfirmTitle")}
        maxWidth={420}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft leading-relaxed">
            {t("widget.deleteConfirmMessage")}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="rounded-pill border border-line px-5 py-2 text-sm font-extrabold uppercase text-ink hover:bg-surface-hover"
            >
              {t("action.cancel")}
            </button>
            <button
              onClick={() => {
                if (deleteConfirmId) {
                  deleteWidget(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
              className="rounded-pill bg-red-600 px-5 py-2 text-sm font-extrabold uppercase text-white hover:bg-red-700"
            >
              {t("action.delete")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
