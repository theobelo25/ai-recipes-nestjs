import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dtos/createUser.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RequestUser } from './interfaces/request-user.interface';
import { type ConfigType } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomBytes, createHmac } from 'node:crypto';
import refreshTokenConfig from './config/refresh-token.config';
import ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
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

  get refreshCookieMaxAge(): number {
    return this.refreshTtlSeconds;
  }

  async signup(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser)
      throw new ConflictException(
        'A user with this email address already exists.',
      );

    const hashedPassword = await this.hashingService.hash(password);
    const userData = {
      ...createUserDto,
      password: hashedPassword,
    };

    const user = await this.usersService.create(userData);

    return user;
  }

  async validateLocal(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials.');

    const isMatch = await this.hashingService.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials.');

    const requestUser: RequestUser = { id: user.id };
    return requestUser;
  }

  async validateJwt({ sub }: JwtPayload) {
    const user = await this.usersService.findOneById(sub);
    if (!user) throw new UnauthorizedException('Invalid token.');

    const requestUser: RequestUser = { id: sub };
    return requestUser;
  }

  async signAccessToken(userId: string): Promise<string> {
    const payload: JwtPayload = { sub: userId };
    return this.jwtService.signAsync(payload);
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

  async issueInitialRefreshToken(userId: string): Promise<string> {
    const raw = this.generateRefreshToken();
    const tokenPrefix = this.getTokenPrefix(raw);
    const tokenHash = await this.hashingService.hash(raw);
    const expiresAt = new Date(Date.now() + this.refreshTtlSeconds * 1000);

    await this.prismaService.refreshToken.create({
      data: { userId, tokenHash, tokenPrefix, expiresAt },
    });

    return raw;
  }

  private async findByRawRefreshToken(
    raw: string,
    opts?: { includeRevoked?: boolean },
  ) {
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
      orderBy: { createdAt: 'desc' }, // most recent first helps rotation chains
      take: 25, // safety cap
    });

    for (const c of candidates) {
      if (await this.hashingService.compare(raw, c.tokenHash)) return c;
    }

    return null;
  }

  async rotateRefreshToken(raw: string) {
    const now = new Date();
    const matched = await this.findByRawRefreshToken(raw, {
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

  async revokeRefreshToken(raw: string) {
    const matched = await this.findByRawRefreshToken(raw, {
      includeRevoked: true,
    });
    if (!matched) return;

    await this.prismaService.refreshToken.updateMany({
      where: { id: matched.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
