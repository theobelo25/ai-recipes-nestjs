export type GroqClientConfig = {
  apiKey: string;
  baseUrl: string; // e.g. https://api.groq.com/openai/v1
  model: string; // e.g. mixtral-8x7b-32768, llama3-70b-8192
};

export type GroqChatCompletionResponse = {
  id?: string;
  choices?: Array<{
    index?: number;
    message?: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};
