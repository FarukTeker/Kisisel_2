import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RssSourcesService } from './rss/rss-sources.service';
import { RssFetcherService } from './rss/rss-fetcher.service';
import { PipelineRunner } from './pipeline/pipeline.runner';
import { INGESTION_STAGES } from './pipeline/tokens';
import type { PipelineStage } from './pipeline/pipeline-stage.interface';
import type { IngestionItem } from './pipeline/ingestion-item.type';

const ITEMS_PER_FEED = 20;
const EDITION_TIMEZONE = 'Europe/Istanbul';

/**
 * Fetches every RSS source once each morning and runs each item through the
 * ingestion pipeline, tagging the results into that day's edition. New/changed
 * articles land as PENDING; the EnrichmentWorker picks them up independently.
 */
@Injectable()
export class IngestionService implements OnApplicationBootstrap {
  private readonly logger = new Logger(IngestionService.name);
  private isIngesting = false;

  /** Today's date as yyyy-mm-dd in the edition timezone. */
  private todayEditionDate(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: EDITION_TIMEZONE });
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly sources: RssSourcesService,
    private readonly fetcher: RssFetcherService,
    private readonly runner: PipelineRunner,
    @Inject(INGESTION_STAGES)
    private readonly stages: PipelineStage<IngestionItem>[],
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // Catch-up: if today's edition doesn't exist yet (fresh start, or the 08:00
    // cron hasn't fired), build it now so the app isn't empty.
    const today = this.todayEditionDate();
    const existing = await this.prisma.edition.findUnique({ where: { date: today } });
    if (!existing) void this.runIngestion();
    else this.logger.log(`Edition ${today} already exists — skipping startup ingest`);
  }

  // Once a day at 08:00 Istanbul time.
  @Cron('0 8 * * *', { timeZone: EDITION_TIMEZONE })
  async scheduledIngest(): Promise<void> {
    await this.runIngestion();
  }

  async runIngestion(): Promise<void> {
    if (this.isIngesting) {
      this.logger.warn('Ingestion already running — skipping this trigger');
      return;
    }

    const editionDate = this.todayEditionDate();
    // Exactly one ingestion per day: if today's edition already has articles, stop.
    const tagged = await this.prisma.articleEdition.count({ where: { editionDate } });
    if (tagged > 0) {
      this.logger.log(`Already ingested edition ${editionDate} — skipping`);
      return;
    }

    this.isIngesting = true;
    this.logger.log(`Starting RSS ingestion for edition ${editionDate}`);
    await this.prisma.edition.upsert({
      where: { date: editionDate },
      update: {},
      create: { date: editionDate },
    });

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
            await this.runner.run(this.stages, { source, rawItem, editionDate });
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
