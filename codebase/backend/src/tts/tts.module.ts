import { Module } from '@nestjs/common';
import { IngestionModule } from '../ingestion/ingestion.module';
import { GoogleTtsService } from './google-tts.service';
import { NarrationService } from './narration.service';
import { TtsController } from './tts.controller';

@Module({
  imports: [IngestionModule],
  controllers: [TtsController],
  providers: [GoogleTtsService, NarrationService],
})
export class TtsModule {}
