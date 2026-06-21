"use client";

import { useQuery } from "@tanstack/react-query";
import { useSettingsStore, type Language } from "@/features/settings/store";
import {
  fetchArticles,
  fetchEditions,
  fetchPopular,
  fetchRandom,
  fetchSources,
} from "./api";

export const articleKeys = {
  all: ["articles"] as const,
  list: (sourceId?: string, limit?: number, lang?: Language, date?: string) =>
    ["articles", "list", { sourceId, limit, lang, date }] as const,
  sources: ["articles", "sources"] as const,
  editions: ["articles", "editions"] as const,
  popular: (limit: number, lang?: Language, date?: string) =>
    ["articles", "popular", limit, lang, date] as const,
  random: (count: number, lang?: Language, date?: string) =>
    ["articles", "random", count, lang, date] as const,
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

/** Available daily editions (newest first) for the history picker. */
export function useEditions() {
  return useQuery({
    queryKey: articleKeys.editions,
    queryFn: fetchEditions,
    staleTime: 5 * 60 * 1000,
  });
}

export function useArticles(sourceId?: string, limit = 20, date?: string) {
  const lang = useSettingsStore((s) => s.language);
  return useQuery({
    queryKey: articleKeys.list(sourceId, limit, lang, date),
    queryFn: () => fetchArticles({ sourceId, limit, lang, date }),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePopularArticles(limit = 8, date?: string) {
  const lang = useSettingsStore((s) => s.language);
  return useQuery({
    queryKey: articleKeys.popular(limit, lang, date),
    queryFn: () => fetchPopular(limit, lang, date),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRandomArticles(count = 5, date?: string) {
  const lang = useSettingsStore((s) => s.language);
  return useQuery({
    queryKey: articleKeys.random(count, lang, date),
    queryFn: () => fetchRandom(count, lang, date),
    staleTime: 5 * 60 * 1000,
  });
}
