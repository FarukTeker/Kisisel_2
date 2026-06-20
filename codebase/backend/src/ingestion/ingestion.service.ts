import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RssSourcesService } from './rss/rss-sources.service';
import { RssFetcherService } from './rss/rss-fetcher.service';
import { PipelineRunner } from './pipeline/pipeline.runner';
import { INGESTION_STAGES } from './pipeline/tokens';
import type { PipelineStage } from './pipeline/pipeline-stage.interface';
import type { IngestionItem } from './pipeline/ingestion-item.type';

const ITEMS_PER_FEED = 20;

/**
 * Fetches every RSS source and runs each item through the ingestion pipeline.
 * Runs on startup and every 30 minutes. New/changed articles land as PENDING;
 * the EnrichmentWorker picks them up independently.
 */
@Injectable()
export class IngestionService implements OnApplicationBootstrap {
  private readonly logger = new Logger(IngestionService.name);
  private isIngesting = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sources: RssSourcesService,
    private readonly fetcher: RssFetcherService,
    private readonly runner: PipelineRunner,
    @Inject(INGESTION_STAGES)
    private readonly stages: PipelineStage<IngestionItem>[],
  ) {}

  onApplicationBootstrap(): void {
    void this.runIngestion();
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async scheduledIngest(): Promise<void> {
    await this.runIngestion();
  }

  async runIngestion(): Promise<void> {
    if (this.isIngesting) {
      this.logger.warn('Ingestion already running — skipping this trigger');
      return;
    }
    this.isIngesting = true;
    this.logger.log('Starting RSS ingestion');

    try {
      for (const source of this.sources.all()) {
        try {
          await this.prisma.publisher.upsert({
            where: { id: source.id },
            update: {
              name: source.name,
              url: source.url,
              category: source.category,
              language: source.language,
            },
            create: {
              id: source.id,
              name: source.name,
              url: source.url,
              category: source.category,
              language: source.language,
            },
          });

          const items = (await this.fetcher.fetchItems(source.url)).slice(
            0,
            ITEMS_PER_FEED,
          );
          for (const rawItem of items) {
            await this.runner.run(this.stages, { source, rawItem });
          }
          this.logger.log(`Ingested ${items.length} items for ${source.name}`);
        } catch (err) {
          this.logger.error(
            `Failed ingesting ${source.name}: ${(err as Error).message}`,
          );
        }
      }
    } finally {
      this.isIngesting = false;
      this.logger.log('RSS ingestion finished');
    }
  }
}
