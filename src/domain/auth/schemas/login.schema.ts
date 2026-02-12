export const loginSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
  },
  required: ['email', 'password'],
  additionalProperties: false,
  errorMessage: {
    properties: {
      email: 'Invalid email format.',
      password: 'Password must at least 8 characters long.',
    },
    required: {
      email: 'Email is required.',
      password: 'Password is required.',
    },
    additionalProperties: 'No additional properties are allowed.',
  },
};
