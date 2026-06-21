"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioStore } from "@/features/audio/store";
import { useSettingsStore } from "@/features/settings/store";
import { useAuthStore } from "@/features/auth/store";
import { env } from "@/lib/env";

export default function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadedRef = useRef<Set<string>>(new Set());
  const language = useSettingsStore((s) => s.language);
  const token = useAuthStore((s) => s.token);
  const [showQueue, setShowQueue] = useState(false);

  const {
    currentArticleId,
    title,
    publisher,
    status,
    currentTime,
    duration,
    seekTrigger,
    queue,
    pause,
    resume,
    stop,
    seek,
    setStatus,
    setDuration,
    setCurrentTime,
    clearSeekTrigger,
    playNext,
    removeFromQueue,
    clearQueue,
  } = useAudioStore();

  // Stop playback when the user logs out (token is cleared)
  useEffect(() => {
    if (!token) {
      stop();
    }
  }, [token, stop]);

  // Preload/pre-generate the next queued article in the background
  useEffect(() => {
    if (queue.length > 0) {
      const nextArticle = queue[0];
      const cacheKey = `${nextArticle.id}-${language}`;
      if (!preloadedRef.current.has(cacheKey)) {
        preloadedRef.current.add(cacheKey);

        const url = `${env.NEXT_PUBLIC_API_URL}/articles/${nextArticle.id}/audio?lang=${language}`;
        fetch(url).catch(() => {
          // Ignore errors, this is purely to trigger backend caching
        });
      }
    }
  }, [queue, language]);

  // Watch seekTrigger to perform imperative seek on audio element
  useEffect(() => {
    if (seekTrigger !== null && audioRef.current) {
      audioRef.current.currentTime = seekTrigger;
      setCurrentTime(seekTrigger);
      clearSeekTrigger();
    }
  }, [seekTrigger, clearSeekTrigger, setCurrentTime]);

  // Synchronize audio element play/pause state with store status
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (status === "playing") {
      audio.play().catch(() => setStatus("error"));
    } else if (status === "paused") {
      audio.pause();
    } else if (status === "idle") {
      audio.pause();
      if (audio.src) {
        audio.removeAttribute("src");
        audio.load();
      }
    }
  }, [status, setStatus]);

  // Load new audio source when currentArticleId or language changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentArticleId) {
      const url = `${env.NEXT_PUBLIC_API_URL}/articles/${currentArticleId}/audio?lang=${language}`;
      setStatus("loading");
      audio.src = url;
      audio.load();
      
      // Attempt playing immediately (browser usually allows if triggered by user click)
      audio.play()
        .then(() => setStatus("playing"))
        .catch(() => {
          // If autoplay fails, we are in loading/ready to play state
        });
    } else {
      setStatus("idle");
    }
  }, [currentArticleId, language, setStatus]);

  // Connect audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      playNext();
    };

    const onError = () => {
      setStatus("error");
    };

    const onCanPlay = () => {
      if (status === "loading") {
        audio.play()
          .then(() => setStatus("playing"))
          .catch(() => setStatus("error"));
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [status, setStatus, setDuration, setCurrentTime, playNext]);

  if (status === "idle") return null;

  // Format time (e.g. 125 -> 2:05)
  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity || time < 0) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const numSegments = 4;
  const segmentDuration = duration > 0 ? duration / numSegments : 0;
  const segments = Array.from({ length: numSegments });

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    seek(percentage * duration);
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-32px)] max-w-2xl -translate-x-1/2 rounded-2xl border border-line bg-surface/95 px-5 pb-3.5 pt-4 shadow-xl backdrop-blur-md animate-fade-in select-none">
      <audio ref={audioRef} />

      {/* Segmented Progress Bar */}
      <div
        onClick={handleTimelineClick}
        className="group relative mb-3.5 flex h-3 cursor-pointer items-center py-1"
      >
        <div className="flex w-full gap-1">
          {segments.map((_, i) => {
            const start = i * segmentDuration;
            const progress =
              duration > 0
                ? Math.max(
                    0,
                    Math.min(100, ((currentTime - start) / segmentDuration) * 100)
                  )
                : 0;
            return (
              <div
                key={i}
                className="relative h-1 flex-1 overflow-hidden rounded-full bg-border/40 transition-all group-hover:h-1.5"
              >
                <div
                  className="h-full bg-brand transition-[width] duration-75 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Timeline Junction Markers */}
        {duration > 0 &&
          Array.from({ length: numSegments - 1 }).map((_, idx) => {
            const markerPercent = ((idx + 1) / numSegments) * 100;
            const markerTime = (idx + 1) * segmentDuration;
            const isReached = currentTime >= markerTime;
            return (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  seek(markerTime);
                }}
                className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 -translate-x-1/2 rounded-full border border-line bg-surface shadow transition-all hover:scale-125 focus:outline-none ${
                  isReached
                    ? "border-brand bg-brand scale-110"
                    : "group-hover:scale-110"
                }`}
                style={{ left: `${markerPercent}%` }}
                title={formatTime(markerTime)}
              />
            );
          })}
      </div>

      {/* Info & Controls */}
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <span className="mb-0.5 block text-[0.62rem] font-extrabold uppercase tracking-wider text-brand">
            {publisher}
          </span>
          <h4
            className="truncate text-xs font-bold leading-tight text-ink sm:text-sm"
            title={title || ""}
          >
            {title}
          </h4>
        </div>

        <div className="ml-4 flex items-center gap-2.5 shrink-0">
          <span className="text-[0.7rem] font-extrabold tracking-wide tabular-nums text-ink-soft sm:text-xs">
            {formatTime(currentTime)}
            <span className="mx-1 opacity-40">/</span>
            {formatTime(duration)}
          </span>

          {/* Play/Pause Button */}
          <button
            onClick={status === "playing" ? pause : resume}
            disabled={status === "loading"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-md transition-all hover:bg-brand/90 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {status === "loading" ? (
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : status === "playing" ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 translate-x-[1px]">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Skip Next Button */}
          <button
            onClick={playNext}
            disabled={queue.length === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-ink transition-all hover:bg-surface-hover active:scale-95 disabled:opacity-40 disabled:hover:bg-surface"
            title="Skip to next"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          {/* Queue List Toggle Button */}
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all active:scale-95 relative ${
              showQueue
                ? "border-brand bg-brand/10 text-brand"
                : "border-line bg-surface text-ink hover:bg-surface-hover"
            }`}
            title="Up Next Queue"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            {queue.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[0.6rem] font-black text-white shadow">
                {queue.length}
              </span>
            )}
          </button>

          {/* Close/Stop Button */}
          <button
            onClick={stop}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-ink transition-all hover:bg-surface-hover active:scale-95"
            title="Close Player"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Queue Drawer */}
      {showQueue && (
        <div className="mt-4 border-t border-line pt-3 animate-fade-in max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2 px-1">
            <h5 className="text-[0.68rem] font-extrabold uppercase tracking-wider text-muted">Up Next ({queue.length})</h5>
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-[0.65rem] font-extrabold uppercase text-red-500 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
          {queue.length === 0 ? (
            <p className="text-xs text-ink-soft py-3 text-center italic">No articles in queue.</p>
          ) : (
            <div className="flex flex-col gap-2 pr-1">
              {queue.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex items-center justify-between rounded-xl bg-surface-hover/60 border border-line/30 p-2.5 text-xs hover:bg-surface-hover hover:border-line transition-all"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <span className="text-[0.6rem] font-extrabold uppercase tracking-wide text-brand mr-2">
                      {item.publisher}
                    </span>
                    <span className="font-bold text-ink leading-tight">{item.title}</span>
                  </div>
                  <button
                    onClick={() => removeFromQueue(item.id)}
                    className="text-ink-soft hover:text-red-500 transition-colors p-1"
                    title="Remove from queue"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

