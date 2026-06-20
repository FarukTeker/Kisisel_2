import { Injectable } from '@nestjs/common';
import Parser from 'rss-parser';

/** Thin wrapper around the shared rss-parser instance. */
@Injectable()
export class RssFetcherService {
  private readonly parser = new Parser({
    timeout: 8000,
    customFields: {
      item: [
        ['media:thumbnail', 'mediaThumbnail'],
        ['media:content', 'mediaContent'],
        ['enclosure', 'enclosure'],
      ],
    },
  });

  /** Fetches a feed and returns its raw items (untyped, normalized later). */
  async fetchItems(url: string): Promise<Record<string, unknown>[]> {
    const feed = await this.parser.parseURL(url);
    return feed.items as unknown as Record<string, unknown>[];
  }
}
