export const config = {
  port: Number(process.env.PORT || 4000),
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'gemma3:4b',
  allowFallbackSummary: process.env.ALLOW_FALLBACK_SUMMARY !== 'false',
};
