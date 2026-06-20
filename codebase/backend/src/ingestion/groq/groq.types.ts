export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqChoice {
  message?: { content?: string };
}

export interface GroqResponse {
  choices?: GroqChoice[];
}
