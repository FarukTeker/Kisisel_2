import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GroqService } from '../groq/groq.service';
import type { PipelineStage, StageContext } from '../pipeline/pipeline-stage.interface';
import type { EnrichmentJob } from '../pipeline/enrichment-job.type';

/** Scan mode (S): a neutral 2-sentence summary. */
@Injectable()
export class AiSummaryStage implements PipelineStage<EnrichmentJob> {
  readonly name = 'ai-summary';

  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService,
  ) {}

  async process(ctx: StageContext<EnrichmentJob>): Promise<void> {
    const { articleId, title, fullContent, category, publisherName } = ctx.payload;

    const summary = await this.groq.complete(
      'You are a helpful assistant that summarizes news articles.',
      [
        'Summarize the following news article into 2 short sentences.',
        'Keep it neutral, factual, and easy to scan.',
        'Do not add opinions, bullet points, or markdown.',
        `Title: ${title}`,
        `Publisher: ${publisherName}`,
        `Category: ${category}`,
        `Content: ${fullContent}`,
      ].join('\n'),
      120,
    );

    await this.prisma.article.update({
      where: { id: articleId },
      data: { aiSummary: summary },
    });
  }
}
