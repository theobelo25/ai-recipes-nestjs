import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';

import { PrismaService } from 'src/prisma/prisma.service';
import { HashingService } from '../hashing/hashing.service';

import { randomBytes, createHmac } from 'node:crypto';
import refreshTokenConfig from '../config/refresh-token.config';
import ms from 'ms';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    @Inject(refreshTokenConfig.KEY)
    private readonly refreshConfig: ConfigType<typeof refreshTokenConfig>,
  ) {}

  private get refreshTtlSeconds(): number {
    const duration = ms(this.refreshConfig.ttl);

    if (
      typeof duration !== 'number' ||
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      throw new Error(
        `Invalid refresh token ttl: ${String(this.refreshConfig.ttl)}`,
      );
    }

    return Math.floor(duration / 1000);
  }

  get cookieMaxAgeSeconds(): number {
    return this.refreshTtlSeconds;
  }

  private getPrefixSecret(): string {
    if (!this.refreshConfig.prefixSecret) {
      throw new Error('REFRESH_PREFIX_SECRET is not set');
    }
    return this.refreshConfig.prefixSecret;
  }

  private getTokenPrefix(token: string) {
    return createHmac('sha256', this.getPrefixSecret())
      .update(token)
      .digest('hex')
      .slice(0, 8);
  }

  private generateRefreshToken(): string {
    return randomBytes(32).toString('base64url');
  }

  async issueInitial(userId: string): Promise<string> {
    const raw = this.generateRefreshToken();
    const tokenPrefix = this.getTokenPrefix(raw);
    const tokenHash = await this.hashingService.hash(raw);
    const expiresAt = new Date(Date.now() + this.refreshTtlSeconds * 1000);

    await this.prismaService.refreshToken.create({
      data: { userId, tokenHash, tokenPrefix, expiresAt },
    });

    return raw;
  }

  private async findByRaw(raw: string, opts?: { includeRevoked?: boolean }) {
    const tokenPrefix = this.getTokenPrefix(raw);
    const now = new Date();

    const candidates = await this.prismaService.refreshToken.findMany({
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

    for (const c of candidates) {
      if (await this.hashingService.compare(raw, c.tokenHash)) return c;
    }

    return null;
  }

  async rotate(raw: string) {
    const now = new Date();
    const matched = await this.findByRaw(raw, {
      includeRevoked: true,
    });
    if (!matched) throw new UnauthorizedException('Invalid refresh token');

    // reuse detection
    if (matched.revokedAt) {
      await this.prismaService.refreshToken.updateMany({
        where: { userId: matched.userId, revokedAt: null },
        data: { revokedAt: now },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    return this.prismaService.$transaction(async (tx) => {
      const current = await tx.refreshToken.findFirst({
        where: { id: matched.id },
        select: { id: true, userId: true, revokedAt: true, expiresAt: true },
      });

      if (!current || current.expiresAt <= now) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      if (current.revokedAt) {
        throw new UnauthorizedException('Refresh token already used');
      }

      const nextRaw = this.generateRefreshToken();
      const nextPrefix = this.getTokenPrefix(nextRaw);
      const nextHash = await this.hashingService.hash(nextRaw);
      const nextExpiresAt = new Date(
        now.getTime() + this.refreshTtlSeconds * 1000,
      );

      const next = await tx.refreshToken.create({
        data: {
          userId: current.userId,
          tokenHash: nextHash,
          tokenPrefix: nextPrefix,
          expiresAt: nextExpiresAt,
        },
        select: { id: true },
      });

      await tx.refreshToken.update({
        where: { id: current.id },
        data: {
          revokedAt: now,
          lastUsedAt: now,
          replacedById: next.id,
        },
      });

      return { userId: current.userId, nextRaw };
    });
  }

  async revoke(raw: string) {
    const matched = await this.findByRaw(raw, {
      includeRevoked: true,
    });
    if (!matched) return;

    await this.prismaService.refreshToken.updateMany({
      where: { id: matched.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
