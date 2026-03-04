import { Injectable } from '@nestjs/common';
import { AiService } from 'src/domain/ai/ai.service';
import {
  buildAiCreateRecipeSchema,
  type AiCreateRecipeDto,
} from './ai-create-recipe.schema';
import { slugify } from 'src/common/utils/slugify';
import { IngredientsService } from 'src/domain/ingredients/ingredients.service';

@Injectable()
export class RecipeGeneratorService {
  constructor(
    private readonly aiService: AiService,
    private readonly ingredientsService: IngredientsService,
  ) {}

  async generateRecipeFromIngredients(ingredients: string[]) {
    const clean = ingredients
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);

    const ingredientRows = await this.resolveIngredientIds(clean);
    const nameById = new Map(ingredientRows.map((r) => [r.id, r.name]));
    const schema = buildAiCreateRecipeSchema(ingredientRows);
    const system = `You are a recipe generator.`;
    const prompt = this.buildPrompt(ingredientRows);

    const aiResponse = await this.aiService.generateJson<AiCreateRecipeDto>(
      {
        prompt,
        schema,
        system,
      },
      ingredientRows,
    );

    const seen = new Set<string>();
    const deduped = aiResponse.ingredients.filter((i) => {
      if (seen.has(i.ingredientId)) return false;
      seen.add(i.ingredientId);
      return true;
    });

    return {
      ...aiResponse,
      ingredients: deduped.map((i, index) => ({
        ...i,
        name: nameById.get(i.ingredientId) ?? 'Unknown',
        sortOrder: i.sortOrder ?? index,
      })),
    };
  }

  private buildPrompt(ingredients: { name: string; id: string }[]) {
    return [
      'USER REQUEST:',
      '',
      'ALLOWED_INGREDIENTS (ingredientId => name):',
      ...ingredients.map((r) => `- ${r.id}: ${r.name}`),
      '',
      'RECIPE GUIDANCE (non-schema):',
      '- The response MUST match the JSON schema provided to you.',
      '- You should primarily use the allowed input ingredients listed above.',
      '- You MAY add extra ingredients ONLY when needed for a realistic and coherent recipe.',
      '- Any ingredient that is not in the allowed input list MUST be represented in the "extras" field exactly as defined in the JSON schema (do not hide extras elsewhere).',
      '- For any ingredient or extra, if you do not need a quantity or unit, OMIT that field entirely instead of using 0, an empty string, or null.',
      '- Keep the recipe realistic and coherent, with clear step-by-step cooking instructions and sensible servings and times.',
      'ALLOWED INGREDIENTS JSON:',
      JSON.stringify(ingredients, null, 2),
    ].join('\n');
  }

  private async resolveIngredientIds(
    names: string[],
  ): Promise<{ id: string; name: string }[]> {
    const slugs = names.map((n) => slugify(n));

    const found = await this.ingredientsService.findManyBySlug(slugs);

    if (found.length !== slugs.length) {
      const foundNames = new Set(found.map((f) => f.name.toLowerCase()));
      const missing = names.filter((n) => !foundNames.has(n));

      throw new Error(`Missing ingredients in database: ${missing.join(', ')}`);
    }

    return found;
  }
}
