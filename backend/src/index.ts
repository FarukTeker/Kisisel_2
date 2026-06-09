import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { summariesRouter } from './routes/summaries.js';
import { articlesRouter } from './routes/articles.js';
import { authRouter } from './routes/auth.js';
import { newspapersRouter } from './routes/newspapers.js';
import { startRssIngestionCron } from './services/rssIngestion.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'kisisel-api',
    ai: {
      provider: 'groq',
      model: config.groqModel,
      fallbackEnabled: config.allowFallbackSummary,
    },
  });
});

app.use('/summaries', summariesRouter);
app.use('/articles', articlesRouter);
app.use('/auth', authRouter);
app.use('/newspapers', newspapersRouter);

app.listen(config.port, () => {
  console.log(`Kisisel API listening on http://localhost:${config.port}`);
  startRssIngestionCron();
});
