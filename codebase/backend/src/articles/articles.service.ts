import { Injectable } from '@nestjs/common';
import type { Article } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RssSourcesService } from '../ingestion/rss/rss-sources.service';
import {
  langSuffix,
  type ContentLang,
} from '../ingestion/pipeline/enrichment-job.type';
import type { ArticleResponse } from './dto/article-response.dto';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'and', 'or',
  'is', 'are', 'was', 'were', 'has', 'have', 'by', 'as', 'its', 'it', 'this',
  'that', 'from', 'how',
]);

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sources: RssSourcesService,
  ) {}

  sourcesList() {
    return this.sources.all();
  }

  /** Available edition dates (newest first) with article counts, for history. */
  async editions() {
    const editions = await this.prisma.edition.findMany({
      orderBy: { date: 'desc' },
      include: { _count: { select: { articles: true } } },
    });
    return editions.map((e) => ({ date: e.date, count: e._count.articles }));
  }

  /** Resolve a date to filter by: the given one, else the latest edition (null = none). */
  private async resolveEditionDate(date?: string): Promise<string | null> {
    if (date) return date;
    const latest = await this.prisma.edition.findFirst({ orderBy: { date: 'desc' } });
    return latest?.date ?? null;
  }

  /** Prisma `where` that scopes to an edition when one exists. */
  private editionWhere(editionDate: string | null, extra: object = {}) {
    return editionDate
      ? { editions: { some: { editionDate } }, ...extra }
      : { ...extra };
  }

  async listAll(
    limit: number,
    lang: ContentLang,
    date?: string,
  ): Promise<ArticleResponse[]> {
    const editionDate = await this.resolveEditionDate(date);
    const articles = await this.prisma.article.findMany({
      where: this.editionWhere(editionDate),
      orderBy: { date: 'desc' },
      take: 100,
      include: { publisher: { select: { name: true } } },
    });
    return articles.slice(0, limit).map((a) => this.toResponse(a, lang));
  }

  async listBySource(
    sourceId: string,
    limit: number,
    lang: ContentLang,
    date?: string,
  ): Promise<ArticleResponse[]> {
    const editionDate = await this.resolveEditionDate(date);
    const articles = await this.prisma.article.findMany({
      where: this.editionWhere(editionDate, { sourceId }),
      orderBy: { date: 'desc' },
      take: limit,
      include: { publisher: { select: { name: true } } },
    });
    return articles.map((a) => this.toResponse(a, lang));
  }

  async popular(
    limit: number,
    lang: ContentLang,
    date?: string,
  ): Promise<ArticleResponse[]> {
    const editionDate = await this.resolveEditionDate(date);
    const articles = await this.prisma.article.findMany({
      where: this.editionWhere(editionDate),
      orderBy: { date: 'desc' },
      take: 100,
      include: { publisher: { select: { name: true } } },
    });

    const scores = new Map<string, number>();
    articles.forEach((a) => scores.set(a.id, this.recencyScore(a.date)));

    // Boost stories covered by multiple sources (overlapping significant words).
    for (let i = 0; i < articles.length; i++) {
      const wordsI = this.significantWords(articles[i].title);
      for (let j = i + 1; j < articles.length; j++) {
        if (articles[i].sourceId === articles[j].sourceId) continue;
        const wordsJ = this.significantWords(articles[j].title);
        const overlap = [...wordsI].filter((w) => wordsJ.has(w)).length;
        if (overlap >= 2) {
          scores.set(articles[i].id, (scores.get(articles[i].id) ?? 0) + overlap * 3);
          scores.set(articles[j].id, (scores.get(articles[j].id) ?? 0) + overlap * 3);
        }
      }
    }

    return articles
      .map((a) => ({ ...this.toResponse(a, lang), score: scores.get(a.id) ?? 0 }))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, limit);
  }

  async random(
    count: number,
    lang: ContentLang,
    date?: string,
  ): Promise<ArticleResponse[]> {
    const editionDate = await this.resolveEditionDate(date);
    const articles = await this.prisma.article.findMany({
      where: this.editionWhere(editionDate),
      orderBy: { date: 'desc' },
      take: 100,
      include: { publisher: { select: { name: true } } },
    });
    return [...articles]
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map((a) => this.toResponse(a, lang));
  }

  private recencyScore(dateStr: string): number {
    const ageH = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
    if (ageH <= 6) return 12;
    if (ageH <= 24) return 8;
    if (ageH <= 48) return 4;
    if (ageH <= 168) return 1;
    return 0;
  }

  private significantWords(title: string): Set<string> {
    return new Set(
      title
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
    );
  }

  private toResponse(
    article: Article & { publisher: { name: string } },
    lang: ContentLang,
  ): ArticleResponse {
    // Serve the requested language, falling back to the other language and then
    // the raw RSS values so a not-yet-translated article still renders.
    const want = langSuffix(lang);
    const other = want === 'En' ? 'Tr' : 'En';
    const pick = (base: 'aiTitle' | 'aiSummary' | 'aiHeadings' | 'aiFull') =>
      (article[`${base}${want}`] as string | null) ??
      (article[`${base}${other}`] as string | null);

    return {
      id: article.id,
      title: pick('aiTitle') ?? article.title,
      summary: article.summary,
      aiSummary: pick('aiSummary'),
      aiHeadings: this.parseHeadings(pick('aiHeadings')),
      aiFull: pick('aiFull'),
      fullContent: article.fullContent,
      author: article.author,
      date: article.date,
      category: article.category,
      publisher: article.publisher.name,
      sourceUrl: article.sourceUrl,
      sourceId: article.sourceId,
      imageUrl: article.imageUrl,
      enrichmentStatus: article.enrichmentStatus,
    };
  }

  private parseHeadings(raw: string | null): string[] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.map((x) => String(x)) : [];
    } catch {
      return [];
    }
  }
}
