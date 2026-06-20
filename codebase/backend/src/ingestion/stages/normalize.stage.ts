import { Injectable } from '@nestjs/common';
import type { PipelineStage, StageContext } from '../pipeline/pipeline-stage.interface';
import type { IngestionItem } from '../pipeline/ingestion-item.type';
import { cleanHtml } from '../util/html.util';
import { rollingHash } from '../util/hash.util';
import { extractImage, fallbackImage } from '../util/image.util';

/** Pure transform: raw RSS item → NormalizedArticle (no DB access). */
@Injectable()
export class NormalizeStage implements PipelineStage<IngestionItem> {
  readonly name = 'normalize';

  async process(ctx: StageContext<IngestionItem>): Promise<void> {
    const { source, rawItem } = ctx.payload;
    const item = rawItem as Record<string, string | undefined>;

    const rawContent = (item.content ?? item.contentSnippet ?? item.summary ?? '').toString();
    const fullContent = cleanHtml(rawContent) || cleanHtml(item.title ?? '');
    const summary =
      cleanHtml(item.contentSnippet ?? rawContent).slice(0, 280) ||
      fullContent.slice(0, 280);
    const title = cleanHtml(item.title ?? 'Untitled');

    const id = `${source.id}-${rollingHash(title + source.id)}`;
    const date = item.pubDate
      ? new Date(item.pubDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    const author = cleanHtml(item['creator'] ?? item['author'] ?? source.name);
    const imageUrl =
      extractImage(rawItem) ?? fallbackImage(title, source.category);
    const contentHash = String(rollingHash(title + fullContent));

    ctx.payload.article = {
      id,
      title,
      summary,
      fullContent,
      author,
      date,
      category: source.category,
      sourceUrl: item.link ?? source.url,
      sourceId: source.id,
      imageUrl,
      contentHash,
    };
  }
}
