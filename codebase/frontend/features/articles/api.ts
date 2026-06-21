import { apiRequest } from "@/lib/api/client";
import type { Language } from "@/features/settings/store";
import {
  articleCollectionSchema,
  articleListResponseSchema,
  sourcesResponseSchema,
  type Article,
  type RssSource,
} from "./schemas";

export async function fetchSources(): Promise<RssSource[]> {
  const data = await apiRequest("/articles/sources", {
    schema: sourcesResponseSchema,
  });
  return data.sources;
}

export async function fetchArticles(params?: {
  sourceId?: string;
  limit?: number;
  lang?: Language;
}): Promise<Article[]> {
  const query = new URLSearchParams();
  if (params?.sourceId) query.set("sourceId", params.sourceId);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.lang) query.set("lang", params.lang);
  const qs = query.toString();
  const data = await apiRequest(`/articles${qs ? `?${qs}` : ""}`, {
    schema: articleListResponseSchema,
  });
  return data.articles;
}

export async function fetchPopular(limit = 8, lang?: Language): Promise<Article[]> {
  const ls = lang ? `&lang=${lang}` : "";
  const data = await apiRequest(`/articles/popular?limit=${limit}${ls}`, {
    schema: articleCollectionSchema,
  });
  return data.articles;
}

export async function fetchRandom(count = 5, lang?: Language): Promise<Article[]> {
  const ls = lang ? `&lang=${lang}` : "";
  const data = await apiRequest(`/articles/random?count=${count}${ls}`, {
    schema: articleCollectionSchema,
  });
  return data.articles;
}
