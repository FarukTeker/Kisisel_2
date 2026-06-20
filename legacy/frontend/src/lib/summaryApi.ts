const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SummaryPreviewRequest {
  title: string;
  content: string;
  publisher?: string;
  category?: string;
  articleId?: string;
}

interface SummaryPreviewResponse {
  summary: string;
  provider: string;
  model: string;
}

export async function fetchSummaryPreview(
  article: SummaryPreviewRequest,
): Promise<SummaryPreviewResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/summaries/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        content: article.content,
        publisher: article.publisher,
        category: article.category,
        articleId: article.articleId,
      }),
    });
    if (!res.ok) return null;
    return res.json() as Promise<SummaryPreviewResponse>;
  } catch {
    return null;
  }
}
