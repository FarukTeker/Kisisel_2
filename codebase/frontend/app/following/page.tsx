"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store";
import { useSettingsStore } from "@/features/settings/store";
import { useFollowingFeed, useUnfollow } from "@/features/follow/queries";
import NewspaperCard from "@/components/news/NewspaperCard";
import { useT } from "@/features/i18n/useT";

export default function FollowingPage() {
  const router = useRouter();
  const t = useT();
  const token = useAuthStore((s) => s.token);
  const applySettings = useSettingsStore((s) => s.apply);
  const { data: feed, isLoading } = useFollowingFeed();
  const unfollow = useUnfollow();

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);
  useEffect(() => applySettings(), [applySettings]);

  if (!token) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <header className="sticky top-0 z-20 border-b border-line bg-surface/85 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.1em]" style={{ color: "var(--primary)" }}>
              {t("follow.title")}
            </p>
            <h1 className="font-serif text-2xl font-black tracking-tight text-ink">
              {t("follow.dailyNewspapers")}
            </h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/discover"
              className="rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-extrabold uppercase text-ink hover:bg-surface-hover"
            >
              {t("nav.discover")}
            </Link>
            <Link
              href="/"
              className="rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-extrabold uppercase text-ink hover:bg-surface-hover"
            >
              {t("action.myNewspaper")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {isLoading ? (
          <p className="text-sm font-semibold text-muted">{t("action.loading")}</p>
        ) : (feed?.length ?? 0) === 0 ? (
          <div className="mx-auto mt-20 max-w-md text-center">
            <p className="mb-3 text-lg font-bold text-ink">{t("follow.emptyTitle")}</p>
            <p className="mb-5 text-sm text-muted">
              {t("follow.emptySubtitle")}
            </p>
            <Link
              href="/discover"
              className="inline-block rounded-pill bg-brand px-5 py-2 text-sm font-extrabold uppercase text-white"
            >
              {t("follow.goDiscover")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 sm:justify-start">
            {feed!.map((np) => (
              <NewspaperCard
                key={np.slug}
                np={np}
                onOpen={() => router.push(`/newspaper/${np.slug}`)}
                follow={{
                  isFollowing: true,
                  busy: unfollow.isPending,
                  onToggle: () => unfollow.mutate(np.curatorId),
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
