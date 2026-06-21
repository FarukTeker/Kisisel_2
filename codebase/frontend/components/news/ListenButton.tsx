"use client";

import { useAudioStore } from "@/features/audio/store";
import { useT } from "@/features/i18n/useT";

type Status = "idle" | "loading" | "playing" | "paused" | "error";

/**
 * Triggers AI narration playback for an article using the global player.
 */
export default function ListenButton({
  articleId,
  title,
  publisher,
}: {
  articleId: string;
  title: string;
  publisher: string;
}) {
  const t = useT();
  const { currentArticleId, status, play, pause, resume } = useAudioStore();

  const isCurrent = currentArticleId === articleId;
  const currentStatus = isCurrent ? status : "idle";

  function toggle(e: React.MouseEvent) {
    e.stopPropagation();

    if (isCurrent) {
      if (status === "playing") {
        pause();
      } else if (status === "paused") {
        resume();
      }
    } else {
      play(articleId, title, publisher);
    }
  }

  const label =
    currentStatus === "loading"
      ? t("audio.loading")
      : currentStatus === "playing"
        ? t("audio.stop")
        : currentStatus === "error"
          ? t("audio.error")
          : t("audio.listen");

  return (
    <button
      onClick={toggle}
      disabled={currentStatus === "loading"}
      className="inline-flex items-center gap-1.5 rounded-pill border border-line px-2 py-0.5 text-[0.7rem] font-bold uppercase text-ink-soft hover:bg-surface-hover disabled:opacity-60"
      title={label}
    >
      <StatusIcon status={currentStatus} />
      <span>{label}</span>
    </button>
  );
}

function StatusIcon({ status }: { status: Status }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (status === "loading") {
    return (
      <svg {...common} className="animate-spin">
        <path d="M21 12a9 9 0 1 1-6.22-8.56" />
      </svg>
    );
  }
  if (status === "playing") {
    return (
      <svg {...common}>
        <rect x="6" y="5" width="4" height="14" rx="1" />
        <rect x="14" y="5" width="4" height="14" rx="1" />
      </svg>
    );
  }
  if (status === "error") {
    return (
      <svg {...common}>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

