export type GenerateTextInput = {
  prompt: string;
  system?: string;
};

export type GenerateJsonInput = {
  prompt: string;
  schema: Record<string, unknown>;
  system?: string;
};
