import { Controller, Get, Header, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { resolveLang } from '../articles/dto/lang.query';
import { LangQuery } from '../articles/dto/lang.query';
import { NarrationService } from './narration.service';

// Public: narration is derived from non-sensitive RSS content and must be
// playable by logged-out viewers of shared newspapers (web + iOS).
@Controller('articles')
export class TtsController {
  constructor(private readonly narration: NarrationService) {}

  @Get(':id/narration')
  async narrationScript(@Param('id') id: string, @Query() query: LangQuery) {
    const script = await this.narration.getNarrationScript(
      id,
      resolveLang(query.lang),
    );
    return { script };
  }

  @Get(':id/audio')
  @Header('Content-Type', 'audio/mpeg')
  @Header('Cache-Control', 'public, max-age=86400')
  async audio(
    @Param('id') id: string,
    @Query() query: LangQuery,
    @Res() res: Response,
  ) {
    const audio = await this.narration.getAudio(id, resolveLang(query.lang));
    res.send(audio);
  }
}
