import { Injectable } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { UsersService } from 'src/domain/users/users.service';
import { AuthCookiesService } from '../cookies/auth-cookies.service';
import { RefreshTokenService } from '../refreshToken/refresh-tokens.service';
import { CreateUserDto } from 'src/domain/users/dtos/createUser.dto';
import { FastifyReply } from 'fastify';

@Injectable()
export class AuthFlowService {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly refreshTokensService: RefreshTokenService,
    private readonly cookiesService: AuthCookiesService,
  ) {}

  async signUpAndIssueTokens(
    createUserDto: CreateUserDto,
    reply: FastifyReply,
  ) {
    const user = await this.authService.signup(createUserDto);

    const accessToken = await this.authService.signAccessToken(user.id);
    const rawRefresh = await this.refreshTokensService.issueInitial(user.id);
    this.cookiesService.setRefresh(reply, rawRefresh);

    return { accessToken, user };
  }

  async signInAndIssueTokens(userId: string, reply: FastifyReply) {
    const accessToken = await this.authService.signAccessToken(userId);
    const rawRefresh = await this.refreshTokensService.issueInitial(userId);
    const user = await this.userService.getPublicUserById(userId);

    this.cookiesService.setRefresh(reply, rawRefresh);

    return { accessToken, user };
  }

  async updateAccessTokenOnRefresh(userId: string) {
    const accessToken = await this.authService.signAccessToken(userId);
    const user = await this.userService.getPublicUserById(userId);

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
