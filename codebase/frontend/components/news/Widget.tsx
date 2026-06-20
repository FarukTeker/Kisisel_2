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
}

/** Renders one dashboard widget's content from the pre-enriched articles. */
export default function Widget({ config, mode }: WidgetProps) {
  if (config.kind === "editorial") {
    return (
      <WidgetShell title={config.title} accent="skim">
        <p className="text-sm leading-relaxed text-ink-soft">
          {config.editorialBody}
        </p>
      </WidgetShell>
    );
  }
  return <ArticleWidget config={config} mode={mode} />;
}

function ArticleWidget({ config, mode }: WidgetProps) {
  const news = useArticles(
    config.kind === "news" ? config.sourceId : undefined,
    8,
  );
  const popular = usePopularArticles(6);
  const random = useRandomArticles(6);

  const source =
    config.kind === "popular"
      ? popular
      : config.kind === "random"
        ? random
        : news;

  const accent =
    config.kind === "popular" || config.kind === "random" ? "full" : "scan";

  if (source.isLoading) {
    return (
      <WidgetShell title={config.title} accent={accent}>
        <p className="text-sm text-muted">Loading…</p>
      </WidgetShell>
    );
  }
  if (source.isError || !source.data || source.data.length === 0) {
    return (
      <WidgetShell title={config.title} accent={accent}>
        <p className="text-sm text-muted">No articles yet.</p>
      </WidgetShell>
    );
  }

  // Full mode features one article; Scan/Skim show a list.
  const articles = mode === "F" ? source.data.slice(0, 1) : source.data;

  return (
    <WidgetShell title={config.title} accent={accent} badge={config.kind}>
      <div className="flex flex-col gap-3">
        {articles.map((article) =>
          mode === "F" ? (
            <FullCard key={article.id} article={article} />
          ) : mode === "H" ? (
            <SkimRow key={article.id} article={article} />
          ) : (
            <ScanRow key={article.id} article={article} />
          ),
        )}
      </div>
    </WidgetShell>
  );
}

function FullCard({ article }: { article: Article }) {
  const { text, pending } = readingContent(article, "F");
  return (
    <article className="flex flex-col gap-2">
      {article.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.imageUrl}
          alt=""
          className="h-40 w-full rounded-lg object-cover"
        />
      )}
      <Meta article={article} />
      <h3 className="font-serif text-lg font-bold leading-tight text-ink">
        {article.title}
      </h3>
      <p className="line-clamp-6 text-sm leading-relaxed text-ink-soft">
        {text}
      </p>
      <Footer article={article} pending={pending} />
    </article>
  );
}

function ScanRow({ article }: { article: Article }) {
  const { text, pending } = readingContent(article, "S");
  return (
    <article className="border-b border-line pb-3 last:border-0">
      <Meta article={article} />
      <h3 className="text-sm font-bold leading-snug text-ink">{article.title}</h3>
      <p className="mt-1 line-clamp-2 text-[0.8rem] leading-relaxed text-ink-soft">
        {text}
      </p>
      <Footer article={article} pending={pending} />
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
    <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wide text-muted">
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
    <span className="rounded-pill bg-amber-100 px-2 py-0.5 text-[0.6rem] font-bold uppercase text-amber-700">
      AI generating…
    </span>
  );
}

function WidgetShell({
  title,
  accent,
  badge,
  children,
}: {
  title: string;
  accent: "scan" | "skim" | "full";
  badge?: string;
  children: React.ReactNode;
}) {
  const accentColor =
    accent === "scan" ? "bg-scan" : accent === "skim" ? "bg-skim" : "bg-full";
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${accentColor}`} />
          <h2 className="font-serif text-base font-extrabold text-ink">{title}</h2>
        </div>
        {badge && (
          <span className="rounded-pill border border-line px-2 py-0.5 text-[0.6rem] font-bold uppercase text-muted">
            {badge}
          </span>
        )}
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-3">{children}</div>
    </div>
  );
}
