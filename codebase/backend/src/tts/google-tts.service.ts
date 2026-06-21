import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ContentLang } from '../ingestion/pipeline/enrichment-job.type';

const TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const MAX_RETRIES = 4;
// Google caps a single synthesize request at 5000 bytes of input. Stay well
// under that so multi-byte characters never push a chunk over the limit.
const MAX_CHUNK_BYTES = 4000;

interface SynthesizeResponse {
  audioContent?: string; // base64 MP3
}

/**
 * Thin Google Cloud Text-to-Speech REST client (API-key auth, mirrors the
 * GroqService pattern). Splits long text into <5000-byte chunks, synthesizes
 * each, and concatenates the MP3 buffers (MP3 frames concatenate cleanly for
 * playback).
 */
interface VoiceConfig {
  voice: string;
  languageCode: string;
}

@Injectable()
export class GoogleTtsService {
  private readonly logger = new Logger(GoogleTtsService.name);
  private readonly apiKey: string;
  private readonly voices: Record<ContentLang, VoiceConfig>;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('GOOGLE_TTS_API_KEY', '');
    this.voices = {
      en: {
        voice: config.get<string>('GOOGLE_TTS_VOICE_EN', 'en-US-Neural2-D'),
        languageCode: config.get<string>('GOOGLE_TTS_LANG_EN', 'en-US'),
      },
      tr: {
        voice: config.get<string>('GOOGLE_TTS_VOICE_TR', 'tr-TR-Standard-A'),
        languageCode: config.get<string>('GOOGLE_TTS_LANG_TR', 'tr-TR'),
      },
    };
  }

  /** Synthesizes the given text into a single MP3 buffer using the language voice. */
  async synthesize(text: string, lang: ContentLang): Promise<Buffer> {
    if (!this.apiKey) {
      throw new Error('GOOGLE_TTS_API_KEY is not configured');
    }
    const config = this.voices[lang];
    const chunks = this.chunk(text.trim());
    const buffers: Buffer[] = [];
    for (const chunk of chunks) {
      buffers.push(await this.synthesizeChunk(chunk, config));
    }
    return Buffer.concat(buffers);
  }

  private async synthesizeChunk(
    text: string,
    config: VoiceConfig,
  ): Promise<Buffer> {
    let backoff = 2000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const response = await fetch(`${TTS_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: config.languageCode, name: config.voice },
          audioConfig: { audioEncoding: 'MP3' },
        }),
      });

      if (response.status === 429 || response.status >= 500) {
        if (attempt === MAX_RETRIES) {
          throw new Error(
            `Google TTS request failed after retries (${response.status})`,
          );
        }
        this.logger.warn(`Google TTS ${response.status} — retrying in ${backoff}ms`);
        await this.sleep(backoff);
        backoff *= 2;
        continue;
      }

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Google TTS request failed (${response.status}): ${body}`);
      }

      const data = (await response.json()) as SynthesizeResponse;
      if (!data.audioContent) {
        throw new Error('Google TTS returned an empty response');
      }
      return Buffer.from(data.audioContent, 'base64');
    }

    throw new Error('Google TTS request failed after retries');
  }

  /**
   * Splits text into chunks no larger than MAX_CHUNK_BYTES, breaking on
   * sentence boundaries where possible so the audio joins naturally.
   */
  private chunk(text: string): string[] {
    if (Buffer.byteLength(text, 'utf8') <= MAX_CHUNK_BYTES) {
      return text ? [text] : [];
    }

    const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text];
    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      const candidate = current + sentence;
      if (current && Buffer.byteLength(candidate, 'utf8') > MAX_CHUNK_BYTES) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current = candidate;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }
}
