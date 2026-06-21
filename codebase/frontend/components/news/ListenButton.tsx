"use client";

import { useEffect, useRef, useState } from "react";
import { env } from "@/lib/env";
import { useSettingsStore } from "@/features/settings/store";
import { useT } from "@/features/i18n/useT";

type Status = "idle" | "loading" | "playing" | "error";

/**
 * Plays the AI narration ("Sesli Anlatım") for an article. Streams the public
 * /articles/:id/audio endpoint in the current language. The first click for a
 * given article+language is slow (the backend generates the script + audio,
 * then caches it); later clicks are instant.
 */
export default function ListenButton({ articleId }: { articleId: string }) {
  const t = useT();
  const language = useSettingsStore((s) => s.language);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  // Stop and reset when the language changes (the cached audio differs per lang).
  useEffect(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setStatus("idle");
  }, [language]);

  // Clean up on unmount.
  useEffect(() => () => audioRef.current?.pause(), []);

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation();

    if (status === "playing") {
      audioRef.current?.pause();
      setStatus("idle");
      return;
    }

    const url = `${env.NEXT_PUBLIC_API_URL}/articles/${articleId}/audio?lang=${language}`;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setStatus("idle");
    audio.onerror = () => setStatus("error");

    setStatus("loading");
    try {
      await audio.play();
      setStatus("playing");
    } catch {
      setStatus("error");
    }
  }

  const label =
    status === "loading"
      ? t("audio.loading")
      : status === "playing"
        ? t("audio.stop")
        : status === "error"
          ? t("audio.error")
          : t("audio.listen");

  return (
    <button
      onClick={toggle}
      disabled={status === "loading"}
      className="inline-flex items-center gap-1.5 rounded-pill border border-line px-2 py-0.5 text-[0.7rem] font-bold uppercase text-ink-soft hover:bg-surface-hover disabled:opacity-60"
      title={label}
    >
      <StatusIcon status={status} />
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
