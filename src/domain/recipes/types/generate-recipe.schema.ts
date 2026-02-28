// src/domains/recipes/dto/generate-recipe.dto.ts
import { z } from 'zod';

export const generateRecipeSchema = z.object({
  ingredients: z.array(z.string().trim().min(1).max(100)).min(1).max(20),
});

export type GenerateRecipeDto = z.infer<typeof generateRecipeSchema>;
