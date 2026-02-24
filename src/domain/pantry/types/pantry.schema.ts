import { Type, Static } from '@sinclair/typebox';

export const PantryItemUnitSchema = Type.Optional(
  Type.String({ minLength: 1, maxLength: 32 }),
);

export const PantryItemNotesSchema = Type.Optional(
  Type.String({ maxLength: 300 }),
);

export const AddPantryItemSchema = Type.Object(
  {
    ingredientId: Type.String({ format: 'uuid' }),
    quantity: Type.Optional(Type.Number({ minimum: 0 })),
    unit: PantryItemUnitSchema,
    notes: PantryItemNotesSchema,
  },
  { additionalProperties: false },
);

export const UpdatePantryItemSchema = Type.Partial(
  Type.Object(
    {
      quantity: Type.Optional(Type.Number({ minimum: 0 })),
      unit: PantryItemUnitSchema,
      notes: PantryItemNotesSchema,
    },
    { additionalProperties: false },
  ),
  { additionalProperties: false, minProperties: 1 },
);

export type AddPantryItemDto = Static<typeof AddPantryItemSchema>;
export type UpdatePantryItemDto = Static<typeof UpdatePantryItemSchema>;
