import {
  AllowedIngredientRef,
  GenerateJsonInput,
  GenerateTextInput,
} from '../types';

export interface AIProvider {
  generateText(input: GenerateTextInput): Promise<{ text: string }>;

  generateJson<T>(
    input: GenerateJsonInput,
    allowedIngredients: AllowedIngredientRef[],
  ): Promise<T>;
}
