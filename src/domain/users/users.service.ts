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

  async create(createUserDto: CreateUserDto) {
    return await this.prismaService.user.create({ data: { ...createUserDto } });
  }

  /**
   * Public "me" profile (safe fields only).
   */
  async getMe(id: string) {
    return await this.prismaService.user.findUniqueOrThrow({
      where: { id },
      select: SAFE_USER_SELECT,
    });
  }

  /**
   * Internal method (can include sensitive relations).
   */
  async findOneByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });
    return user;
  }

  /**
   * Internal method (can include sensitive relations).
   */
  async findOneById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: { refreshTokens: true },
    });
    return user;
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
    if (!user) throw new UnauthorizedException('User not authorized.');

    const passwordMatches = await this.hashingService.compare(
      oldPassword,
      user.password,
    );
    if (!passwordMatches)
      throw new UnauthorizedException('User not authorized.');

    const newHashedPassword = await this.hashingService.hash(newPassword);

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: { password: newHashedPassword },
      select: SAFE_USER_SELECT,
    });

    return updatedUser;
  }
}
