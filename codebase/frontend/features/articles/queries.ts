"use client";

import { useQuery } from "@tanstack/react-query";
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

// Article endpoints are public, so these run without a token too — required for
// the logged-out shared-newspaper view.

export function useSources() {
  return useQuery({
    queryKey: articleKeys.sources,
    queryFn: fetchSources,
    staleTime: 30 * 60 * 1000,
  });
}

export function useArticles(sourceId?: string, limit = 20) {
  return useQuery({
    queryKey: articleKeys.list(sourceId, limit),
    queryFn: () => fetchArticles({ sourceId, limit }),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePopularArticles(limit = 8) {
  return useQuery({
    queryKey: articleKeys.popular(limit),
    queryFn: () => fetchPopular(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRandomArticles(count = 5) {
  return useQuery({
    queryKey: articleKeys.random(count),
    queryFn: () => fetchRandom(count),
    staleTime: 5 * 60 * 1000,
  });
}
