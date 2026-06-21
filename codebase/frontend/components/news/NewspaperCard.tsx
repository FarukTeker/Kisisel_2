"use client";

import { useT } from "@/features/i18n/useT";
import { useSettingsStore } from "@/features/settings/store";

const MODE_COLOR: Record<string, string> = { S: "#2647d6", H: "#7c3aed", F: "#059669" };

export interface NewspaperCardData {
  slug: string;
  name: string;
  description: string | null;
  curator: string;
  curatorId: string;
  readingMode: string;
  widgetCount: number;
  widgets: { kind: string; layoutType: string }[];
  createdAt?: string;
}

function slotColor(kind: string): string {
  if (kind === "editorial") return "#dbeafe";
  if (kind === "popular" || kind === "random") return "#ede9fe";
  return "#dcfce7";
}

function tagsFor(np: NewspaperCardData, t: any): string[] {
  const tags = new Set<string>();
  np.widgets.forEach((wgt) => {
    if (wgt.kind === "editorial") tags.add(t("template.editorial.label"));
    if (wgt.kind === "popular") tags.add(t("widget.default.popular"));
    if (wgt.kind === "random") tags.add(t("widget.default.random"));
    if (wgt.kind === "news") tags.add(t("widget.newsTag"));
  });
  return [...tags].slice(0, 3);
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#2647d6", "#7c3aed", "#059669", "#d97706", "#dc2626"];
  return (
    <span
      className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[0.6rem] font-black text-white"
      style={{ backgroundColor: colors[name.charCodeAt(0) % colors.length] }}
    >
      {initials}
    </span>
  );
}

interface NewspaperCardProps {
  np: NewspaperCardData;
  onOpen: () => void;
  /** Follow control — omit to hide (e.g. on your own cards). */
  follow?: { isFollowing: boolean; busy?: boolean; onToggle: () => void };
  className?: string;
  style?: React.CSSProperties;
  onMouseDown?: (e: React.MouseEvent) => void;
}

/** Shared newspaper card used by Discover (draggable) and Following (grid). */
export default function NewspaperCard({
  np,
  onOpen,
  follow,
  className,
  style,
  onMouseDown,
}: NewspaperCardProps) {
  const t = useT();
  const language = useSettingsStore((s) => s.language);
  const locale = language === "tr" ? "tr-TR" : "en-US";

  const mode = MODE_COLOR[np.readingMode] ?? "#2647d6";
  const dateLabel = np.createdAt
    ? new Date(np.createdAt).toLocaleDateString(locale, { month: "short", day: "numeric" })
    : null;

  return (
    <article
      className={`w-[360px] overflow-hidden rounded-[12px] border-[1.5px] ${className ?? ""}`}
      style={{
        backgroundColor: "var(--surface)",
        color: "var(--foreground)",
        borderColor: "var(--foreground)",
        boxShadow: "4px 5px 0px var(--foreground)",
        ...style,
      }}
      onMouseDown={onMouseDown}
    >
      {/* Masthead */}
      <div
        className="flex items-center justify-between px-3.5 py-2"
        style={{ backgroundColor: "#111827", color: "#fff" }}
      >
        <span className="text-[0.62rem] font-black uppercase tracking-[0.12em] opacity-70">
          {dateLabel ? `${t("card.shared")} ${dateLabel}` : "Kişisel"}
        </span>
        <span
          className="rounded-full px-1.5 py-0.5 text-[0.58rem] font-black uppercase text-white"
          style={{ backgroundColor: mode }}
        >
          {t(`mode.${np.readingMode}` as any)}
        </span>
      </div>

      <div className="px-4 pt-4">
        <h3 className="mb-1 font-serif text-[1.22rem] font-black leading-tight tracking-tight">
          {np.name}
        </h3>
        <div className="mb-2 flex items-center gap-1.5">
          <Avatar name={np.curator} />
          <span className="text-[0.74rem] font-bold" style={{ color: "var(--text-muted)" }}>
            {t("action.by")} {np.curator}
          </span>
        </div>
        {np.description && (
          <p className="mb-3 line-clamp-2 text-[0.78rem] leading-relaxed" style={{ color: "var(--text-soft)" }}>
            {np.description}
          </p>
        )}

        <div
          className="mb-3 grid h-[100px] gap-1 rounded-lg p-1"
          style={{
            gridTemplateColumns: "1.2fr 1fr 1fr",
            gridTemplateRows: "repeat(4, 1fr)",
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
          }}
        >
          {[
            { gridColumn: "1", gridRow: "1 / 3" },
            { gridColumn: "2 / 4", gridRow: "1" },
            { gridColumn: "2", gridRow: "2" },
            { gridColumn: "3", gridRow: "2" },
            { gridColumn: "1", gridRow: "3 / 5" },
            { gridColumn: "2 / 4", gridRow: "3 / 5" },
          ].map((s, idx) => (
            <div
              key={idx}
              style={{ ...s, borderRadius: 5, border: "1px solid var(--border)", backgroundColor: slotColor(np.widgets[idx]?.kind ?? "news") }}
            />
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {tagsFor(np, t).map((tagStr) => (
            <span
              key={tagStr}
              className="rounded-full border px-2 py-0.5 text-[0.64rem] font-bold"
              style={{ borderColor: "var(--border)", color: "var(--text-soft)" }}
            >
              {tagStr}
            </span>
          ))}
          <span
            className="rounded-full px-2 py-0.5 text-[0.64rem] font-bold"
            style={{ border: `1px solid ${mode}40`, color: mode, backgroundColor: `${mode}0f` }}
          >
            {np.widgetCount} {t("widget.widgetsCount")}
          </span>
        </div>
      </div>

      {/* Footer actions */}
      <div className="grid border-t-[1.5px]" style={{ borderColor: "var(--foreground)", gridTemplateColumns: follow ? "1fr 1fr" : "1fr" }}>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="py-3 text-center text-[0.8rem] font-extrabold"
          style={{ color: "var(--foreground)", borderRight: follow ? "1px solid var(--foreground)" : undefined }}
        >
          {t("action.open")}
        </button>
        {follow && (
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              follow.onToggle();
            }}
            disabled={follow.busy}
            className="py-3 text-center text-[0.8rem] font-extrabold disabled:opacity-60"
            style={
              follow.isFollowing
                ? { backgroundColor: "#f0fdf4", color: "#059669" }
                : { backgroundColor: "var(--foreground)", color: "var(--surface)" }
            }
          >
            {follow.isFollowing ? t("follow.following") : t("follow.follow")}
          </button>
        )}
      </div>
    </article>
  );
}
