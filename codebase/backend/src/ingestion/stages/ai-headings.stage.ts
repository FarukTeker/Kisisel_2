import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GroqService } from '../groq/groq.service';
import type { PipelineStage, StageContext } from '../pipeline/pipeline-stage.interface';
import { langSuffix, type EnrichmentJob } from '../pipeline/enrichment-job.type';

/** Skim mode (H): 3-5 key points, stored as a JSON string array (source language). */
@Injectable()
export class AiHeadingsStage implements PipelineStage<EnrichmentJob> {
  readonly name = 'ai-headings';

  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService,
  ) {}

  async process(ctx: StageContext<EnrichmentJob>): Promise<void> {
    const { articleId, title, fullContent, language } = ctx.payload;

    const raw = await this.groq.complete(
      'You extract key points from news articles for skim reading.',
      [
        'Extract 3 to 5 key points from the article below.',
        'Write the key points in the same language as the article.',
        'Respond ONLY with a JSON array of short plain strings, e.g. ["point one", "point two"].',
        'No markdown, no numbering, no extra text.',
        `Title: ${title}`,
        `Content: ${fullContent}`,
      ].join('\n'),
      200,
    );

    // Be tolerant of the model wrapping the array in prose/fences.
    const headings = this.parseHeadings(raw);
    await this.prisma.article.update({
      where: { id: articleId },
      data: { [`aiHeadings${langSuffix(language)}`]: JSON.stringify(headings) },
    });
  }

  private parseHeadings(raw: string): string[] {
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.map((x) => String(x)).filter(Boolean).slice(0, 5);
        }
      } catch {
        // fall through to line-splitting
      }
    }
    return raw
      .split('\n')
      .map((l) => l.replace(/^[-*\d.\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, 5);
  }
}
