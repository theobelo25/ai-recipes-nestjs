import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { HashingService } from '../hashing/hashing.service';
import { randomBytes, createHmac } from 'node:crypto';
import { refreshTokenConfig } from '../config/refresh-token.config';
import { AuthRepository } from '../infrastructure/auth.repository';
import {
  CreateRefreshTokenDTO,
  ReplaceRefreshTokenDTO,
} from '../types/refresh-token.dtos';
import { type UnitOfWork } from 'src/common/db/unit-of-work';
import { UNIT_OF_WORK } from 'src/prisma/types/db.type';

@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWork,
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    @Inject(refreshTokenConfig.KEY)
    private readonly refreshConfig: ConfigType<typeof refreshTokenConfig>,
  ) {}

  private get refreshTtlSeconds(): number {
    return this.refreshConfig.ttlSeconds;
  }

  private getTokenPrefix(token: string) {
    return createHmac('sha256', this.refreshConfig.prefixSecret)
      .update(token)
      .digest('hex')
      .slice(0, 8);
  }

  private generateRefreshToken(): string {
    return randomBytes(32).toString('base64url');
  }

  async issueInitial(userId: string): Promise<string> {
    const raw = this.generateRefreshToken();
    const createRefreshTokenDTO: CreateRefreshTokenDTO = {
      userId,
      tokenHash: await this.hashingService.hash(raw),
      tokenPrefix: this.getTokenPrefix(raw),
      expiresAt: new Date(Date.now() + this.refreshTtlSeconds * 1000),
    };

    await this.authRepository.createRefreshToken(createRefreshTokenDTO);

    return raw;
  }

  private async findByRaw(raw: string, opts?: { includeRevoked?: boolean }) {
    const tokenPrefix = this.getTokenPrefix(raw);

    const candidates = await this.authRepository.findByTokenPrefix(
      tokenPrefix,
      opts,
    );

    for (const c of candidates) {
      if (await this.hashingService.compare(raw, c.tokenHash)) return c;
    }

    return null;
  }

  async rotate(raw: string) {
    const matched = await this.findByRaw(raw, {
      includeRevoked: true,
    });
    if (!matched) throw new UnauthorizedException('Invalid refresh token');
    if (matched.revokedAt) {
      await this.authRepository.revokeAllUserRefreshTokens(matched.userId);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    const nextRaw = this.generateRefreshToken();

    const createRefreshTokenDTO: CreateRefreshTokenDTO = {
      userId: matched.userId,
      tokenHash: await this.hashingService.hash(nextRaw),
      tokenPrefix: this.getTokenPrefix(nextRaw),
      expiresAt: new Date(Date.now() + this.refreshTtlSeconds * 1000),
    };

    return this.uow.transaction(async (tx) => {
      const next = await this.authRepository.createRefreshToken(
        createRefreshTokenDTO,
        tx,
      );
      const now = new Date();

      const replaceRefreshTokenDTO: ReplaceRefreshTokenDTO = {
        currentId: matched.id,
        replacedById: next.id,
        now,
      };

      await this.authRepository.markRefreshTokenReplaced(
        replaceRefreshTokenDTO,
        tx,
      );

      return { userId: matched.userId, nextRaw };
    });
  }

  async revoke(raw: string) {
    const matched = await this.findByRaw(raw, {
      includeRevoked: true,
    });
    if (!matched) return;

    await this.authRepository.revokeRefreshToken(matched.id);
  }
}
