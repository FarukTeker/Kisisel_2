import { Router } from 'express';
import { summarizePreview } from '../services/ollamaSummary.js';

interface SummaryPreviewBody {
  title?: string;
  content?: string;
  publisher?: string;
  category?: string;
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

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown summary error';
    res.status(502).json({ error: message });
  }
});
