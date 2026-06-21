import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GroqService } from '../groq/groq.service';
import type { PipelineStage, StageContext } from '../pipeline/pipeline-stage.interface';
import {
  langName,
  langSuffix,
  otherLang,
  type EnrichmentJob,
} from '../pipeline/enrichment-job.type';

/**
 * Translates the source-language AI fields (written by the ai-* stages) into the
 * other supported language, so every article carries both English and Turkish
 * variants of title/summary/headings/full. Runs after the ai-* stages.
 */
@Injectable()
export class TranslateStage implements PipelineStage<EnrichmentJob> {
  readonly name = 'translate';

  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService,
  ) {}

  async process(ctx: StageContext<EnrichmentJob>): Promise<void> {
    const { articleId, language } = ctx.payload;
    const from = langSuffix(language);
    const target = otherLang(language);
    const to = langSuffix(target);
    const targetName = langName(target);

    const src = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: {
        [`aiTitle${from}`]: true,
        [`aiSummary${from}`]: true,
        [`aiHeadings${from}`]: true,
        [`aiFull${from}`]: true,
      },
    });
    if (!src) throw new Error(`Article ${articleId} vanished before translation`);

    const title = (src as Record<string, string | null>)[`aiTitle${from}`] ?? '';
    const summary = (src as Record<string, string | null>)[`aiSummary${from}`] ?? '';
    const headings = this.parseHeadings(
      (src as Record<string, string | null>)[`aiHeadings${from}`],
    );
    const full = (src as Record<string, string | null>)[`aiFull${from}`] ?? '';

    // 1) Short fields together as JSON to save a round-trip.
    const shortRaw = await this.groq.complete(
      `You are a professional translator. Translate the given news content into ${targetName}. Preserve meaning, tone, and proper names. Respond ONLY with valid JSON.`,
      [
        `Translate every value of this JSON into ${targetName}. Keep the same keys and array length.`,
        'Respond ONLY with the translated JSON object, no markdown or extra text.',
        JSON.stringify({ title, summary, headings }),
      ].join('\n'),
      400,
    );
    const short = this.parseShort(shortRaw, { title, summary, headings });

    // 2) Full read on its own (can be long).
    const fullTranslated = full
      ? await this.groq.complete(
          `You are a professional translator. Translate the article into ${targetName}, preserving meaning, tone, and paragraph structure. Output only the translation.`,
          full,
          700,
        )
      : '';

    await this.prisma.article.update({
      where: { id: articleId },
      data: {
        [`aiTitle${to}`]: short.title,
        [`aiSummary${to}`]: short.summary,
        [`aiHeadings${to}`]: JSON.stringify(short.headings),
        [`aiFull${to}`]: fullTranslated,
      },
    });
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

  private parseShort(
    raw: string,
    fallback: { title: string; summary: string; headings: string[] },
  ): { title: string; summary: string; headings: string[] } {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as {
          title?: unknown;
          summary?: unknown;
          headings?: unknown;
        };
        return {
          title: typeof parsed.title === 'string' ? parsed.title : fallback.title,
          summary:
            typeof parsed.summary === 'string' ? parsed.summary : fallback.summary,
          headings: Array.isArray(parsed.headings)
            ? parsed.headings.map((x) => String(x))
            : fallback.headings,
        };
      } catch {
        // fall through
      }
    }
    return fallback;
  }
}
