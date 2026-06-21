import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { PipelineStage, StageContext } from '../pipeline/pipeline-stage.interface';
import type { IngestionItem } from '../pipeline/ingestion-item.type';

/**
 * Links the persisted article to the current daily edition. Idempotent: re-tagging
 * the same article into the same edition is a no-op. Runs after PersistStage.
 */
@Injectable()
export class EditionTagStage implements PipelineStage<IngestionItem> {
  readonly name = 'edition-tag';

  constructor(private readonly prisma: PrismaService) {}

  async process(ctx: StageContext<IngestionItem>): Promise<void> {
    const article = ctx.payload.article;
    if (!article) throw new Error('NormalizeStage must run before EditionTagStage');

    const editionDate = ctx.payload.editionDate;
    await this.prisma.articleEdition.upsert({
      where: { editionDate_articleId: { editionDate, articleId: article.id } },
      update: {},
      create: { editionDate, articleId: article.id, sourceId: article.sourceId },
    });
  }
}
