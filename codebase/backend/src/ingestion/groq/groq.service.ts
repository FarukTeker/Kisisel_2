import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { GroqResponse } from './groq.types';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const RATE_LIMIT_GAP_MS = 2000; // ~30 RPM (Groq free tier)
const MAX_RETRIES = 6;
const MAX_BACKOFF_MS = 30000;

/**
 * Injectable Groq chat client. All calls pass through a single global serial
 * queue with a 2s gap so the whole app stays under Groq's free-tier rate limit,
 * regardless of how many enrichment stages/articles call it concurrently.
 */
@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private readonly apiKey: string;
  private readonly model: string;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('GROQ_API_KEY', '');
    this.model = config.get<string>('GROQ_MODEL', 'llama-3.1-8b-instant');
  }

  /** Enqueues a chat completion; resolves with the trimmed assistant message. */
  complete(system: string, user: string, maxTokens = 400): Promise<string> {
    return this.enqueue(() => this.call(system, user, maxTokens));
  }

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue = this.queue.then(async () => {
        try {
          resolve(await task());
        } catch (err) {
          reject(err);
        } finally {
          // Always wait before the next item to avoid bursting on errors too.
          await this.sleep(RATE_LIMIT_GAP_MS);
        }
      });
    });
  }

  private async call(
    system: string,
    user: string,
    maxTokens: number,
  ): Promise<string> {
    let backoff = 2000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.2,
          max_tokens: maxTokens,
        }),
      });

      if (response.status === 429) {
        if (attempt === MAX_RETRIES) {
          throw new Error('Groq rate limit exceeded after retries');
        }
        // Honour the server's own hint when present (Retry-After header is in
        // seconds); otherwise fall back to exponential backoff.
        const retryAfter = Number(response.headers.get('retry-after'));
        const wait = Number.isFinite(retryAfter) && retryAfter > 0
          ? Math.min(retryAfter * 1000 + 500, MAX_BACKOFF_MS)
          : Math.min(backoff, MAX_BACKOFF_MS);
        this.logger.debug(`Groq 429 — retrying in ${wait}ms`);
        await this.sleep(wait);
        backoff *= 2;
        continue;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Groq request failed (${response.status}): ${text}`);
      }

      const data = (await response.json()) as GroqResponse;
      const content = data.choices?.[0]?.message?.content
        ?.replace(/\s+/g, ' ')
        .trim();
      if (!content) throw new Error('Groq returned an empty response');
      return content;
    }

    throw new Error('Groq request failed after retries');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }
}
