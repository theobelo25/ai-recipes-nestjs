export const RECIPE_INCLUDE = {
  ingredients: {
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      ingredientId: true,
      quantity: true,
      unit: true,
      note: true,
      sortOrder: true,
    },
  },
} as const;
