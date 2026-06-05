import Parser from 'rss-parser';

export interface RssSource {
  id: string;
  name: string;
  url: string;
  category: string;
  language: string;
}

export interface FetchedArticle {
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
  score?: number;
}

export const RSS_SOURCES: RssSource[] = [
  {
    id: 'bbc-tech',
    name: 'BBC Technology',
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    category: 'Technology',
    language: 'en',
  },
  {
    id: 'bbc-science',
    name: 'BBC Science',
    url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
    category: 'Science',
    language: 'en',
  },
  {
    id: 'hacker-news',
    name: 'Hacker News',
    url: 'https://hnrss.org/frontpage',
    category: 'Technology',
    language: 'en',
  },
  {
    id: 'nasa',
    name: 'NASA News',
    url: 'https://www.nasa.gov/feed/',
    category: 'Science',
    language: 'en',
  },
  {
    id: 'the-guardian-tech',
    name: 'The Guardian Tech',
    url: 'https://www.theguardian.com/technology/rss',
    category: 'Technology',
    language: 'en',
  },
];

const parser = new Parser({
  timeout: 8000,
  customFields: {
    item: [
      ['media:thumbnail', 'mediaThumbnail'],
      ['media:content', 'mediaContent'],
      ['enclosure', 'enclosure'],
    ],
  },
});

// ─── In-memory cache (5 min TTL) ────────────────────────────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000;
interface CacheEntry { articles: FetchedArticle[]; fetchedAt: number }
const sourceCache = new Map<string, CacheEntry>();
let allArticlesCache: { articles: FetchedArticle[]; errors: string[]; fetchedAt: number } | null = null;

function isFresh(fetchedAt: number): boolean {
  return Date.now() - fetchedAt < CACHE_TTL_MS;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractImage(item: Record<string, unknown>): string | undefined {
  const mediaThumbnail = item['mediaThumbnail'] as { $?: { url?: string } } | undefined;
  if (mediaThumbnail?.['$']?.url) return mediaThumbnail['$'].url;

  const enclosure = item['enclosure'] as { url?: string; type?: string } | undefined;
  if (enclosure?.url && enclosure.type?.startsWith('image/')) return enclosure.url;

  const content = item['content'] as string | undefined;
  if (content) {
    const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) return match[1];
  }
  return undefined;
}

// Deterministic fallback image by title hash → picsum.photos (category-seeded)
function fallbackImage(title: string, category: string): string {
  const SEEDS: Record<string, number[]> = {
    Technology: [0, 2, 8, 11, 30, 50, 60, 96, 119, 180],
    Science:    [1, 6, 9, 14, 24, 39, 55, 102, 134, 162],
    Finance:    [3, 7, 15, 18, 22, 33, 48, 75, 90, 108],
    Food:       [4, 12, 25, 28, 41, 54, 66, 80, 97, 115],
    Culture:    [5, 10, 17, 21, 35, 46, 57, 73, 88, 120],
  };
  const pool = SEEDS[category] ?? SEEDS['Technology'];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  const seed = pool[hash % pool.length];
  return `https://picsum.photos/seed/${seed}/600/400`;
}

// ─── Fetch single source (with cache) ────────────────────────────────────────
export async function fetchSourceArticles(source: RssSource): Promise<FetchedArticle[]> {
  const cached = sourceCache.get(source.id);
  if (cached && isFresh(cached.fetchedAt)) return cached.articles;

  const feed = await parser.parseURL(source.url);
  const articles = feed.items.slice(0, 10).map((item, index) => {
    const rawContent = (item.content ?? item.contentSnippet ?? item.summary ?? '').toString();
    const fullContent = cleanHtml(rawContent) || cleanHtml(item.title ?? '');
    const summary = cleanHtml(item.contentSnippet ?? rawContent).slice(0, 280) || fullContent.slice(0, 280);
    return {
      id: `${source.id}-${index}`,
      title: cleanHtml(item.title ?? 'Untitled'),
      summary,
      fullContent: fullContent || summary,
      author: cleanHtml(
        (item as unknown as Record<string, string>)['creator'] ??
        (item as unknown as Record<string, string>)['author'] ??
        source.name,
      ),
      date: item.pubDate
        ? new Date(item.pubDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      category: source.category,
      publisher: source.name,
      sourceUrl: item.link ?? source.url,
      sourceId: source.id,
      imageUrl: extractImage(item as unknown as Record<string, unknown>) ?? fallbackImage(cleanHtml(item.title ?? 'news'), source.category),
    };
  });

  sourceCache.set(source.id, { articles, fetchedAt: Date.now() });
  return articles;
}

// ─── Fetch all sources (with aggregate cache) ────────────────────────────────
export async function fetchAllArticles(): Promise<{ articles: FetchedArticle[]; errors: string[] }> {
  if (allArticlesCache && isFresh(allArticlesCache.fetchedAt)) {
    return { articles: allArticlesCache.articles, errors: allArticlesCache.errors };
  }

  const results = await Promise.allSettled(RSS_SOURCES.map((s) => fetchSourceArticles(s)));
  const articles: FetchedArticle[] = [];
  const errors: string[] = [];
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') articles.push(...result.value);
    else errors.push(`${RSS_SOURCES[i].name}: ${(result.reason as Error).message}`);
  });

  allArticlesCache = { articles, errors, fetchedAt: Date.now() };
  return { articles, errors };
}

// ─── Popular: score by recency + cross-source title overlap ──────────────────
function recencyScore(dateStr: string): number {
  const ageMs = Date.now() - new Date(dateStr).getTime();
  const ageH = ageMs / (1000 * 60 * 60);
  if (ageH <= 6) return 12;
  if (ageH <= 24) return 8;
  if (ageH <= 48) return 4;
  if (ageH <= 168) return 1;
  return 0;
}

function significantWords(title: string): Set<string> {
  const STOP = new Set(['the','a','an','of','in','on','at','to','for','with','and','or','is','are','was','were','has','have','by','as','its','it','this','that','from','how']);
  return new Set(
    title.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)),
  );
}

export async function getPopularArticles(limit = 8): Promise<FetchedArticle[]> {
  const { articles } = await fetchAllArticles();
  const scores = new Map<string, number>();
  articles.forEach((a) => scores.set(a.id, recencyScore(a.date)));

  // Cross-source bonus: overlapping significant words between articles from different sources
  for (let i = 0; i < articles.length; i++) {
    const wordsI = significantWords(articles[i].title);
    for (let j = i + 1; j < articles.length; j++) {
      if (articles[i].sourceId === articles[j].sourceId) continue;
      const wordsJ = significantWords(articles[j].title);
      const overlap = [...wordsI].filter((w) => wordsJ.has(w)).length;
      if (overlap >= 2) {
        scores.set(articles[i].id, (scores.get(articles[i].id) ?? 0) + overlap * 3);
        scores.set(articles[j].id, (scores.get(articles[j].id) ?? 0) + overlap * 3);
      }
    }
  }

  return articles
    .map((a) => ({ ...a, score: scores.get(a.id) ?? 0 }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);
}

// ─── Random: shuffle all, return n ───────────────────────────────────────────
export async function getRandomArticles(count = 5): Promise<FetchedArticle[]> {
  const { articles } = await fetchAllArticles();
  const shuffled = [...articles].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
