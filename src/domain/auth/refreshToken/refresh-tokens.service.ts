import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { HashingService } from '../hashing/hashing.service';
import { randomBytes, createHmac } from 'node:crypto';
import { refreshTokenConfig } from '../config/refresh-token.config';
import {
  CreateRefreshTokenDTO,
  ReplaceRefreshTokenDTO,
} from '../types/refresh-token.dtos';
import {
  UNIT_OF_WORK,
  type IUnitOfWork,
} from 'src/common/uow/unit-of-work.interface';
import {
  AUTH_REPOSITORY,
  type IAuthRepository,
} from '../infrastructure/auth.repository.interface';
import { Db } from 'src/common/db/db.type';

@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
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

  async issueInitial(userId: string, db?: Db): Promise<string> {
    const raw = this.generateRefreshToken();
    const createRefreshTokenDTO: CreateRefreshTokenDTO = {
      userId,
      tokenHash: await this.hashingService.hash(raw),
      tokenPrefix: this.getTokenPrefix(raw),
      expiresAt: new Date(Date.now() + this.refreshTtlSeconds * 1000),
    };

    await this.authRepository.createRefreshToken(createRefreshTokenDTO, db);

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

    const now = new Date();

    return this.uow.transaction(async (tx) => {
      const current = await this.authRepository.findByTokenId(matched.id, tx);
      if (current.expiresAt <= now)
        throw new UnauthorizedException('Invalid refresh token');

      if (current.revokedAt) {
        await this.authRepository.revokeAllUserRefreshTokens(
          current.userId,
          tx,
          now,
        );
        throw new UnauthorizedException('Refresh token reuse detected');
      }

      const nextRaw = this.generateRefreshToken();
      const createRefreshTokenDTO: CreateRefreshTokenDTO = {
        userId: current.userId,
        tokenHash: await this.hashingService.hash(nextRaw),
        tokenPrefix: this.getTokenPrefix(nextRaw),
        expiresAt: this.getRefreshExpiresAt(),
        deviceLabel: current.deviceLabel ?? null,
        userAgentHash: current.userAgentHash ?? null,
        ipFirstSeen: current.ipFirstSeen ?? null,
      };

      const next = await this.authRepository.createRefreshToken(
        createRefreshTokenDTO,
        tx,
      );

      const replaceRefreshTokenDTO: ReplaceRefreshTokenDTO = {
        currentId: matched.id,
        replacedById: next.id,
        now: now,
      };

      const consumed = await this.authRepository.consumeAndReplaceRefreshToken(
        replaceRefreshTokenDTO,
        tx,
      );
      if (!consumed) {
        await this.authRepository.revokeAllUserRefreshTokens(
          current.userId,
          tx,
          now,
        );
        throw new UnauthorizedException('Refresh token reuse detected');
      }

      return { userId: matched.userId, nextRaw };
    });
  }

  async revoke(raw: string, db?: Db) {
    const matched = await this.findByRaw(raw, {
      includeRevoked: true,
    });
    if (!matched) return;

    await this.authRepository.revokeRefreshToken(matched.id, db);
  }

  private getRefreshExpiresAt() {
    return new Date(Date.now() + this.refreshTtlSeconds * 1000);
  }
}
