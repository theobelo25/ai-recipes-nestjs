import { Type, type Static } from '@sinclair/typebox';

export const UpdateProfileSchema = Type.Object(
  {
    username: Type.String({ minLength: 2, maxLength: 50 }),
  },
  { additionalProperties: false },
);

export type UpdateProfileDto = Static<typeof UpdateProfileSchema>;
