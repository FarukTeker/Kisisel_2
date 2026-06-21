import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import type { Article } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GroqService } from '../ingestion/groq/groq.service';
import {
  langName,
  langSuffix,
  type ContentLang,
} from '../ingestion/pipeline/enrichment-job.type';
import { GoogleTtsService } from './google-tts.service';

const CACHE_DIR = join(process.cwd(), 'cache', 'tts');

/** Rejects if the promise doesn't settle within `ms` so narration can fall back. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/**
 * Orchestrates the two-stage "Sesli Anlatım" flow, lazily and once per article:
 *   1. Groq rewrites the article into a natural spoken narration script
 *      (persisted to Article.narrationScript).
 *   2. Google TTS synthesizes that script into an MP3 (cached on disk).
 * Both steps run only on first request; later requests serve from cache.
 */
@Injectable()
export class NarrationService {
  private readonly logger = new Logger(NarrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly groq: GroqService,
    private readonly tts: GoogleTtsService,
  ) {}

  /** Returns the cached narration script for a language, generating it if absent. */
  async getNarrationScript(articleId: string, lang: ContentLang): Promise<string> {
    const article = await this.requireArticle(articleId);
    return this.ensureScript(article, lang);
  }

  /** Returns the cached MP3 buffer, generating script + audio on first request. */
  async getAudio(articleId: string, lang: ContentLang): Promise<Buffer> {
    const article = await this.requireArticle(articleId);

    const cachePath = join(CACHE_DIR, `${article.id}-${lang}.mp3`);
    const cached = await this.readCache(cachePath);
    if (cached) return cached;

    const script = await this.ensureScript(article, lang);
    this.logger.log(`Synthesizing ${lang} narration audio for article ${article.id}`);
    const audio = await this.tts.synthesize(script, lang);

    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(cachePath, audio);
    return audio;
  }

  private async ensureScript(article: Article, lang: ContentLang): Promise<string> {
    const suffix = langSuffix(lang);
    const scriptColumn = `narrationScript${suffix}` as const;
    const existing = article[scriptColumn] as string | null;
    if (existing) return existing;

    // Prefer the AI full read in the target language; fall back to the other
    // language / raw content so narration still works pre-translation.
    const fullSource =
      (article[`aiFull${suffix}`] as string | null) ??
      article.aiFullEn ??
      article.aiFullTr ??
      article.fullContent ??
      article.summary;

    // A concise bulletin only needs the lede, not the whole article. Capping the
    // input keeps each request well under Groq's free-tier per-minute token
    // budget so narration doesn't fail when ingestion is also using the quota.
    const source = (fullSource ?? '').slice(0, 1200);

    this.logger.log(`Generating ${lang} narration script for article ${article.id}`);
    // Try a Groq anchor-style rewrite, but never let a slow/over-quota free-tier
    // call block playback: if it doesn't return quickly, narrate the existing
    // summary text directly so audio still works.
    let script: string;
    try {
      const generated = await withTimeout(
        this.groq.complete(
          'You are a professional television news anchor delivering a broadcast bulletin.',
          [
            'Rewrite the following article into a spoken news bulletin script.',
            `Write the script in ${langName(lang)}.`,
            'Adopt the serious, authoritative, composed tone of a professional news anchor reading the headlines.',
            'Keep it concise and to the point — cover only the key facts, no filler. Aim for roughly 4 to 6 sentences.',
            'Open by stating the core news directly; do not add greetings, sign-offs, or self-references.',
            'Plain flowing sentences only — no markdown, headings, bullet points, or stage directions.',
            'Stay factual and neutral; do not invent information.',
            `Content: ${source}`,
          ].join('\n'),
          400,
        ),
        9000,
      );
      script = generated?.trim() ? generated.trim() : source;
    } catch {
      this.logger.warn(
        `Groq narration unavailable for ${article.id} (${lang}); narrating summary directly`,
      );
      script = source;
    }

    if (!script) {
      throw new NotFoundException(`No narratable content for article '${article.id}'`);
    }

    await this.prisma.article.update({
      where: { id: article.id },
      data: { [scriptColumn]: script },
    });
    return script;
  }

  private async requireArticle(articleId: string): Promise<Article> {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });
    if (!article) {
      throw new NotFoundException(`Article '${articleId}' not found`);
    }
    return article;
  }

  private async readCache(path: string): Promise<Buffer | null> {
    try {
      return await fs.readFile(path);
    } catch {
      return null;
    }
  }
}
