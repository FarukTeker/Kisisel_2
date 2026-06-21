"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Responsive, useContainerWidth, type Layout } from "react-grid-layout";
import Widget from "@/components/news/Widget";
import { fetchSharedNewspaper, type SharedNewspaper } from "@/features/dashboard/api";
import { useAuthStore } from "@/features/auth/store";
import { useSettingsStore } from "@/features/settings/store";
import { useFollow, useFollowingIds, useUnfollow } from "@/features/follow/queries";

export default function SharedNewspaperPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [paper, setPaper] = useState<SharedNewspaper | null>(null);
  const [error, setError] = useState(false);
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1200 });

  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const applySettings = useSettingsStore((s) => s.apply);
  const { ids: followedIds } = useFollowingIds();
  const follow = useFollow();
  const unfollow = useUnfollow();

  useEffect(() => {
    fetchSharedNewspaper(slug).then(setPaper).catch(() => setError(true));
  }, [slug]);
  useEffect(() => applySettings(), [applySettings]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm font-semibold text-muted">Newspaper not found.</p>
      </main>
    );
  }
  if (!paper) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm font-semibold text-muted">Loading…</p>
      </main>
    );
  }

  const { state } = paper;
  const cols = { lg: state.columns, md: state.columns, sm: 1, xs: 1, xxs: 1 };
  const rgLayout = state.layout as unknown as Layout;

  const canFollow = Boolean(token) && paper.curatorId !== user?.id;
  const isFollowing = followedIds.has(paper.curatorId);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/85 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-1.5 font-serif text-xl font-black tracking-tight text-ink">
              <span className="h-2 w-2 rounded-full bg-brand" />
              {paper.name}
            </h1>
            <p className="text-xs font-bold text-muted">by {paper.curatorName}</p>
          </div>

          <div className="flex items-center gap-2">
            {canFollow && (
              <button
                onClick={() =>
                  isFollowing
                    ? unfollow.mutate(paper.curatorId)
                    : follow.mutate(paper.curatorId)
                }
                disabled={follow.isPending || unfollow.isPending}
                className="rounded-pill px-4 py-1.5 text-xs font-extrabold uppercase disabled:opacity-60"
                style={
                  isFollowing
                    ? { backgroundColor: "#f0fdf4", color: "#059669", border: "1px solid #bbf7d0" }
                    : { backgroundColor: "var(--foreground)", color: "var(--surface)" }
                }
              >
                {isFollowing ? "✓ Following" : "Follow"}
              </button>
            )}
            <Link
              href="/discover"
              className="rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-extrabold uppercase text-ink hover:bg-surface-hover"
            >
              Discover
            </Link>
            {token && (
              <Link
                href="/"
                className="hidden rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-extrabold uppercase text-ink hover:bg-surface-hover sm:block"
              >
                My newspaper
              </Link>
            )}
          </div>
        </div>
      </header>

      <main ref={containerRef} className="mx-auto max-w-6xl px-4 py-6">
        {mounted && (
          <Responsive
            className="feed-rgl"
            width={width}
            layouts={{ lg: rgLayout, md: rgLayout, sm: rgLayout, xs: rgLayout, xxs: rgLayout }}
            breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 0, xxs: 0 }}
            cols={cols}
            rowHeight={state.readingMode === "F" ? 120 : 96}
            margin={[20, 20]}
            containerPadding={[0, 0]}
            dragConfig={{ enabled: false }}
            resizeConfig={{ enabled: false }}
          >
            {state.widgets.map((w) => (
              <div key={w.id}>
                <Widget config={w} mode={state.readingMode} />
              </div>
            ))}
          </Responsive>
        )}
      </main>
    </div>
  );
}
