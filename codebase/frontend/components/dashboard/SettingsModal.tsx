"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useSources } from "@/features/articles/queries";
import {
  FONT_OPTIONS,
  LANGUAGES,
  THEMES,
  useSettingsStore,
  type Language,
  type Theme,
} from "@/features/settings/store";
import { useT } from "@/features/i18n/useT";
import {
  CATEGORIES,
  WIDGET_TEMPLATES,
  type WidgetConfig,
  type WidgetKind,
  type WidgetLayoutType,
} from "@/features/dashboard/widgets";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWidget: WidgetConfig | null;
  columns: number;
  onColumnsChange: (n: number) => void;
  onAddWidget: (w: { title: string; kind: WidgetKind; layoutType: WidgetLayoutType; publisherId?: string }) => void;
  onUpdateWidget: (id: string, patch: Partial<WidgetConfig>) => void;
  onDeleteWidget: (id: string) => void;
  onShare: () => void;
}

const GLOBAL_TABS = ["Design", "Layout", "Widgets", "Share"] as const;

const TAB_LABEL_KEY = {
  Design: "settings.tab.design",
  Layout: "settings.tab.layout",
  Widgets: "settings.tab.widgets",
  Share: "settings.tab.share",
} as const;

export default function SettingsModal(props: SettingsModalProps) {
  const t = useT();
  const { isOpen, onClose, selectedWidget } = props;
  const title = selectedWidget
    ? `Widget — ${selectedWidget.title}`
    : t("settings.page");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={680}>
      {selectedWidget ? (
        <WidgetSettings {...props} widget={selectedWidget} />
      ) : (
        <GlobalSettings {...props} />
      )}
    </Modal>
  );
}

