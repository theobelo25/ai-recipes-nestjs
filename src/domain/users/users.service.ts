import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { ChangePasswordDto } from './dtos/changePassword.dto';
import { HashingService } from '../auth/hashing/hashing.service';
import { SAFE_USER_SELECT } from './types/users.constants';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
  ) {}
  /**
   * * * * * * * * * * *
   * Public user profile (safe fields only).
   * * * * * * * * * * *
   */
  async create(createUserDto: CreateUserDto) {
    return await this.prismaService.user.create({
      data: { ...createUserDto },
      select: SAFE_USER_SELECT,
    });
  }

  async getPublicUserById(id: string) {
    return await this.prismaService.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });
  }

  async updateUser({ id, username }: UpdateUserDto) {
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: { username },
      select: SAFE_USER_SELECT,
    });

    return updatedUser;
  }

  async changePassword(id: string, changePassword: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePassword;

    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: { password: true },
    });
    if (!user) throw new UnauthorizedException('User not found.');

    const passwordMatches = await this.hashingService.compare(
      oldPassword,
      user.password,
    );
    if (!passwordMatches)
      throw new UnauthorizedException('User not authorized.');

    const newHashedPassword = await this.hashingService.hash(newPassword);

    let updatedUser;
    await this.prismaService.$transaction(async (tx) => {
      updatedUser = await tx.user.update({
        where: { id },
        data: { password: newHashedPassword },
        select: SAFE_USER_SELECT,
      });

      await tx.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    return updatedUser;
  }

  /**
   * * * * * * * * * *
   * Internal methods (can include sensitive relations).
   * * * * * * * * * *
   */
  async findOneByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });

    return user;
  }

  async findOneById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: { refreshTokens: true },
    });

    return user;
  }
}
