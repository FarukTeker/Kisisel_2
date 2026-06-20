/** Article shape returned to the frontend (aiHeadings parsed to string[]). */
export interface ArticleResponse {
  id: string;
  title: string;
  summary: string;
  aiSummary: string | null;
  aiHeadings: string[];
  aiFull: string | null;
  fullContent: string;
  author: string;
  date: string;
  category: string;
  publisher: string;
  sourceUrl: string;
  sourceId: string;
  imageUrl: string | null;
  enrichmentStatus: string;
  score?: number;
}
