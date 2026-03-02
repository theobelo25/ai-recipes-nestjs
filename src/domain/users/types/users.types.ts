import type { Prisma } from 'src/prisma/generated/client';
import { PRIVATE_USER_SELECT, PUBLIC_USER_SELECT } from './users.constants';

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof PUBLIC_USER_SELECT;
}>;

export type PrivateUser = Prisma.UserGetPayload<{
  select: typeof PRIVATE_USER_SELECT;
}>;

export type CreateUserInput = {
  username: string;
  email: string;
};
