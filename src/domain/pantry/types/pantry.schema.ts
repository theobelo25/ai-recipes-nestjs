import { Type, Static } from '@sinclair/typebox';

export const PantryItemUnitSchema = Type.Optional(
  Type.String({ minLength: 1, maxLength: 50, transform: ['trim'] }),
);

export const PantryItemNotesSchema = Type.Optional(
  Type.String({ maxLength: 300 }),
);

export const AddPantryItemSchema = Type.Object(
  {
    name: Type.String({ minLength: 1, maxLength: 100, transform: ['trim'] }),
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
export type PantryUpsertInput = {
  quantity?: number;
  unit?: string;
  notes?: string;
};
