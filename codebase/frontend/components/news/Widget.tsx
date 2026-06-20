"use client";

import {
  useArticles,
  usePopularArticles,
  useRandomArticles,
} from "@/features/articles/queries";
import type { Article } from "@/features/articles/schemas";
import {
  readingContent,
  type ReadingMode,
} from "@/features/articles/reading-mode";
import type { WidgetConfig } from "@/features/dashboard/widgets";

interface WidgetProps {
  config: WidgetConfig;
  mode: ReadingMode;
  editMode?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onSettings?: () => void;
  onDelete?: () => void;
}

const IMAGE_LAYOUTS = new Set(["card1", "card2", "card5", "card6"]);

export default function Widget({
  config,
  mode,
  editMode,
  selected,
  onSelect,
  onSettings,
  onDelete,
}: WidgetProps) {
  const accent =
    config.kind === "editorial"
      ? "skim"
      : config.kind === "popular" || config.kind === "random"
        ? "full"
        : "scan";

  return (
    <div
      onMouseDown={editMode ? onSelect : undefined}
      className={`flex h-full flex-col overflow-hidden rounded-card border bg-surface shadow-card transition-shadow ${
        selected ? "border-brand ring-2 ring-brand/40" : "border-line"
      }`}
    >
      <Header
        title={config.title}
        accent={accent}
        badge={config.kind}
        editMode={editMode}
        onSettings={onSettings}
        onDelete={onDelete}
      />
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {config.kind === "editorial" ? (
          <p className="text-sm leading-relaxed text-ink-soft">
            {config.editorialBody || "Add your editorial note in widget settings."}
          </p>
        ) : (
          <ArticleBody config={config} mode={mode} />
        )}
      </div>
    </div>
  );
}

function ArticleBody({ config, mode }: { config: WidgetConfig; mode: ReadingMode }) {
  const news = useArticles(config.kind === "news" ? config.publisherId : undefined, 10);
  const popular = usePopularArticles(8);
  const random = useRandomArticles(8);

  const source =
    config.kind === "popular" ? popular : config.kind === "random" ? random : news;

  if (source.isLoading) return <p className="text-sm text-muted">Loading…</p>;
  if (source.isError || !source.data || source.data.length === 0)
    return <p className="text-sm text-muted">No articles yet.</p>;

  let articles = source.data;
  if (config.categoryFilter && config.categoryFilter !== "All") {
    const filtered = articles.filter((a) => a.category === config.categoryFilter);
    if (filtered.length > 0) articles = filtered;
  }

  const showImage = IMAGE_LAYOUTS.has(config.layoutType);
  const visible = mode === "F" ? articles.slice(0, 1) : articles;

  return (
    <div className="flex flex-col gap-3">
      {visible.map((article) =>
        mode === "F" ? (
          <FullCard key={article.id} article={article} showImage={showImage} />
        ) : mode === "H" ? (
          <SkimRow key={article.id} article={article} />
        ) : (
          <ScanRow key={article.id} article={article} showImage={showImage} />
        ),
      )}
    </div>
  );
}

function FullCard({ article, showImage }: { article: Article; showImage: boolean }) {
  const { text, pending } = readingContent(article, "F");
  return (
    <article className="flex flex-col gap-2">
      {showImage && article.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.imageUrl} alt="" className="h-40 w-full rounded-lg object-cover" />
      )}
      <Meta article={article} />
      <h3 className="font-serif text-lg font-bold leading-tight text-ink">{article.title}</h3>
      <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{text}</p>
      <Footer article={article} pending={pending} />
    </article>
  );
}

function ScanRow({ article, showImage }: { article: Article; showImage: boolean }) {
  const { text, pending } = readingContent(article, "S");
  return (
    <article className="flex gap-3 border-b border-line pb-3 last:border-0">
      {showImage && article.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
      )}
      <div className="min-w-0">
        <Meta article={article} />
        <h3 className="text-sm font-bold leading-snug text-ink">{article.title}</h3>
        <p className="mt-1 line-clamp-2 text-[0.8rem] leading-relaxed text-ink-soft">{text}</p>
        {pending && <PendingPill />}
      </div>
    </article>
  );
}

function SkimRow({ article }: { article: Article }) {
  const { headings, pending } = readingContent(article, "H");
  return (
    <article className="border-b border-line pb-3 last:border-0">
      <Meta article={article} />
      <h3 className="text-sm font-bold leading-snug text-ink">{article.title}</h3>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[0.78rem] text-ink-soft">
        {headings.slice(0, 4).map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>
      {pending && <PendingPill />}
    </article>
  );
}

function Meta({ article }: { article: Article }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-wide text-muted">
      <span>{article.publisher}</span>
      <span>•</span>
      <span>{article.category}</span>
      <span>•</span>
      <span>{article.date}</span>
    </div>
  );
}

function Footer({ article, pending }: { article: Article; pending: boolean }) {
  return (
    <div className="mt-1 flex items-center gap-2">
      <a
        href={article.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[0.7rem] font-bold uppercase text-brand hover:underline"
      >
        Open source ↗
      </a>
      {pending && <PendingPill />}
    </div>
  );
}

function PendingPill() {
  return (
    <span className="mt-1 inline-block rounded-pill bg-amber-100 px-2 py-0.5 text-[0.6rem] font-bold uppercase text-amber-700">
      AI generating…
    </span>
  );
}

function Header({
  title,
  accent,
  badge,
  editMode,
  onSettings,
  onDelete,
}: {
  title: string;
  accent: "scan" | "skim" | "full";
  badge: string;
  editMode?: boolean;
  onSettings?: () => void;
  onDelete?: () => void;
}) {
  const dot = accent === "scan" ? "bg-scan" : accent === "skim" ? "bg-skim" : "bg-full";
  return (
    <header className="flex items-center justify-between border-b border-line px-4 py-3">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <h2 className="font-serif text-base font-extrabold text-ink">{title}</h2>
      </div>
      {editMode ? (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSettings?.();
            }}
            className="widget-settings-btn rounded-md border border-line px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-ink-soft hover:bg-surface-hover"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="rounded-md border border-line px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-red-500 hover:bg-red-50"
          >
            ✕
          </button>
        </div>
      ) : (
        <span className="rounded-pill border border-line px-2 py-0.5 text-[0.6rem] font-bold uppercase text-muted">
          {badge}
        </span>
      )}
    </header>
  );
}
