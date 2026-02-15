import {
  BadRequestException,
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
import refreshJwtConfig from './config/refresh-jwt.config';
import { type ConfigType } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import ms from 'ms';
import { createHmac } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser)
      throw new ConflictException(
        'A user with this email address already exists.',
      );

    const hashedPassword = await this.hashingService.hash(password);
    const userData: CreateUserDto = {
      ...createUserDto,
      password: hashedPassword,
    };

    const user = await this.usersService.create(userData);

    const requestUser: RequestUser = { id: user.id };
    return this.signin(requestUser);
  }

  async signin({ id }: RequestUser) {
    const { accessToken, refreshToken } = await this.generateTokens(id);
    await this.createRefreshToken(id, refreshToken);

    return {
      id,
      accessToken,
      refreshToken,
    };
  }

  async signout(token: string | undefined) {
    if (!token)
      throw new BadRequestException(
        'No token available, user already signed out.',
      );

    await this.deleteRefreshToken(token);
  }

  async refreshToken(
    { id }: RequestUser,
    incomingRefreshToken: string | undefined,
  ) {
    if (!incomingRefreshToken)
      throw new UnauthorizedException('Invalid refresh token.');

    const matchedToken = await this.compareRefreshToken(incomingRefreshToken);
    if (!matchedToken)
      throw new UnauthorizedException('Invalid refresh token.');

    await this.prismaService.refreshToken.delete({
      where: { id: matchedToken.id },
    });

    const { accessToken, refreshToken } = await this.generateTokens(id);
    await this.createRefreshToken(id, refreshToken);

    return {
      id,
      accessToken,
      refreshToken,
    };
  }

  async validateLocal(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

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

  async validateRefreshToken(userId: string, refreshToken: string | undefined) {
    if (!refreshToken || !userId)
      throw new UnauthorizedException('Invalid refresh token.');

    const matchedToken = await this.compareRefreshToken(refreshToken);
    if (!matchedToken)
      throw new UnauthorizedException('Invalid refresh token.');

    const requestUser: RequestUser = { id: userId };
    return requestUser;
  }

  private async createRefreshToken(userId: string, token: string) {
    const tokenPrefix = this.getTokenPrefix(token);
    return this.prismaService.refreshToken.create({
      data: {
        tokenHash: await this.hashingService.hash(token),
        userId,
        expiresAt: this.getRefreshTokenExpiry(),
        tokenPrefix,
      },
    });
  }

  private async deleteRefreshToken(token: string) {
    const tokenPrefix = this.getTokenPrefix(token);
    return this.prismaService.refreshToken.deleteMany({
      where: {
        tokenPrefix,
      },
    });
  }

  private async generateTokens(id: string) {
    const payload: JwtPayload = { sub: id };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  private getRefreshTokenExpiry(): Date {
    const expiresIn = this.refreshTokenConfig.expiresIn;
    const duration = ms(expiresIn);
    return new Date(Date.now() + duration);
  }

  private getTokenPrefix(token: string) {
    return createHmac('sha256', process.env.REFRESH_PREFIX_SECRET!)
      .update(token)
      .digest('hex')
      .slice(0, 8);
  }

  private async compareRefreshToken(refreshToken: string) {
    const tokenPrefix = this.getTokenPrefix(refreshToken);

    const tokenCandidates = await this.prismaService.refreshToken.findMany({
      where: {
        tokenPrefix,
        expiresAt: { gte: new Date() },
      },
      include: {
        user: true,
      },
    });

    const matchedToken = (
      await Promise.all(
        tokenCandidates.map(async (token) => ({
          token,
          isMatch: await this.hashingService.compare(
            refreshToken,
            token.tokenHash,
          ),
        })),
      )
    ).find((t) => t.isMatch)?.token;

    return matchedToken;
  }
}
