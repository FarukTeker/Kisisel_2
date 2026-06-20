"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store";
import { useSettingsStore } from "@/features/settings/store";
import { useDiscover } from "@/features/dashboard/queries";
import type { DiscoverNewspaper } from "@/features/dashboard/schemas";

const MODE_LABEL: Record<string, string> = { S: "Scan", H: "Skim", F: "Full" };
const MODE_COLOR: Record<string, string> = { S: "#2647d6", H: "#7c3aed", F: "#059669" };
const ROTATIONS = [-0.8, 0.6, -0.5, 0.9, -0.4, 0.7, -0.6, 0.5];

function slotColor(kind: string): string {
  if (kind === "editorial") return "#dbeafe";
  if (kind === "popular" || kind === "random") return "#ede9fe";
  return "#dcfce7";
}

function tagsFor(np: DiscoverNewspaper): string[] {
  const tags = new Set<string>();
  np.widgets.forEach((w) => {
    if (w.kind === "editorial") tags.add("Editorial");
    if (w.kind === "popular") tags.add("Popular");
    if (w.kind === "random") tags.add("Serendipity");
    if (w.kind === "news") tags.add("News");
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

export default function DiscoverPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const applySettings = useSettingsStore((s) => s.apply);
  const { data: newspapers, isLoading } = useDiscover();

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const panRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const cardRef = useRef<{ slug: string; lastX: number; lastY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);
  useEffect(() => applySettings(), [applySettings]);

  // Scatter cards across the canvas once data arrives.
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
    const t = e.target as HTMLElement;
    if (t.closest(".np-card")) return;
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
      className="relative h-screen w-screen overflow-hidden select-none"
      style={{
        background: "var(--background)",
        backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        cursor: dragging ? "grabbing" : "grab",
      }}
    >
      {/* Canvas layer */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
      >
        {(newspapers ?? []).map((np, i) => {
          const pos = positions[np.slug] ?? { x: 0, y: 0 };
          const mode = MODE_COLOR[np.readingMode] ?? "#2647d6";
          return (
            <article
              key={np.slug}
              className="np-card absolute w-[360px] overflow-hidden rounded-[12px] border-[1.5px]"
              style={{
                left: pos.x,
                top: pos.y,
                backgroundColor: "var(--surface)",
                color: "var(--foreground)",
                borderColor: "var(--foreground)",
                boxShadow: "4px 5px 0px var(--foreground)",
                transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)`,
                cursor: "grab",
              }}
              onMouseDown={(e) => onCardDown(e, np.slug)}
            >
              {/* Masthead / drag handle */}
              <div
                className="flex items-center justify-between px-3.5 py-2"
                style={{ backgroundColor: "#111827", color: "#fff" }}
              >
                <span className="text-[0.62rem] font-black uppercase tracking-[0.12em] opacity-70">
                  Kişisel
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[0.58rem] font-black uppercase text-white"
                  style={{ backgroundColor: mode }}
                >
                  {MODE_LABEL[np.readingMode]}
                </span>
              </div>

              <div className="px-4 pt-4">
                <h3 className="mb-1 font-serif text-[1.22rem] font-black leading-tight tracking-tight">
                  {np.name}
                </h3>
                <div className="mb-2 flex items-center gap-1.5">
                  <Avatar name={np.curator} />
                  <span className="text-[0.74rem] font-bold" style={{ color: "var(--text-muted)" }}>
                    by {np.curator}
                  </span>
                </div>
                {np.description && (
                  <p className="mb-3 line-clamp-2 text-[0.78rem] leading-relaxed" style={{ color: "var(--text-soft)" }}>
                    {np.description}
                  </p>
                )}

                {/* Layout preview */}
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
                  {tagsFor(np).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border px-2 py-0.5 text-[0.64rem] font-bold"
                      style={{ borderColor: "var(--border)", color: "var(--text-soft)" }}
                    >
                      {t}
                    </span>
                  ))}
                  <span
                    className="rounded-full px-2 py-0.5 text-[0.64rem] font-bold"
                    style={{ border: `1px solid ${mode}40`, color: mode, backgroundColor: `${mode}0f` }}
                  >
                    {np.widgetCount} widgets
                  </span>
                </div>
              </div>

              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/newspaper/${np.slug}`);
                }}
                className="w-full border-t-[1.5px] py-3 text-center text-[0.8rem] font-extrabold"
                style={{ borderColor: "var(--foreground)", color: "var(--foreground)" }}
              >
                Open ↗
              </button>
            </article>
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

      <Link
        href="/"
        onMouseDown={(e) => e.stopPropagation()}
        className="fixed left-6 top-6 z-40 flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-2 text-[0.75rem] font-extrabold"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--foreground)", color: "var(--foreground)", boxShadow: "2px 2px 0 var(--foreground)" }}
      >
        ← My newspaper
      </Link>

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
