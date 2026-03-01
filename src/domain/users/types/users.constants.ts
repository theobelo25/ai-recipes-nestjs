export const SAFE_USER_SELECT = {
  id: true,
  username: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const PRIVATE_USER_SELECT = {
  id: true,
  password: true,
} as const;
