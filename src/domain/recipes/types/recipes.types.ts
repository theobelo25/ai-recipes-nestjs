import { Prisma } from 'src/prisma/generated/client';
import { RECIPE_INCLUDE } from './recipes.constants';

export type RecipeWithRelations = Prisma.RecipeGetPayload<{
  include: typeof RECIPE_INCLUDE;
}>;
