import { Type, Static } from '@sinclair/typebox';

export const signinSchema = Type.Object(
  {
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8 }),
  },
  {
    additionalProperties: false,

    // Optional: if you're using ajv-errors plugin
    errorMessage: {
      properties: {
        email: 'Invalid email format.',
        password: 'Password must be at least 8 characters long.',
      },
      required: {
        email: 'Email is required.',
        password: 'Password is required.',
      },
      additionalProperties: 'No additional properties are allowed.',
    },
  },
);

export type SigninDto = Static<typeof signinSchema>;
