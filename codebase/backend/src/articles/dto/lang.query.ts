import { IsIn, IsOptional, Matches } from 'class-validator';
import type { ContentLang } from '../../ingestion/pipeline/enrichment-job.type';

/**
 * Mixin: ?lang=en|tr selects which language variant of AI text to serve, and
 * ?date=yyyy-mm-dd scopes results to a given daily edition (default = latest).
 */
export class LangQuery {
  @IsOptional()
  @IsIn(['en', 'tr'])
  lang?: ContentLang;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be yyyy-mm-dd' })
  date?: string;
}

/** Normalizes an optional lang query value to a concrete language (default en). */
export function resolveLang(lang?: ContentLang): ContentLang {
  return lang === 'tr' ? 'tr' : 'en';
}
