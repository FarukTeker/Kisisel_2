import { create } from "zustand";

export type AudioStatus = "idle" | "loading" | "playing" | "paused" | "error";

export interface QueuedArticle {
  id: string;
  title: string;
  publisher: string;
}

interface AudioState {
  currentArticleId: string | null;
  title: string | null;
  publisher: string | null;
  status: AudioStatus;
  currentTime: number;
  duration: number;
  seekTrigger: number | null; // target time to seek to
  queue: QueuedArticle[];

  play: (articleId: string, title: string, publisher: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setStatus: (status: AudioStatus) => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  clearSeekTrigger: () => void;
  
  // Queue actions
  addToQueue: (articleId: string, title: string, publisher: string) => void;
  removeFromQueue: (articleId: string) => void;
  clearQueue: () => void;
  playNext: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  currentArticleId: null,
  title: null,
  publisher: null,
  status: "idle",
  currentTime: 0,
  duration: 0,
  seekTrigger: null,
  queue: [],

  play: (articleId, title, publisher) =>
    set({
      currentArticleId: articleId,
      title,
      publisher,
      status: "loading",
      currentTime: 0,
      duration: 0,
      seekTrigger: null,
    }),
  pause: () =>
    set((state) => {
      if (state.status === "playing") {
        return { status: "paused" };
      }
      return {};
    }),
  resume: () =>
    set((state) => {
      if (state.status === "paused") {
        return { status: "playing" };
      }
      return {};
    }),
  stop: () =>
    set({
      currentArticleId: null,
      title: null,
      publisher: null,
      status: "idle",
      currentTime: 0,
      duration: 0,
      seekTrigger: null,
      queue: [],
    }),
  seek: (time) => set({ seekTrigger: time }),
  setStatus: (status) => set({ status }),
  setDuration: (duration) => set({ duration }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  clearSeekTrigger: () => set({ seekTrigger: null }),

  addToQueue: (articleId, title, publisher) =>
    set((state) => {
      if (state.currentArticleId === articleId) return {};
      if (state.queue.some((item) => item.id === articleId)) return {};

      // If nothing is playing, play immediately
      if (!state.currentArticleId) {
        return {
          currentArticleId: articleId,
          title,
          publisher,
          status: "loading",
          currentTime: 0,
          duration: 0,
          seekTrigger: null,
        };
      }

      return {
        queue: [...state.queue, { id: articleId, title, publisher }],
      };
    }),

  removeFromQueue: (articleId) =>
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== articleId),
    })),

  clearQueue: () => set({ queue: [] }),

  playNext: () =>
    set((state) => {
      if (state.queue.length > 0) {
        const next = state.queue[0];
        return {
          currentArticleId: next.id,
          title: next.title,
          publisher: next.publisher,
          status: "loading",
          currentTime: 0,
          duration: 0,
          seekTrigger: null,
          queue: state.queue.slice(1),
        };
      }
      // If queue is empty, stop playing
      return {
        currentArticleId: null,
        title: null,
        publisher: null,
        status: "idle",
        currentTime: 0,
        duration: 0,
        seekTrigger: null,
      };
    }),
}));

