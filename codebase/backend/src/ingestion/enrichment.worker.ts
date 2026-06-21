import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PipelineRunner } from './pipeline/pipeline.runner';
import { ENRICHMENT_STAGES } from './pipeline/tokens';
import {
  EnrichmentStatus,
  MAX_ENRICH_RETRIES,
} from './constants/enrichment-status.const';
import type { PipelineStage } from './pipeline/pipeline-stage.interface';
import type { EnrichmentJob } from './pipeline/enrichment-job.type';

const POLL_INTERVAL_MS = 15_000;

/**
 * Background worker that drains PENDING articles through the enrichment
 * pipeline. A single in-process `running` lock plus an atomic PENDING→PROCESSING
 * claim prevents double-processing (single-instance assumption). Groq's serial
 * 2s-gap queue paces the actual API throughput.
 */
@Injectable()
export class EnrichmentWorker implements OnApplicationBootstrap {
  private readonly logger = new Logger(EnrichmentWorker.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly runner: PipelineRunner,
    @Inject(ENRICHMENT_STAGES)
    private readonly stages: PipelineStage<EnrichmentJob>[],
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // Recover articles stuck mid-flight from a previous crash.
    const { count } = await this.prisma.article.updateMany({
      where: { enrichmentStatus: EnrichmentStatus.PROCESSING },
      data: { enrichmentStatus: EnrichmentStatus.PENDING },
    });
    if (count > 0) this.logger.warn(`Reset ${count} stale PROCESSING articles`);
  }

  @Interval(POLL_INTERVAL_MS)
  async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      let job = await this.claimNext();
      while (job) {
        await this.enrich(job);
        job = await this.claimNext();
      }
    } finally {
      this.running = false;
    }
  }

  /** Atomically claims the oldest PENDING article (compare-and-swap on status). */
  private async claimNext(): Promise<EnrichmentJob | null> {
    const target = await this.prisma.article.findFirst({
      where: {
        enrichmentStatus: EnrichmentStatus.PENDING,
        enrichRetries: { lt: MAX_ENRICH_RETRIES },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        title: true,
        fullContent: true,
        category: true,
        publisher: { select: { name: true, language: true } },
      },
    });
    if (!target) return null;

    const claim = await this.prisma.article.updateMany({
      where: { id: target.id, enrichmentStatus: EnrichmentStatus.PENDING },
      data: { enrichmentStatus: EnrichmentStatus.PROCESSING },
    });
    if (claim.count !== 1) return this.claimNext(); // lost the race, try the next

    return {
      articleId: target.id,
      title: target.title,
      fullContent: target.fullContent,
      category: target.category,
      publisherName: target.publisher.name,
      language: target.publisher.language === 'tr' ? 'tr' : 'en',
    };
  }

  private async enrich(job: EnrichmentJob): Promise<void> {
    try {
      await this.runner.run(this.stages, job);
      await this.prisma.article.update({
        where: { id: job.articleId },
        data: {
          enrichmentStatus: EnrichmentStatus.ENRICHED,
          enrichedAt: new Date(),
          enrichLastError: null,
        },
      });
      this.logger.log(`Enriched ${job.articleId}`);
    } catch (err) {
      const message = (err as Error).message;
      const current = await this.prisma.article.findUnique({
        where: { id: job.articleId },
        select: { enrichRetries: true },
      });
      const retries = (current?.enrichRetries ?? 0) + 1;
      const failed = retries >= MAX_ENRICH_RETRIES;
      await this.prisma.article.update({
        where: { id: job.articleId },
        data: {
          enrichmentStatus: failed
            ? EnrichmentStatus.FAILED
            : EnrichmentStatus.PENDING,
          enrichRetries: retries,
          enrichLastError: message,
        },
      });
      this.logger.error(
        `Enrichment ${failed ? 'FAILED' : 'retry'} for ${job.articleId}: ${message}`,
      );
    }
  }
}
