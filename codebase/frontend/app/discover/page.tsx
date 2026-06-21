"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store";
import { useSettingsStore } from "@/features/settings/store";
import { useDiscover } from "@/features/dashboard/queries";
import { useFollow, useFollowingIds, useUnfollow } from "@/features/follow/queries";
import NewspaperCard from "@/components/news/NewspaperCard";

const ROTATIONS = [-0.8, 0.6, -0.5, 0.9, -0.4, 0.7, -0.6, 0.5];

export default function DiscoverPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const applySettings = useSettingsStore((s) => s.apply);
  const { data: newspapers, isLoading } = useDiscover();
  const { ids: followedIds } = useFollowingIds();
  const follow = useFollow();
  const unfollow = useUnfollow();

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const panRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const cardRef = useRef<{ slug: string; lastX: number; lastY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);
  useEffect(() => applySettings(), [applySettings]);

  const initialPositions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    (newspapers ?? []).forEach((np, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      map[np.slug] = { x: col * 420 - 420 + (row % 2) * 60, y: row * 340 - 120 };
    });
    return map;
  }, [newspapers]);
  useEffect(() => setPositions(initialPositions), [initialPositions]);

  function onBackgroundDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest(".np-card")) return;
    panRef.current = { startX: e.clientX, startY: e.clientY, origX: pan.x, origY: pan.y };
    setDragging(true);
  }
  function onCardDown(e: React.MouseEvent, slug: string) {
    if ((e.target as HTMLElement).closest("button")) return;
    e.stopPropagation();
    cardRef.current = { slug, lastX: e.clientX, lastY: e.clientY };
    setDragging(true);
  }
  function onMove(e: React.MouseEvent) {
    if (cardRef.current) {
      const { slug, lastX, lastY } = cardRef.current;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      cardRef.current = { slug, lastX: e.clientX, lastY: e.clientY };
      setPositions((prev) => ({ ...prev, [slug]: { x: (prev[slug]?.x ?? 0) + dx, y: (prev[slug]?.y ?? 0) + dy } }));
    } else if (panRef.current) {
      const { startX, startY, origX, origY } = panRef.current;
      setPan({ x: origX + (e.clientX - startX), y: origY + (e.clientY - startY) });
    }
  }
  function onUp() {
    cardRef.current = null;
    panRef.current = null;
    setDragging(false);
  }

  if (!token) return null;

  return (
    <div
      onMouseDown={onBackgroundDown}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      className="relative h-screen w-screen select-none overflow-hidden"
      style={{
        background: "var(--background)",
        backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        cursor: dragging ? "grabbing" : "grab",
      }}
    >
      <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
        {(newspapers ?? []).map((np, i) => {
          const canFollow = np.curatorId !== user?.id;
          const isFollowing = followedIds.has(np.curatorId);
          const pos = positions[np.slug] ?? { x: 0, y: 0 };
          return (
            <NewspaperCard
              key={np.slug}
              np={np}
              onOpen={() => router.push(`/newspaper/${np.slug}`)}
              onMouseDown={(e) => onCardDown(e, np.slug)}
              className="np-card absolute"
              style={{ left: pos.x, top: pos.y, transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)`, cursor: "grab" }}
              follow={
                canFollow
                  ? {
                      isFollowing,
                      busy: follow.isPending || unfollow.isPending,
                      onToggle: () =>
                        isFollowing
                          ? unfollow.mutate(np.curatorId)
                          : follow.mutate(np.curatorId),
                    }
                  : undefined
              }
            />
          );
        })}
      </div>

      {/* Fixed chrome */}
      <div
        className="pointer-events-none fixed left-1/2 top-6 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border-[1.5px] px-4 py-2"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--foreground)", boxShadow: "2px 2px 0 var(--foreground)" }}
      >
        <span className="text-[0.65rem] font-black uppercase tracking-[0.1em]" style={{ color: "var(--primary)" }}>
          Discover
        </span>
        <span className="h-[3px] w-[3px] rounded-full" style={{ backgroundColor: "var(--border)" }} />
        <span className="text-[0.65rem] font-bold" style={{ color: "var(--text-muted)" }}>
          {newspapers?.length ?? 0} newspapers
        </span>
      </div>

      <div className="fixed left-6 top-6 z-40 flex gap-2">
        <Link
          href="/"
          onMouseDown={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-2 text-[0.75rem] font-extrabold"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--foreground)", color: "var(--foreground)", boxShadow: "2px 2px 0 var(--foreground)" }}
        >
          ← My newspaper
        </Link>
        <Link
          href="/following"
          onMouseDown={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-2 text-[0.75rem] font-extrabold"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--foreground)", color: "var(--foreground)", boxShadow: "2px 2px 0 var(--foreground)" }}
        >
          Following →
        </Link>
      </div>

      {!isLoading && (newspapers?.length ?? 0) === 0 && (
        <div className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>
            No shared newspapers yet. Share yours from the dashboard to see it here.
          </p>
        </div>
      )}

      {!dragging && (
        <div
          className="pointer-events-none fixed bottom-7 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-[0.72rem] font-bold text-white"
          style={{ backgroundColor: "rgba(17,24,39,0.8)" }}
        >
          Drag background to explore · Grab cards to rearrange
        </div>
      )}
    </div>
  );
}
