import { GenerateJsonInput, GenerateTextInput } from '../types';

export interface AIProvider {
  generateText(input: GenerateTextInput): Promise<{ text: string }>;

  generateJson<T>(input: GenerateJsonInput): Promise<T>;
}
