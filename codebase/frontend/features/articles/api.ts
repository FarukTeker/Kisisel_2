import { apiRequest } from "@/lib/api/client";
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
}): Promise<Article[]> {
  const query = new URLSearchParams();
  if (params?.sourceId) query.set("sourceId", params.sourceId);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  const data = await apiRequest(`/articles${qs ? `?${qs}` : ""}`, {
    schema: articleListResponseSchema,
  });
  return data.articles;
}

export async function fetchPopular(limit = 8): Promise<Article[]> {
  const data = await apiRequest(`/articles/popular?limit=${limit}`, {
    schema: articleCollectionSchema,
  });
  return data.articles;
}

export async function fetchRandom(count = 5): Promise<Article[]> {
  const data = await apiRequest(`/articles/random?count=${count}`, {
    schema: articleCollectionSchema,
  });
  return data.articles;
}
