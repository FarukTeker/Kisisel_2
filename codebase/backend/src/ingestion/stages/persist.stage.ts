import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EnrichmentStatus } from '../constants/enrichment-status.const';
import type { PipelineStage, StageContext } from '../pipeline/pipeline-stage.interface';
import type { IngestionItem } from '../pipeline/ingestion-item.type';

/**
 * Upserts the normalized article. Enrichment-preserving: a new article (or one
 * whose contentHash changed) is reset to PENDING with AI fields cleared; an
 * unchanged re-ingested article keeps its existing AI fields and status, so we
 * never waste Groq calls re-enriching identical content.
 */
@Injectable()
export class PersistStage implements PipelineStage<IngestionItem> {
  readonly name = 'persist';

  constructor(private readonly prisma: PrismaService) {}

  async process(ctx: StageContext<IngestionItem>): Promise<void> {
    const article = ctx.payload.article;
    if (!article) throw new Error('NormalizeStage must run before PersistStage');

    const existing = await this.prisma.article.findUnique({
      where: { id: article.id },
      select: { contentHash: true },
    });
    const changed = !existing || existing.contentHash !== article.contentHash;

    const mutableFields = {
      title: article.title,
      summary: article.summary,
      fullContent: article.fullContent,
      author: article.author,
      date: article.date,
      category: article.category,
      sourceUrl: article.sourceUrl,
      imageUrl: article.imageUrl,
      contentHash: article.contentHash,
    };

    const resetEnrichment = {
      enrichmentStatus: EnrichmentStatus.PENDING,
      enrichRetries: 0,
      enrichLastError: null,
      aiSummary: null,
      aiHeadings: null,
      aiFull: null,
      enrichedAt: null,
    };

    await this.prisma.article.upsert({
      where: { id: article.id },
      create: {
        id: article.id,
        ...mutableFields,
        sourceId: article.sourceId,
        enrichmentStatus: EnrichmentStatus.PENDING,
      },
      update: {
        ...mutableFields,
        ...(changed ? resetEnrichment : {}),
      },
    });
  }
}
