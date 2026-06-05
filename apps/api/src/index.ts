import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { summariesRouter } from './routes/summaries.js';
import { articlesRouter } from './routes/articles.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'kisisel-api',
    ai: {
      provider: 'ollama',
      model: config.ollamaModel,
      baseUrl: config.ollamaBaseUrl,
      fallbackEnabled: config.allowFallbackSummary,
    },
  });
});

app.use('/summaries', summariesRouter);
app.use('/articles', articlesRouter);

app.listen(config.port, () => {
  console.log(`Kisisel API listening on http://localhost:${config.port}`);
});
