import { Prisma, RefreshToken } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Db } from 'src/prisma/types/db.type';

type CreateRefreshTokenDTO = {
  userId: string;
  tokenHash: string;
  tokenPrefix: string;
  expiresAt: Date;
};

export interface AuthRepository {
  createRefreshToken(
    createRefreshTokenDTO: CreateRefreshTokenDTO,
    db: Db,
  ): Promise<RefreshToken>;

  findByTokenPrefix(tokenPrefix: string): Promise<RefreshToken[] | null>;
  findByTokenId(id: string): Promise<RefreshToken | null>;

  markRefreshTokenReplaced(
    data: { currentId: string; replacedById: string; now: Date },
    db: Db,
  ): Promise<void>;

  revokeAllUserRefreshTokens(): Promise<void>;

  // findRefreshTokenByHash(hash: string): Promise<RefreshToken | null>;

  revokeRefreshToken(id: string): Promise<void>;
}
