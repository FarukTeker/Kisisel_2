import { Injectable } from '@nestjs/common';
import type { RssSource } from './rss-source.type';

/** Single source of truth for the RSS feeds the pipeline ingests. */
@Injectable()
export class RssSourcesService {
  private readonly sources: RssSource[] = [
    { id: 'bbc-tech', name: 'BBC Technology', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'Technology', language: 'en' },
    { id: 'bbc-science', name: 'BBC Science', url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', category: 'Science', language: 'en' },
    { id: 'hacker-news', name: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'Technology', language: 'en' },
    { id: 'nasa', name: 'NASA News', url: 'https://www.nasa.gov/feed/', category: 'Science', language: 'en' },
    { id: 'the-guardian-tech', name: 'The Guardian Tech', url: 'https://www.theguardian.com/technology/rss', category: 'Technology', language: 'en' },
    { id: 'tech-today', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Technology', language: 'en' },
    { id: 'culinary-delights', name: 'Eater', url: 'https://www.eater.com/rss/index.xml', category: 'Food', language: 'en' },
    { id: 'global-finance', name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', category: 'Finance', language: 'en' },
    { id: 'science-digest', name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'Science', language: 'en' },
  ];

  all(): RssSource[] {
    return this.sources;
  }

  findById(id: string): RssSource | undefined {
    return this.sources.find((s) => s.id === id);
  }
}
