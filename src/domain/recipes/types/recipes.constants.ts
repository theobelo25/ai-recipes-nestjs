export const RECIPE_INCLUDE = {
  ingredients: {
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      ingredientId: true,
      quantity: true,
      unit: true,
      sortOrder: true,
      ingredient: { select: { name: true } },
    },
  },
} as const;
