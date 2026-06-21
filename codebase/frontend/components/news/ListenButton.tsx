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

  const icon =
    status === "loading" ? "⏳" : status === "playing" ? "⏸" : status === "error" ? "⚠" : "🔊";

  return (
    <button
      onClick={toggle}
      disabled={status === "loading"}
      className="inline-flex items-center gap-1 rounded-pill border border-line px-2 py-0.5 text-[0.7rem] font-bold uppercase text-ink-soft hover:bg-surface-hover disabled:opacity-60"
      title={label}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
