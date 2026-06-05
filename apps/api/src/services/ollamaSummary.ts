import { config } from '../config.js';

export interface SummaryPreviewInput {
  title: string;
  content: string;
  publisher?: string;
  category?: string;
}

export interface SummaryPreviewResult {
  summary: string;
  provider: 'ollama' | 'fallback';
  model: string;
}

function buildFallbackSummary(input: SummaryPreviewInput) {
  const text = input.content.replace(/\s+/g, ' ').trim();
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const snippet = sentences.slice(0, 2).join(' ').trim();
  const prefix = input.publisher ? `${input.publisher}: ` : '';
  return `${prefix}${snippet}`.slice(0, 320);
}

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

  try {
    const response = await fetch(`${config.ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollamaModel,
        prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 120,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const data = await response.json() as { response?: string };
    const summary = data.response?.replace(/\s+/g, ' ').trim();

    if (!summary) {
      throw new Error('Ollama returned an empty summary');
    }

    return {
      summary,
      provider: 'ollama',
      model: config.ollamaModel,
    };
  } catch (error) {
    if (!config.allowFallbackSummary) {
      throw error;
    }

    return {
      summary: buildFallbackSummary(input),
      provider: 'fallback',
      model: 'local-fallback',
    };
  }
}
