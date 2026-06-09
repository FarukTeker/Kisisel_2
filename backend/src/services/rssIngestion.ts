import cron from 'node-cron';
import Parser from 'rss-parser';
import { prisma } from '../db.js';
import { RSS_SOURCES } from './rssService.js';

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

export async function runRssIngestion() {
  console.log('Starting RSS Ingestion...');
  for (const source of RSS_SOURCES) {
    try {
      // Ensure Publisher exists
      await prisma.publisher.upsert({
        where: { id: source.id },
        update: {
          name: source.name,
          url: source.url,
          category: source.category,
          language: source.language,
        },
        create: {
          id: source.id,
          name: source.name,
          url: source.url,
          category: source.category,
          language: source.language,
        },
      });

      const feed = await parser.parseURL(source.url);
      const items = feed.items.slice(0, 20); // Get latest 20
      
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        const rawContent = (item.content ?? item.contentSnippet ?? item.summary ?? '').toString();
        const fullContent = cleanHtml(rawContent) || cleanHtml(item.title ?? '');
        const summary = cleanHtml(item.contentSnippet ?? rawContent).slice(0, 280) || fullContent.slice(0, 280);
        const title = cleanHtml(item.title ?? 'Untitled');
        
        // Use a hash of title+sourceId to avoid duplicate ids
        let hashId = 0;
        const strId = title + source.id;
        for (let i = 0; i < strId.length; i++) hashId = (hashId * 31 + strId.charCodeAt(i)) >>> 0;
        const articleId = `${source.id}-${hashId}`;

        const date = item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
        
        const author = cleanHtml(
          (item as unknown as Record<string, string>)['creator'] ??
          (item as unknown as Record<string, string>)['author'] ??
          source.name,
        );

        const imageUrl = extractImage(item as unknown as Record<string, unknown>) ?? fallbackImage(title, source.category);

        await prisma.article.upsert({
          where: { id: articleId },
          update: {
            title,
            summary,
            fullContent,
            author,
            date,
            imageUrl,
            category: source.category,
            sourceUrl: item.link ?? source.url,
          },
          create: {
            id: articleId,
            title,
            summary,
            fullContent,
            author,
            date,
            imageUrl,
            category: source.category,
            sourceUrl: item.link ?? source.url,
            sourceId: source.id,
          },
        });
      }
      console.log(`Ingested ${items.length} articles for ${source.name}`);
    } catch (error) {
      console.error(`Error ingesting ${source.name}:`, error);
    }
  }
  console.log('RSS Ingestion finished.');
}

export function startRssIngestionCron() {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', () => {
    runRssIngestion().catch(console.error);
  });
  // Run once on startup
  runRssIngestion().catch(console.error);
}
