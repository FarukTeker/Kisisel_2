import { config } from '../config.js';

export interface SummaryPreviewInput {
  title: string;
  content: string;
  publisher?: string;
  category?: string;
}

export interface SummaryPreviewResult {
  summary: string;
  provider: 'groq' | 'fallback';
  model: string;
}

// No fallback summary generation allowed per user request

export async function summarizePreview(input: SummaryPreviewInput): Promise<SummaryPreviewResult> {
  const prompt = [
    'Summarize the following news article into 2 short sentences.',
    'Keep it neutral, factual, and easy to scan.',
    'Do not add opinions, bullet points, or markdown.',
    `Title: ${input.title}`,
    input.publisher ? `Publisher: ${input.publisher}` : '',
    input.category ? `Category: ${input.category}` : '',
    `Content: ${input.content}`,
  ].filter(Boolean).join('\n');

  return enqueueSummaryRequest(async () => {
    let retries = 4;
    let backoff = 2000;

  while (retries > 0) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.groqApiKey}`
        },
        body: JSON.stringify({
          model: config.groqModel,
          messages: [
            { role: 'system', content: 'You are a helpful assistant that summarizes news articles.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 120,
        }),
      });

      if (response.status === 429) {
        retries--;
        if (retries === 0) {
          throw new Error('Groq rate limit exceeded after multiple retries.');
        }
        console.warn(`Groq rate limit hit. Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2;
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Groq API error: ${response.status} - ${errorText}`);
        throw new Error(`Groq request failed with status ${response.status}`);
      }

      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content?.replace(/\s+/g, ' ').trim();

      if (!summary) {
        throw new Error('Groq returned an empty summary');
      }

      return {
        summary,
        provider: 'groq',
        model: config.groqModel,
      };
    } catch (error) {
      if (retries > 1 && error instanceof Error && error.message.includes('fetch')) {
         retries--;
         await new Promise(resolve => setTimeout(resolve, backoff));
         backoff *= 2;
         continue;
      }
      console.error('Failed to generate Groq summary:', error);
      throw error;
    }
  }

  throw new Error('Failed to generate Groq summary');
  });
}

// A simple global queue to strictly enforce rate limits (Groq Free Tier has ~30 RPM limit)
// This queues all incoming summary requests and processes them sequentially with a 2-second gap.
let summaryQueue = Promise.resolve();

function enqueueSummaryRequest<T>(task: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    summaryQueue = summaryQueue.then(async () => {
      try {
        const result = await task();
        // Wait 2000ms before processing the next item to respect the 30 RPM limit
        await new Promise(res => setTimeout(res, 2000));
        resolve(result);
      } catch (err) {
        // Still wait even on error to avoid error-loop bursting
        await new Promise(res => setTimeout(res, 2000));
        reject(err);
      }
    });
  });
}
