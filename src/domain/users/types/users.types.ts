import type { Prisma, RefreshToken } from 'src/prisma/generated/client';
import { PRIVATE_USER_SELECT, SAFE_USER_SELECT } from './users.constants';

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof SAFE_USER_SELECT;
}>;

export type PrivateUser = Prisma.UserGetPayload<{
  select: typeof PRIVATE_USER_SELECT;
}>;

export type PrivateUserWithTokens = PrivateUser & {
  refreshTokens: RefreshToken[];
};
