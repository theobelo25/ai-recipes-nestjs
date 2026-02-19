import { Type, Static } from '@sinclair/typebox';

export const signupSchema = Type.Object(
  {
    username: Type.String({
      transform: ['trim'],
      minLength: 3,
      maxLength: 50,
      pattern: '^[a-zA-Z\\s-]+$',
    }),
    email: Type.String({
      transform: ['trim'],
      format: 'email',
    }),
    password: Type.String({
      transform: ['trim'],
      minLength: 8,
      maxLength: 32,
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,32}$',
    }),
    confirmPassword: Type.String({
      transform: ['trim'],
      const: { $data: '1/password' },
    }),
  },
  {
    additionalProperties: false,
    errorMessage: {
      properties: {
        username:
          'Username must be between 3 and 50 characters long and only contain letters, spaces, or hyphens.',
        email: 'Invalid email format.',
        password:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character from the following !@#$%^&*.',
        confirmPassword: 'confirmPassword must match password exactly',
      },
      required: {
        username: 'Username is required.',
        email: 'Email is required.',
        password: 'Password is required.',
        confirmPassword: 'confirmPassword is required.',
      },
      additionalProperties: 'No additional properties are allowed.',
    },
  },
);

export type SignupDto = Static<typeof signupSchema>;
