"use client";

import { useAudioStore } from "@/features/audio/store";
import { useT } from "@/features/i18n/useT";

export default function QueueButton({
  articleId,
  title,
  publisher,
}: {
  articleId: string;
  title: string;
  publisher: string;
}) {
  const t = useT();
  const { currentArticleId, queue, addToQueue, removeFromQueue } = useAudioStore();

  const isCurrent = currentArticleId === articleId;
  const isQueued = queue.some((item) => item.id === articleId);

  const handleToggleQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) return;

    if (isQueued) {
      removeFromQueue(articleId);
    } else {
      addToQueue(articleId, title, publisher);
    }
  };

  const label = isQueued ? t("audio.removeFromQueue") : t("audio.addToQueue");

  if (isCurrent) {
    return (
      <div className="relative group/tooltip flex items-center justify-center">
        <span
          className="inline-flex h-[23px] w-[23px] items-center justify-center rounded-full border border-brand bg-brand/10 text-brand"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        </span>
        <span className="pointer-events-none absolute bottom-full mb-1.5 scale-75 opacity-0 group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 transition-all duration-150 rounded bg-ink px-2 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-wider text-surface shadow-md whitespace-nowrap z-30">
          {t("audio.nowPlaying")}
        </span>
      </div>
    );
  }

  return (
    <div className="relative group/tooltip flex items-center justify-center">
      <button
        onClick={handleToggleQueue}
        className={`inline-flex h-[23px] w-[23px] items-center justify-center rounded-full border transition-all hover:scale-105 active:scale-95 focus:outline-none ${
          isQueued
            ? "border-brand bg-brand text-white hover:bg-brand/90"
            : "border-line bg-surface text-ink-soft hover:bg-surface-hover hover:text-ink"
        }`}
        aria-label={label}
      >
        {isQueued ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
      </button>
      <span className="pointer-events-none absolute bottom-full mb-1.5 scale-75 opacity-0 group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 transition-all duration-150 rounded bg-ink px-2 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-wider text-surface shadow-md whitespace-nowrap z-30">
        {label}
      </span>
    </div>
  );
}

