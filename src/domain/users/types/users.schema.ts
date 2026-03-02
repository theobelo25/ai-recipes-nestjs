import { Type, type Static } from '@sinclair/typebox';

export const UpdateProfileSchema = Type.Object(
  {
    username: Type.Optional(Type.String({ minLength: 2, maxLength: 50 })),
  },
  { additionalProperties: false, minProperties: 1 },
);

export type UpdateProfileDto = Static<typeof UpdateProfileSchema>;
