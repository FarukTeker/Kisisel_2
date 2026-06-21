import { create } from "zustand";

export type AudioStatus = "idle" | "loading" | "playing" | "paused" | "error";

interface AudioState {
  currentArticleId: string | null;
  title: string | null;
  publisher: string | null;
  status: AudioStatus;
  currentTime: number;
  duration: number;
  seekTrigger: number | null; // target time to seek to

  play: (articleId: string, title: string, publisher: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setStatus: (status: AudioStatus) => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  clearSeekTrigger: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  currentArticleId: null,
  title: null,
  publisher: null,
  status: "idle",
  currentTime: 0,
  duration: 0,
  seekTrigger: null,

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
    }),
  seek: (time) => set({ seekTrigger: time }),
  setStatus: (status) => set({ status }),
  setDuration: (duration) => set({ duration }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  clearSeekTrigger: () => set({ seekTrigger: null }),
}));
