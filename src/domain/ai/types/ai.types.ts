/** Used for closure validation: ingredient id + name from pantry. */
export type AllowedIngredientRef = { id: string; name: string };

export type GenerateTextInput = {
  prompt: string;
  system?: string;
};

export type GenerateJsonInput = {
  prompt: string;
  schema: Record<string, unknown>;
  system?: string;
};
