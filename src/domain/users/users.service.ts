import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { ChangePasswordDto } from './dtos/changePassword.dto';
import { HashingService } from '../auth/hashing/hashing.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return await this.prismaService.user.create({ data: { ...createUserDto } });
  }

  async findOneByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    return user;
  }

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
    console.log(passwordMatches);
    if (!passwordMatches)
      throw new UnauthorizedException('User not authorized.');

    const newHashedPassword = await this.hashingService.hash(newPassword);

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: { password: newHashedPassword },
    });

    return updatedUser;
  }
}
