export const RECIPE_INCLUDE = {
  ingredients: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      ingredient: {
        select: { id: true, name: true, slug: true },
      },
    },
  },
  author: { select: { id: true, username: true } },
} as const;
