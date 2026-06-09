import { Router } from 'express';
import { summarizePreview } from '../services/groqSummary.js';

interface SummaryPreviewBody {
  title?: string;
  content?: string;
  publisher?: string;
  category?: string;
  articleId?: string;
}

export const summariesRouter = Router();

summariesRouter.post('/preview', async (req, res) => {
  const body = req.body as SummaryPreviewBody;

  if (!body.title || !body.content) {
    res.status(400).json({
      error: 'title and content are required',
    });
    return;
  }

  try {
    const result = await summarizePreview({
      title: body.title,
      content: body.content,
      publisher: body.publisher,
      category: body.category,
    });

    if (body.articleId && result.summary) {
      try {
        const { prisma } = await import('../db.js');
        await prisma.article.update({
          where: { id: body.articleId },
          data: { aiSummary: result.summary },
        });
      } catch (e) {
        console.error('Failed to save aiSummary to DB for article:', body.articleId, e);
      }
    }

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown summary error';
    res.status(502).json({ error: message });
  }
});
