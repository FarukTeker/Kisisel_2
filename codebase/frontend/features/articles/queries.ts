"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import {
  fetchArticles,
  fetchPopular,
  fetchRandom,
  fetchSources,
} from "./api";

export const articleKeys = {
  all: ["articles"] as const,
  list: (sourceId?: string, limit?: number) =>
    ["articles", "list", { sourceId, limit }] as const,
  sources: ["articles", "sources"] as const,
  popular: (limit: number) => ["articles", "popular", limit] as const,
  random: (count: number) => ["articles", "random", count] as const,
};

/** Articles are only fetched once authenticated (endpoints are guarded). */
function useAuthed() {
  return Boolean(useAuthStore((s) => s.token));
}

export function useSources() {
  const enabled = useAuthed();
  return useQuery({
    queryKey: articleKeys.sources,
    queryFn: fetchSources,
    enabled,
    staleTime: 30 * 60 * 1000,
  });
}

export function useArticles(sourceId?: string, limit = 20) {
  const enabled = useAuthed();
  return useQuery({
    queryKey: articleKeys.list(sourceId, limit),
    queryFn: () => fetchArticles({ sourceId, limit }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePopularArticles(limit = 8) {
  const enabled = useAuthed();
  return useQuery({
    queryKey: articleKeys.popular(limit),
    queryFn: () => fetchPopular(limit),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRandomArticles(count = 5) {
  const enabled = useAuthed();
  return useQuery({
    queryKey: articleKeys.random(count),
    queryFn: () => fetchRandom(count),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
