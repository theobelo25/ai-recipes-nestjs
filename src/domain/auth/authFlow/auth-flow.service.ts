import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/domain/users/users.service';
import { AuthCookiesService } from '../cookies/auth-cookies.service';
import { RefreshTokenService } from '../refreshToken/refresh-tokens.service';
import { SignupDto } from '../types/auth.schema';
import { FastifyReply } from 'fastify';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/common/uow/unit-of-work.interface';

@Injectable()
export class AuthFlowService {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly refreshTokensService: RefreshTokenService,
    private readonly cookiesService: AuthCookiesService,
  ) {}

  async signUpAndIssueTokens(signupDto: SignupDto, reply: FastifyReply) {
    const existingUser = await this.usersService.findPrivateUserByEmail(
      signupDto.email,
    );
    if (existingUser)
      throw new ConflictException(
        'A user with this email address already exists.',
      );

    const { user, rawRefresh } = await this.uow.transaction(async (tx) => {
      const user = await this.authService.signup(signupDto, tx);
      const rawRefresh = await this.refreshTokensService.issueInitial(
        user.id,
        tx,
      );
      return { user, rawRefresh };
    });

    const accessToken = await this.authService.signAccessToken(user.id);
    this.cookiesService.setRefresh(reply, rawRefresh);

    return { accessToken, user };
  }

  async signInAndIssueTokens(userId: string, reply: FastifyReply) {
    const rawRefresh = await this.uow.transaction(async (tx) => {
      return await this.refreshTokensService.issueInitial(userId, tx);
    });

    const accessToken = await this.authService.signAccessToken(userId);
    const user = await this.usersService.findPublicUserById(userId);

    this.cookiesService.setRefresh(reply, rawRefresh);

    return { accessToken, user };
  }

  async updateAccessTokenOnRefresh(userId: string) {
    const accessToken = await this.authService.signAccessToken(userId);
    const user = await this.usersService.findPublicUserById(userId);

    return { accessToken, user };
  }

  async signOutAndRevokeToken(
    incomingRefreshToken: string | undefined,
    reply: FastifyReply,
  ) {
    if (incomingRefreshToken)
      await this.refreshTokensService.revoke(incomingRefreshToken);

    this.cookiesService.clearRefresh(reply);

    return { ok: true };
  }
}
