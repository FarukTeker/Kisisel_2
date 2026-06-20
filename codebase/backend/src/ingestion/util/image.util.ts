import { rollingHash } from './hash.util';

/** Pulls an image URL from common RSS shapes (media:thumbnail, enclosure, inline img). */
export function extractImage(item: Record<string, unknown>): string | undefined {
  const mediaThumbnail = item['mediaThumbnail'] as
    | { $?: { url?: string } }
    | undefined;
  if (mediaThumbnail?.['$']?.url) return mediaThumbnail['$'].url;

  const enclosure = item['enclosure'] as
    | { url?: string; type?: string }
    | undefined;
  if (enclosure?.url && enclosure.type?.startsWith('image/')) {
    return enclosure.url;
  }

  const content = item['content'] as string | undefined;
  if (content) {
    const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) return match[1];
  }
  return undefined;
}

/** Deterministic, category-aware placeholder image when a feed item has none. */
export function fallbackImage(title: string, category: string): string {
  const SEEDS: Record<string, number[]> = {
    Technology: [0, 2, 8, 11, 30, 50, 60, 96, 119, 180],
    Science: [1, 6, 9, 14, 24, 39, 55, 102, 134, 162],
    Finance: [3, 7, 15, 18, 22, 33, 48, 75, 90, 108],
    Food: [4, 12, 25, 28, 41, 54, 66, 80, 97, 115],
    Culture: [5, 10, 17, 21, 35, 46, 57, 73, 88, 120],
  };
  const pool = SEEDS[category] ?? SEEDS['Technology'];
  const seed = pool[rollingHash(title) % pool.length];
  return `https://picsum.photos/seed/${seed}/600/400`;
}
