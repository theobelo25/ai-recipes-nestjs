export type PantryIngredientDto = {
  id: string;
  name: string;
  slug: string;
};

export type PantryItemDto = {
  id: string;
  quantity: number | null;
  unit: string | null;
  updatedAt: Date;

  ingredient: PantryIngredientDto;
};
