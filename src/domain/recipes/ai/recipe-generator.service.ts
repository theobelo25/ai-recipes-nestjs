import { Injectable } from '@nestjs/common';
import { AiService } from 'src/domain/ai/ai.service';
import { RecipeResponseSchema } from 'src/domain/ai/types';
import { RecipeAIResponse } from '../types/recipes.schema';

@Injectable()
export class RecipeGeneratorService {
  constructor(private readonly aiService: AiService) {}

  async generateRecipeFromIngredients(ingredients: string[]) {
    const clean = ingredients
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);

    const prompt = this.buildPrompt(clean);
    const system = `Return ONLY valid JSON matching the provided schema. No prose.`;

    return this.aiService.generateJson<RecipeAIResponse>({
      prompt,
      schema: RecipeResponseSchema,
      system,
    });
  }

  private buildPrompt(ingredients: string[]) {
    // Keep prompt rules here so they don’t pollute RecipesService
    return [
      `Create a single recipe that uses ONLY the provided ingredients.`,
      `If something is impossible, choose the closest workable dish but do not invent ingredients.`,
      `Return valid JSON ONLY that matches the schema.`,
      ``,
      `Ingredients:`,
      ...ingredients.map((i) => `- ${i}`),
    ].join('\n');
  }
}
