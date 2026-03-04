import { RefreshToken } from 'src/prisma/generated/client';
import { Db } from 'src/common/db/db.type';
import { CreateRefreshTokenDTO } from '../types/refresh-token.dtos';

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

  consumeAndReplaceRefreshToken(
    data: { currentId: string; replacedById: string; now: Date },
    db?: Db,
  ): Promise<boolean>;

  revokeAllUserRefreshTokens(id: string, db?: Db, now?: Date): Promise<void>;

  revokeRefreshToken(id: string, db?: Db): Promise<void>;
}