function GlobalSettings({
  columns,
  onColumnsChange,
  onAddWidget,
  onShare,
}: SettingsModalProps) {
  const t = useT();
  const [tab, setTab] = useState<(typeof GLOBAL_TABS)[number]>("Design");
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const font = useSettingsStore((s) => s.font);
  const setFont = useSettingsStore((s) => s.setFont);

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <nav className="flex shrink-0 gap-1 sm:w-32 sm:flex-col">
        {GLOBAL_TABS.map((tabId) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={`rounded-lg px-3 py-2 text-left text-sm font-bold ${
              tab === tabId ? "bg-brand text-white" : "text-ink-soft hover:bg-surface-hover"
            }`}
          >
            {t(TAB_LABEL_KEY[tabId])}
          </button>
        ))}
      </nav>

      <div className="min-h-[260px] flex-1">
        {tab === "Design" && (
          <div className="flex flex-col gap-5">
            <Field label={t("settings.theme")}>
              <div className="flex gap-2">
                {THEMES.map((th) => (
                  <button
                    key={th}
                    onClick={() => setTheme(th as Theme)}
                    className={`rounded-lg border px-3 py-2 text-sm font-bold ${
                      theme === th ? "border-brand bg-brand text-white" : "border-line text-ink hover:bg-surface-hover"
                    }`}
                  >
                    {th}
                  </button>
                ))}
              </div>
            </Field>
            <Field label={t("settings.language")}>
              <div className="flex gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLanguage(l.id as Language)}
                    className={`rounded-lg border px-3 py-2 text-sm font-bold ${
                      language === l.id ? "border-brand bg-brand text-white" : "border-line text-ink hover:bg-surface-hover"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label={t("settings.font")}>
              <div className="flex flex-col gap-2">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.label}
                    onClick={() => setFont(f.label)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${
                      font === f.label ? "border-brand bg-brand/10 text-ink" : "border-line text-ink hover:bg-surface-hover"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {tab === "Layout" && (
          <Field label={t("settings.columns")}>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => onColumnsChange(n)}
                  className={`h-12 w-12 rounded-lg border text-lg font-extrabold ${
                    columns === n ? "border-brand bg-brand text-white" : "border-line text-ink hover:bg-surface-hover"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">{t("settings.columnsHint")}</p>
          </Field>
        )}

        {tab === "Widgets" && <AddWidgetForm onAddWidget={onAddWidget} />}

        {tab === "Share" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-ink-soft">{t("settings.shareHint")}</p>
            <button
              onClick={onShare}
              className="self-start rounded-pill bg-brand px-5 py-2 text-sm font-extrabold uppercase text-white"
            >
              {t("settings.shareButton")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AddWidgetForm({
  onAddWidget,
}: {
  onAddWidget: SettingsModalProps["onAddWidget"];
}) {
  const { data: sources } = useSources();
  const [template, setTemplate] = useState<WidgetLayoutType>("card3");
  const [publisherId, setPublisherId] = useState("");
  const [discoveryKind, setDiscoveryKind] = useState<"popular" | "random">("popular");
  const [title, setTitle] = useState("");

  const isEditorial = template === "editorial";
  const isDiscovery = template === "discovery";

  function add() {
    if (isEditorial) {
      onAddWidget({ title: title || "Editorial Note", kind: "editorial", layoutType: "editorial" });
    } else if (isDiscovery) {
      onAddWidget({
        title: title || (discoveryKind === "popular" ? "Popular Picks" : "Serendipity"),
        kind: discoveryKind,
        layoutType: "discovery",
      });
    } else {
      const src = sources?.find((s) => s.id === publisherId) ?? sources?.[0];
      if (!src) return;
      onAddWidget({ title: title || src.name, kind: "news", layoutType: template, publisherId: src.id });
    }
    setTitle("");
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Template">
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value as WidgetLayoutType)}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
        >
          {WIDGET_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label} — {t.description}
            </option>
          ))}
        </select>
      </Field>

      {!isEditorial && !isDiscovery && (
        <Field label="Source">
          <select
            value={publisherId}
            onChange={(e) => setPublisherId(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
          >
            {(sources ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category})
              </option>
            ))}
          </select>
        </Field>
      )}

      {isDiscovery && (
        <Field label="Mode">
          <div className="flex gap-2">
            {(["popular", "random"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setDiscoveryKind(k)}
                className={`rounded-lg border px-3 py-2 text-sm font-bold capitalize ${
                  discoveryKind === k ? "border-brand bg-brand text-white" : "border-line text-ink hover:bg-surface-hover"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </Field>
      )}

      <Field label="Title (optional)">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Widget title"
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
        />
      </Field>

      <button
        onClick={add}
        className="self-start rounded-pill bg-brand px-5 py-2 text-sm font-extrabold uppercase text-white"
      >
        Add widget
      </button>
    </div>
  );
}

function WidgetSettings({
  widget,
  onUpdateWidget,
  onDeleteWidget,
  onClose,
}: SettingsModalProps & { widget: WidgetConfig }) {
  return (
    <div className="flex flex-col gap-5">
      <Field label="Title">
        <input
          value={widget.title}
          onChange={(e) => onUpdateWidget(widget.id, { title: e.target.value })}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
        />
      </Field>

      {widget.kind === "editorial" && (
        <Field label="Editorial note">
          <textarea
            value={widget.editorialBody ?? ""}
            onChange={(e) => onUpdateWidget(widget.id, { editorialBody: e.target.value })}
            rows={5}
            placeholder="Write your curator commentary…"
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
          />
        </Field>
      )}

      {widget.kind === "news" && (
        <Field label="Category filter">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active =
                (widget.categoryFilter ?? "All") === c || (c === "All" && !widget.categoryFilter);
              return (
                <button
                  key={c}
                  onClick={() =>
                    onUpdateWidget(widget.id, {
                      categoryFilter: c === "All" ? undefined : c,
                    })
                  }
                  className={`rounded-pill border px-3 py-1 text-xs font-bold ${
                    active ? "border-brand bg-brand text-white" : "border-line text-ink hover:bg-surface-hover"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </Field>
      )}

      {(widget.kind === "popular" || widget.kind === "random") && (
        <p className="rounded-lg border border-line bg-surface-hover px-3 py-2 text-sm text-ink-soft">
          {widget.kind === "popular"
            ? "Shows trending stories scored across all sources."
            : "Surfaces unexpected stories sampled outside your usual feed."}
        </p>
      )}

      <button
        onClick={() => {
          onDeleteWidget(widget.id);
          onClose();
        }}
        className="self-start rounded-pill border border-red-300 bg-red-50 px-5 py-2 text-sm font-extrabold uppercase text-red-600"
      >
        Delete widget
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-extrabold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </div>
  );
}
