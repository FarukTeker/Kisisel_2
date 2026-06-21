"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";
import { useLogout } from "@/features/auth/queries";
import type { ReadingMode } from "@/features/articles/reading-mode";

const MODES: { id: ReadingMode; label: string }[] = [
  { id: "S", label: "Summary" },
  { id: "H", label: "Headline" },
  { id: "F", label: "Focused" },
];

interface NavbarProps {
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  onShare: () => void;
  onSettings: () => void;
}

export default function Navbar({
  readingMode,
  setReadingMode,
  editMode,
  setEditMode,
  onShare,
  onSettings,
}: NavbarProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        {/* Left: date + brand */}
        <div className="flex items-center gap-3">
          <span className="rounded-pill border border-line bg-surface-hover px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide text-muted">
            {today}
          </span>
          <h1 className="flex items-center gap-1.5 font-serif text-xl font-black uppercase tracking-tight text-ink">
            <span className="h-2 w-2 rounded-full bg-brand" />
            Kişisel
          </h1>
        </div>

        {/* Center: reading-mode selector */}
        <div className="flex items-center gap-1 rounded-pill border border-line bg-surface p-1 shadow-inner">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setReadingMode(m.id)}
              className={`rounded-pill px-3 py-1 text-xs font-extrabold uppercase transition-colors ${
                readingMode === m.id
                  ? "bg-brand text-white"
                  : "text-ink-soft hover:bg-surface-hover"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/discover"
            className="hidden rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-extrabold uppercase text-ink shadow-sm hover:bg-surface-hover sm:block"
          >
            Discover
          </Link>
          <Link
            href="/following"
            className="hidden rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-extrabold uppercase text-ink shadow-sm hover:bg-surface-hover sm:block"
          >
            Following
          </Link>
          <button
            onClick={onShare}
            className="hidden rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-extrabold uppercase text-ink shadow-sm hover:bg-surface-hover sm:block"
          >
            Share
          </button>

          {/* Edit toggle switch */}
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2"
            aria-pressed={editMode}
          >
            <span className="text-xs font-extrabold uppercase text-ink-soft">Edit</span>
            <span
              className={`relative h-[22px] w-[42px] rounded-pill transition-colors ${
                editMode ? "bg-brand" : "bg-surface-hover border border-line"
              }`}
            >
              <span
                className={`absolute top-[2px] h-[16px] w-[16px] rounded-full bg-white shadow transition-all ${
                  editMode ? "left-[22px]" : "left-[3px]"
                }`}
              />
            </span>
          </button>

          {editMode && (
            <button
              onClick={onSettings}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-ink hover:bg-surface-hover"
              aria-label="Settings"
              title="Settings"
            >
              ⚙
            </button>
          )}

          <span className="hidden text-sm font-bold text-ink-soft md:block">
            {user?.name}
          </span>
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-sm font-bold text-red-500 hover:bg-surface-hover"
            aria-label="Log out"
            title="Log out"
          >
            ⎋
          </button>
        </div>
      </div>
    </header>
  );
}
