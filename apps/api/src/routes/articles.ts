import { Router } from 'express';
import { fetchAllArticles, fetchSourceArticles, getPopularArticles, getRandomArticles, RSS_SOURCES } from '../services/rssService.js';

export const articlesRouter = Router();

// GET /articles/sources — list all configured sources
articlesRouter.get('/sources', (_req, res) => {
  res.json({ sources: RSS_SOURCES });
});

// GET /articles/popular?limit=8
articlesRouter.get('/popular', async (req, res) => {
  const limit = Math.min(Number(req.query['limit'] ?? 8), 20);
  try {
    const articles = await getPopularArticles(limit);
    res.json({ articles, total: articles.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch popular articles';
    res.status(502).json({ error: message });
  }
});

// GET /articles/random?count=5
articlesRouter.get('/random', async (req, res) => {
  const count = Math.min(Number(req.query['count'] ?? 5), 15);
  try {
    const articles = await getRandomArticles(count);
    res.json({ articles, total: articles.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch random articles';
    res.status(502).json({ error: message });
  }
});

// GET /articles?sourceId=bbc-tech&limit=20
articlesRouter.get('/', async (req, res) => {
  const sourceId = req.query['sourceId'] as string | undefined;
  const limit = Math.min(Number(req.query['limit'] ?? 20), 50);

  try {
    if (sourceId) {
      const source = RSS_SOURCES.find((s) => s.id === sourceId);
      if (!source) {
        res.status(404).json({ error: `Source '${sourceId}' not found` });
        return;
      }
      const articles = await fetchSourceArticles(source);
      res.json({ articles: articles.slice(0, limit), source });
      return;
    }

    const { articles, errors } = await fetchAllArticles();
    res.json({
      articles: articles.slice(0, limit),
      total: articles.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch articles';
    res.status(502).json({ error: message });
  }
});
