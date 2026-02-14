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
import refreshJwtConfig from './config/refresh-jwt.config';
import { type ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
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
    return this.login(requestUser);
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
    console.log(refreshToken);
    if (!refreshToken)
      throw new UnauthorizedException('Invalid refresh token.');

    const user = await this.usersService.findOneById(userId);
    if (!user || !user.hashedRefreshToken)
      throw new UnauthorizedException('Invalid refresh token.');

    const refreshTokenMatches = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches)
      throw new UnauthorizedException('Invalid refresh token.');

    const requestUser: RequestUser = { id: userId };
    return requestUser;
  }

  async login({ id }: RequestUser) {
    const { accessToken, refreshToken } = await this.generateTokens(id);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.usersService.updateHashedRefreshToken(id, hashedRefreshToken);

    return {
      id,
      accessToken,
      refreshToken,
    };
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

  async refreshToken({ id }: RequestUser) {
    const { accessToken, refreshToken } = await this.generateTokens(id);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.usersService.updateHashedRefreshToken(id, hashedRefreshToken);

    return {
      id,
      accessToken,
      refreshToken,
    };
  }

  async signout({ id }: RequestUser) {
    await this.usersService.updateHashedRefreshToken(id, null);
  }
}
