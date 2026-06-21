import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PipelineRunner } from './pipeline/pipeline.runner';
import { INGESTION_STAGES, ENRICHMENT_STAGES } from './pipeline/tokens';
import { RssSourcesService } from './rss/rss-sources.service';
import { RssFetcherService } from './rss/rss-fetcher.service';
import { GroqService } from './groq/groq.service';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { EnrichmentWorker } from './enrichment.worker';
import { NormalizeStage } from './stages/normalize.stage';
import { PersistStage } from './stages/persist.stage';
import { EditionTagStage } from './stages/edition-tag.stage';
import { AiSummaryStage } from './stages/ai-summary.stage';
import { AiHeadingsStage } from './stages/ai-headings.stage';
import { AiFullStage } from './stages/ai-full.stage';
import { TranslateStage } from './stages/translate.stage';

@Module({
  imports: [AuthModule],
  controllers: [IngestionController],
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
    EditionTagStage,
    AiSummaryStage,
    AiHeadingsStage,
    AiFullStage,
    TranslateStage,
    // Ordered stage arrays — reorder/add a stage here, nothing else changes.
    {
      provide: INGESTION_STAGES,
      useFactory: (
        normalize: NormalizeStage,
        persist: PersistStage,
        editionTag: EditionTagStage,
      ) => [normalize, persist, editionTag],
      inject: [NormalizeStage, PersistStage, EditionTagStage],
    },
    {
      provide: ENRICHMENT_STAGES,
      useFactory: (
        summary: AiSummaryStage,
        headings: AiHeadingsStage,
        full: AiFullStage,
        translate: TranslateStage,
      ) => [summary, headings, full, translate],
      inject: [AiSummaryStage, AiHeadingsStage, AiFullStage, TranslateStage],
    },
  ],
  exports: [RssSourcesService, GroqService],
})
export class IngestionModule {}
