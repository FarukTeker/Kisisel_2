import { z } from 'zod';

import { apiRequest } from '@/lib/api/client';
import { articleSchema, sourceSchema } from '@/lib/types';

const sourcesSchema = z.object({ sources: z.array(sourceSchema) });
const listSchema = z.object({
  articles: z.array(articleSchema),
  total: z.number().optional(),
  source: sourceSchema.optional(),
});

export function fetchSources() {
  return apiRequest('/articles/sources', { schema: sourcesSchema, auth: false }).then(
    (r) => r.sources,
  );
}

export function fetchArticles(params?: { sourceId?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.sourceId) query.set('sourceId', params.sourceId);
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiRequest(`/articles${qs ? `?${qs}` : ''}`, { schema: listSchema, auth: false });
}

export function fetchPopular(limit = 8) {
  return apiRequest(`/articles/popular?limit=${limit}`, { schema: listSchema, auth: false }).then(
    (r) => r.articles,
  );
}

export function fetchRandom(count = 5) {
  return apiRequest(`/articles/random?count=${count}`, { schema: listSchema, auth: false }).then(
    (r) => r.articles,
  );
}
