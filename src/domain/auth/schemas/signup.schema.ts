export const signupSchema = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 30 },
    email: { type: 'string', format: 'email' },
    password: {
      type: 'string',
      // eslint-disable-next-line no-useless-escape
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,32}$',
    },
    confirmPassword: {
      type: 'string',
      const: { $data: '1/password' },
    },
  },
  required: ['username', 'email', 'password', 'confirmPassword'],
  additionalProperties: false,
  errorMessage: {
    properties: {
      username: 'Username must be between 3 and 30 characters long.',
      email: 'Invalid email format.',
      password:
        'Password must at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character from the following !@#$%^&*()-+=.',
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
};
