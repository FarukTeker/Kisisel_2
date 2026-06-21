import { IsIn, IsOptional } from 'class-validator';
import type { ContentLang } from '../../ingestion/pipeline/enrichment-job.type';

/** Mixin: ?lang=en|tr selects which language variant of AI text to serve. */
export class LangQuery {
  @IsOptional()
  @IsIn(['en', 'tr'])
  lang?: ContentLang;
}

/** Normalizes an optional lang query value to a concrete language (default en). */
export function resolveLang(lang?: ContentLang): ContentLang {
  return lang === 'tr' ? 'tr' : 'en';
}
