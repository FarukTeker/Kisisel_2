"use client";

import { useQuery } from "@tanstack/react-query";
import { useSettingsStore, type Language } from "@/features/settings/store";
import {
  fetchArticles,
  fetchPopular,
  fetchRandom,
  fetchSources,
} from "./api";

export const articleKeys = {
  all: ["articles"] as const,
  list: (sourceId?: string, limit?: number, lang?: Language) =>
    ["articles", "list", { sourceId, limit, lang }] as const,
  sources: ["articles", "sources"] as const,
  popular: (limit: number, lang?: Language) =>
    ["articles", "popular", limit, lang] as const,
  random: (count: number, lang?: Language) =>
    ["articles", "random", count, lang] as const,
};

// Article endpoints are public, so these run without a token too — required for
// the logged-out shared-newspaper view. The current language is folded into the
// query key so switching language refetches the localized text automatically.

export function useSources() {
  return useQuery({
    queryKey: articleKeys.sources,
    queryFn: fetchSources,
    staleTime: 30 * 60 * 1000,
  });
}

export function useArticles(sourceId?: string, limit = 20) {
  const lang = useSettingsStore((s) => s.language);
  return useQuery({
    queryKey: articleKeys.list(sourceId, limit, lang),
    queryFn: () => fetchArticles({ sourceId, limit, lang }),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePopularArticles(limit = 8) {
  const lang = useSettingsStore((s) => s.language);
  return useQuery({
    queryKey: articleKeys.popular(limit, lang),
    queryFn: () => fetchPopular(limit, lang),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRandomArticles(count = 5) {
  const lang = useSettingsStore((s) => s.language);
  return useQuery({
    queryKey: articleKeys.random(count, lang),
    queryFn: () => fetchRandom(count, lang),
    staleTime: 5 * 60 * 1000,
  });
}
