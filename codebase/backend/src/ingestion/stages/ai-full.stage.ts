import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GroqService } from '../groq/groq.service';
import type { PipelineStage, StageContext } from '../pipeline/pipeline-stage.interface';
import { langSuffix, type EnrichmentJob } from '../pipeline/enrichment-job.type';

/** Full mode (F): a cleaned, well-structured full read (source language). */
@Injectable()
export class AiFullStage implements PipelineStage<EnrichmentJob> {
  readonly name = 'ai-full';

  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService,
  ) {}

  async process(ctx: StageContext<EnrichmentJob>): Promise<void> {
    const { articleId, title, fullContent, category, publisherName, language } =
      ctx.payload;

    const full = await this.groq.complete(
      'You are an editor who rewrites news content into a clean, readable full article.',
      [
        'Rewrite the following article into a clear, well-structured full read.',
        'Write in the same language as the article.',
        'Use plain paragraphs separated by blank lines. No markdown headers or bullet points.',
        'Stay factual and neutral; do not invent information.',
        `Title: ${title}`,
        `Publisher: ${publisherName}`,
        `Category: ${category}`,
        `Content: ${fullContent}`,
      ].join('\n'),
      700,
    );

    await this.prisma.article.update({
      where: { id: articleId },
      data: { [`aiFull${langSuffix(language)}`]: full },
    });
  }
}
