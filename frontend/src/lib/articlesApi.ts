const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface LiveArticle {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  author: string;
  date: string;
  category: string;
  publisher: string;
  sourceUrl: string;
  sourceId: string;
  imageUrl?: string;
  summaryLabel?: string;
  score?: number;
}

export interface RssSource {
  id: string;
  name: string;
  url: string;
  category: string;
  language: string;
}

export async function fetchSources(): Promise<RssSource[]> {
  try {
    const res = await fetch(`${API_BASE}/articles/sources`);
    if (!res.ok) return [];
    const data = await res.json() as { sources: RssSource[] };
    return data.sources ?? [];
  } catch {
    return [];
  }
}

export async function fetchArticlesBySource(sourceId: string, limit = 10): Promise<LiveArticle[]> {
  try {
    const res = await fetch(`${API_BASE}/articles?sourceId=${encodeURIComponent(sourceId)}&limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json() as { articles: LiveArticle[] };
    return (data.articles ?? []).map((a) => ({ ...a, summaryLabel: 'Live article' }));
  } catch {
    return [];
  }
}

export async function fetchAllArticles(limit = 40): Promise<{ articles: LiveArticle[]; errors?: string[] }> {
  try {
    const res = await fetch(`${API_BASE}/articles?limit=${limit}`);
    if (!res.ok) return { articles: [] };
    const data = await res.json() as { articles: LiveArticle[]; errors?: string[] };
    return {
      articles: (data.articles ?? []).map((a) => ({ ...a, summaryLabel: 'Live article' })),
      errors: data.errors,
    };
  } catch {
    return { articles: [] };
  }
}

export async function fetchPopularArticles(limit = 8): Promise<LiveArticle[]> {
  try {
    const res = await fetch(`${API_BASE}/articles/popular?limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json() as { articles: LiveArticle[] };
    return (data.articles ?? []).map((a) => ({ ...a, summaryLabel: 'Trending' }));
  } catch {
    return [];
  }
}

export async function fetchRandomArticles(count = 5): Promise<LiveArticle[]> {
  try {
    const res = await fetch(`${API_BASE}/articles/random?count=${count}`);
    if (!res.ok) return [];
    const data = await res.json() as { articles: LiveArticle[] };
    return (data.articles ?? []).map((a) => ({ ...a, summaryLabel: 'Serendipity pick' }));
  } catch {
    return [];
  }
}
