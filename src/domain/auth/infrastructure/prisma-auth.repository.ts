import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateRefreshTokenDTO,
  ReplaceRefreshTokenDTO,
} from '../types/refresh-token.dtos';
import { Db } from 'src/common/db/db.type';
import { IAuthRepository } from './auth.repository.interface';
import { RefreshToken } from 'src/prisma/generated/client';
import { asPrismaDb } from 'src/prisma/prisma-db.util';

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRefreshToken(
    createRefreshTokenDTO: CreateRefreshTokenDTO,
    db?: Db,
  ): Promise<RefreshToken> {
    const prisma = asPrismaDb(this.prisma, db);

    return prisma.refreshToken.create({
      data: createRefreshTokenDTO,
    });
  }

  async findByTokenPrefix(
    tokenPrefix: string,
    opts?: { includeRevoked?: boolean },
    db?: Db,
  ) {
    const prisma = asPrismaDb(this.prisma, db);
    const now = new Date();

    return prisma.refreshToken.findMany({
      where: {
        tokenPrefix,
        expiresAt: { gte: now },
        ...(opts?.includeRevoked ? {} : { revokedAt: null }),
      },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });
  }

  findByTokenId(id: string, db?: Db) {
    const prisma = asPrismaDb(this.prisma, db);
    return prisma.refreshToken.findUniqueOrThrow({
      where: { id },
    });
  }

  async markRefreshTokenReplaced(
    replaceRefreshTokenDTO: ReplaceRefreshTokenDTO,
    db?: Db,
  ): Promise<void> {
    const prisma = asPrismaDb(this.prisma, db);
    await prisma.refreshToken.update({
      where: { id: replaceRefreshTokenDTO.currentId },
      data: replaceRefreshTokenDTO,
      select: { id: true },
    });
  }

  async revokeRefreshToken(id: string, db?: Db) {
    const prisma = asPrismaDb(this.prisma, db);
    const now = new Date();

    await prisma.refreshToken.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: now },
    });
  }

  async revokeAllUserRefreshTokens(userId: string, db?: Db) {
    const prisma = asPrismaDb(this.prisma, db);
    const now = new Date();

    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: now },
    });
  }
}
