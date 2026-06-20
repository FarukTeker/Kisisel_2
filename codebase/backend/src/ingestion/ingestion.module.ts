import { Module } from '@nestjs/common';
import { PipelineRunner } from './pipeline/pipeline.runner';
import { INGESTION_STAGES, ENRICHMENT_STAGES } from './pipeline/tokens';
import { RssSourcesService } from './rss/rss-sources.service';
import { RssFetcherService } from './rss/rss-fetcher.service';
import { GroqService } from './groq/groq.service';
import { IngestionService } from './ingestion.service';
import { EnrichmentWorker } from './enrichment.worker';
import { NormalizeStage } from './stages/normalize.stage';
import { PersistStage } from './stages/persist.stage';
import { AiSummaryStage } from './stages/ai-summary.stage';
import { AiHeadingsStage } from './stages/ai-headings.stage';
import { AiFullStage } from './stages/ai-full.stage';

@Module({
  providers: [
    PipelineRunner,
    RssSourcesService,
    RssFetcherService,
    GroqService,
    IngestionService,
    EnrichmentWorker,
    // Stages (DI providers)
    NormalizeStage,
    PersistStage,
    AiSummaryStage,
    AiHeadingsStage,
    AiFullStage,
    // Ordered stage arrays — reorder/add a stage here, nothing else changes.
    {
      provide: INGESTION_STAGES,
      useFactory: (normalize: NormalizeStage, persist: PersistStage) => [
        normalize,
        persist,
      ],
      inject: [NormalizeStage, PersistStage],
    },
    {
      provide: ENRICHMENT_STAGES,
      useFactory: (
        summary: AiSummaryStage,
        headings: AiHeadingsStage,
        full: AiFullStage,
      ) => [summary, headings, full],
      inject: [AiSummaryStage, AiHeadingsStage, AiFullStage],
    },
  ],
  exports: [RssSourcesService],
})
export class IngestionModule {}
