/** Injection token for the selected AI provider. */
export const AI_PROVIDER = Symbol('AI_PROVIDER');

export const AI_PROVIDER_KEYS = ['gemini', 'groq', 'ollama'] as const;
export type AIProviderKey = (typeof AI_PROVIDER_KEYS)[number];
