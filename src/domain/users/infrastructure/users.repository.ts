import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PRIVATE_USER_SELECT,
  SAFE_USER_SELECT,
} from '../types/users.constants';
import { UpdateProfileDto } from '../types/users.schema';
import { UsersRepositoryPort } from './users.repository.port';
import { SignupDto } from 'src/domain/auth/types/auth.schema';
import { PublicUser } from '../types/users.types';
import { Db } from 'src/prisma/types/db.type';

@Injectable()
export class UsersRepository implements UsersRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicUserById(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: SAFE_USER_SELECT,
    });
  }

  async createUser(
    signupDto: SignupDto,
    hashedPassword: string,
  ): Promise<PublicUser> {
    return await this.prisma.user.create({
      data: { ...signupDto, password: hashedPassword },
      select: SAFE_USER_SELECT,
    });
  }

  async updateUser(id: string, updateUserDto: UpdateProfileDto) {
    return await this.prisma.user.update({
      where: { id },
      data: { username: updateUserDto.username },
      select: SAFE_USER_SELECT,
    });
  }

  async getPrivateUserByEmail(email: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { email },
      select: PRIVATE_USER_SELECT,
    });
  }

  async getPrivateUserById(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: PRIVATE_USER_SELECT,
    });
  }

  async updatePassword(id: string, hashedPassword: string, db?: Db) {
    const client = db ?? this.prisma;

    return await client.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: SAFE_USER_SELECT,
    });
  }
}
