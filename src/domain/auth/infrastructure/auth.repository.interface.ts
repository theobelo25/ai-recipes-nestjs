import { RefreshToken } from 'src/prisma/generated/client';
import { Db } from 'src/common/db/db.type';

type CreateRefreshTokenDTO = {
  userId: string;
  tokenHash: string;
  tokenPrefix: string;
  expiresAt: Date;
};

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface IAuthRepository {
  createRefreshToken(
    createRefreshTokenDTO: CreateRefreshTokenDTO,
    db?: Db,
  ): Promise<RefreshToken>;

  findByTokenPrefix(
    tokenPrefix: string,
    opts?: { includeRevoked?: boolean },
    db?: Db,
  ): Promise<RefreshToken[]>;

  findByTokenId(id: string, db?: Db): Promise<RefreshToken>;

  markRefreshTokenReplaced(
    data: { currentId: string; replacedById: string; now: Date },
    db?: Db,
  ): Promise<void>;

  revokeAllUserRefreshTokens(id: string, db?: Db): Promise<void>;

  // findRefreshTokenByHash(hash: string): Promise<RefreshToken | null>;

  revokeRefreshToken(id: string): Promise<void>;
}
