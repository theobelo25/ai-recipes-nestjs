import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateRefreshTokenDTO,
  ReplaceRefreshTokenDTO,
} from '../types/refresh-token.dtos';
import { Db } from 'src/prisma/types/db.type';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRefreshToken(
    createRefreshTokenDTO: CreateRefreshTokenDTO,
    db: Db = this.prisma,
  ) {
    return db.refreshToken.create({
      data: createRefreshTokenDTO,
      select: { id: true },
    });
  }

  async findByTokenPrefix(
    tokenPrefix: string,
    opts?: { includeRevoked?: boolean },
  ) {
    const now = new Date();

    return this.prisma.refreshToken.findMany({
      where: {
        tokenPrefix,
        expiresAt: { gte: now },
        ...(opts?.includeRevoked ? {} : { revokedAt: null }),
      },
      select: {
        id: true,
        userId: true,
        tokenHash: true,
        revokedAt: true,
        expiresAt: true,
        replacedById: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });
  }

  findByTokenId(id: string, db: Db) {
    return db.refreshToken.findUnique({
      where: { id },
      select: { id: true, userId: true, revokedAt: true, expiresAt: true },
    });
  }

  async markRefreshTokenReplaced(
    replaceRefreshTokenDTO: ReplaceRefreshTokenDTO,
    db: Db = this.prisma,
  ): Promise<void> {
    await db.refreshToken.update({
      where: { id: replaceRefreshTokenDTO.currentId },
      data: replaceRefreshTokenDTO,
      select: { id: true },
    });
  }

  async revokeRefreshToken(id: string) {
    const now = new Date();

    await this.prisma.refreshToken.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: now },
    });
  }

  async revokeAllUserRefreshTokens(userId: string, db?: Db) {
    const client = db ?? this.prisma;
    const now = new Date();

    return client.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: now },
    });
  }
}
