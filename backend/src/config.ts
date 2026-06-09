export const config = {
  port: Number(process.env.PORT || 4000),
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama3-8b-8192',
  allowFallbackSummary: process.env.ALLOW_FALLBACK_SUMMARY !== 'false',
};
