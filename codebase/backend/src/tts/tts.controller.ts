import {
  Controller,
  Get,
  Header,
  Logger,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { resolveLang } from '../articles/dto/lang.query';
import { LangQuery } from '../articles/dto/lang.query';
import { NarrationService } from './narration.service';

// Public: narration is derived from non-sensitive RSS content and must be
// playable by logged-out viewers of shared newspapers (web + iOS).
@Controller('articles')
export class TtsController {
  private readonly logger = new Logger(TtsController.name);

  constructor(private readonly narration: NarrationService) {}

  @Get(':id/narration')
  async narrationScript(
    @Param('id') id: string,
    @Query() query: LangQuery,
    @Res() res: Response,
  ) {
    try {
      const script = await this.narration.getNarrationScript(
        id,
        resolveLang(query.lang),
      );
      res.json({ script });
    } catch (err) {
      // Groq rate limits are expected on the free tier; respond quietly so
      // the console isn't flooded with stack traces. Client can retry later.
      this.logger.debug(`Narration script unavailable for ${id}: ${err}`);
      res.status(503).json({ error: 'narration_unavailable' });
    }
  }

  @Get(':id/audio')
  @Header('Cache-Control', 'public, max-age=86400')
  async audio(
    @Param('id') id: string,
    @Query() query: LangQuery,
    @Res() res: Response,
  ) {
    try {
      const audio = await this.narration.getAudio(id, resolveLang(query.lang));
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(audio);
    } catch (err) {
      this.logger.debug(`Narration audio unavailable for ${id}: ${err}`);
      res.status(503).json({ error: 'audio_unavailable' });
    }
  }
}
