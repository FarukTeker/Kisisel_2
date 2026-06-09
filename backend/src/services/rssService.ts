import { prisma } from '../db.js';

export interface RssSource {
  id: string;
  name: string;
  url: string;
  category: string;
  language: string;
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
  // The user requested to replace mock publishers with real RSS feeds.
  // We can add them here:
  {
    id: 'tech-today',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'Technology',
    language: 'en',
  },
  {
    id: 'culinary-delights',
    name: 'Eater',
    url: 'https://www.eater.com/rss/index.xml',
    category: 'Food',
    language: 'en',
  },
  {
    id: 'global-finance',
    name: 'Yahoo Finance',
    url: 'https://finance.yahoo.com/news/rssindex',
    category: 'Finance',
    language: 'en',
  },
  {
    id: 'science-digest',
    name: 'Science Daily',
    url: 'https://www.sciencedaily.com/rss/all.xml',
    category: 'Science',
    language: 'en',
  }
];

export async function fetchSourceArticles(source: RssSource) {
  return prisma.article.findMany({
    where: { sourceId: source.id },
    orderBy: { date: 'desc' },
    take: 10,
  });
}

export async function fetchAllArticles() {
  const articles = await prisma.article.findMany({
    orderBy: { date: 'desc' },
    take: 100,
  });
  return { articles, errors: [] as string[] };
}

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

export async function getPopularArticles(limit = 8) {
  const { articles } = await fetchAllArticles();
  const scores = new Map<string, number>();
  articles.forEach((a) => scores.set(a.id, recencyScore(a.date)));

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

export async function getRandomArticles(count = 5) {
  const { articles } = await fetchAllArticles();
  const shuffled = [...articles].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
