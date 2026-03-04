import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { UsersService } from 'src/domain/users/users.service';
import {
  AUTH_ERROR_CODES,
  type AuthErrorResponseBody,
} from './errors/auth-error-codes';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RequestUser } from './interfaces/request-user.interface';
import { ChangePasswordDto, SignupDto } from './types/auth.schema';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/common/uow/unit-of-work.interface';
import {
  AUTH_REPOSITORY,
  type IAuthRepository,
} from './infrastructure/auth.repository.interface';
import { Db } from 'src/common/db/db.type';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto, db?: Db) {
    const { username, email, password } = signupDto;

    const hashedPassword = await this.hashingService.hash(password);
    return this.usersService.createUser(
      {
        username,
        email,
      },
      hashedPassword,
      db,
    );
  }

  async validateLocal(email: string, password: string) {
    const user = await this.usersService.findPrivateUserByEmail(email);
    if (!user) {
      const body: AuthErrorResponseBody = {
        errorCode: AUTH_ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        message: 'Invalid credentials.',
      };
      throw new UnauthorizedException(body);
    }

    const isMatch = await this.hashingService.compare(password, user.password);
    if (!isMatch) {
      const body: AuthErrorResponseBody = {
        errorCode: AUTH_ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        message: 'Invalid credentials.',
      };
      throw new UnauthorizedException(body);
    }

    const requestUser: RequestUser = { id: user.id };
    return requestUser;
  }

  async validateJwt({ sub }: JwtPayload) {
    const user = await this.usersService.findPrivateUserById(sub);
    if (!user) {
      const body: AuthErrorResponseBody = {
        errorCode: AUTH_ERROR_CODES.AUTH_INVALID_TOKEN,
        message: 'Invalid token.',
      };
      throw new UnauthorizedException(body);
    }

    const requestUser: RequestUser = { id: user.id };
    return requestUser;
  }

  async signAccessToken(userId: string): Promise<string> {
    const payload: JwtPayload = { sub: userId };
    const accessToken = await this.jwtService.signAsync(payload);
    if (!accessToken) {
      const body: AuthErrorResponseBody = {
        errorCode: AUTH_ERROR_CODES.AUTH_TOKEN_SIGN_FAILED,
        message: 'Problem signing token.',
      };
      throw new UnauthorizedException(body);
    }

    return accessToken;
  }

  async changePassword(id: string, changePassword: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePassword;

    const user = await this.usersService.findPrivateUserById(id);

    const passwordMatches = await this.hashingService.compare(
      oldPassword,
      user.password,
    );
    if (!passwordMatches) {
      const body: AuthErrorResponseBody = {
        errorCode: AUTH_ERROR_CODES.AUTH_USER_NOT_AUTHORIZED,
        message: 'User not authorized.',
      };
      throw new UnauthorizedException(body);
    }

    const newHashedPassword = await this.hashingService.hash(newPassword);

    let updatedUser;

    await this.uow.transaction(async (tx) => {
      updatedUser = await this.usersService.updatePassword(
        id,
        newHashedPassword,
        tx,
      );

      await this.authRepository.revokeAllUserRefreshTokens(id, tx);
    });

    return updatedUser;
  }
}
