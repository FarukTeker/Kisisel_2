import { Injectable, Logger } from '@nestjs/common';
import {
  StageError,
  type PipelineStage,
  type StageContext,
} from './pipeline-stage.interface';

/**
 * Runs an ordered list of stages over a single payload, sequentially. Payload
 * is generic so the same runner drives both the ingestion and enrichment
 * pipelines. A stage throwing aborts the run with a `StageError`; the caller
 * decides whether to skip, retry, or fail.
 */
@Injectable()
export class PipelineRunner {
  private readonly logger = new Logger(PipelineRunner.name);

  async run<T>(
    stages: PipelineStage<T>[],
    payload: T,
  ): Promise<StageContext<T>> {
    const ctx: StageContext<T> = { payload, logger: this.logger, meta: {} };
    for (const stage of stages) {
      try {
        await stage.process(ctx);
      } catch (err) {
        throw new StageError(stage.name, err);
      }
    }
    return ctx;
  }
}
