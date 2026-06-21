import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IngestionService } from './ingestion.service';

@Controller('ingest')
export class IngestionController {
  constructor(private readonly ingestion: IngestionService) {}

  /**
   * Manually trigger the daily RSS ingest (handy for demos). Fire-and-forget so
   * the request returns immediately while the pipeline runs in the background.
   * `?force=true` re-fetches even if today's edition already has articles.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  trigger(@Query('force') force?: string) {
    const forced = force === 'true' || force === '1';
    void this.ingestion.runIngestion(forced);
    return { started: true, forced };
  }
}
