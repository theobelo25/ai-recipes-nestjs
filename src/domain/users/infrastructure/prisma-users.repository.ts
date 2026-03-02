import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PRIVATE_USER_SELECT,
  PUBLIC_USER_SELECT,
} from '../types/users.constants';
import { UpdateProfileDto } from '../types/users.schema';
import { IUsersRepository } from './users.repository.interface';
import { CreateUserInput, PrivateUser, PublicUser } from '../types/users.types';
import { asPrismaDb } from 'src/prisma/prisma-db.util';
import { Db } from 'src/common/db/db.type';

@Injectable()
export class PrismaUsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicUserById(id: string, db?: Db): Promise<PublicUser> {
    const prisma = asPrismaDb(this.prisma, db);

    return prisma.user.findUniqueOrThrow({
      where: { id },
      select: PUBLIC_USER_SELECT,
    });
  }

  async createUser(
    createUserInput: CreateUserInput,
    hashedPassword: string,
    db?: Db,
  ): Promise<PublicUser> {
    const prisma = asPrismaDb(this.prisma, db);

    return prisma.user.create({
      data: { ...createUserInput, password: hashedPassword },
      select: PUBLIC_USER_SELECT,
    });
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateProfileDto,
    db?: Db,
  ): Promise<PublicUser> {
    const prisma = asPrismaDb(this.prisma, db);

    return prisma.user.update({
      where: { id },
      data: { username: updateUserDto.username },
      select: PUBLIC_USER_SELECT,
    });
  }

  async getPrivateUserByEmail(email: string, db?: Db): Promise<PrivateUser> {
    const prisma = asPrismaDb(this.prisma, db);

    return prisma.user.findUniqueOrThrow({
      where: { email },
      select: PRIVATE_USER_SELECT,
    });
  }

  async getPrivateUserById(id: string, db?: Db): Promise<PrivateUser> {
    const prisma = asPrismaDb(this.prisma, db);

    return prisma.user.findUniqueOrThrow({
      where: { id },
      select: PRIVATE_USER_SELECT,
    });
  }

  async updatePassword(
    id: string,
    hashedPassword: string,
    db?: Db,
  ): Promise<PublicUser> {
    const prisma = asPrismaDb(this.prisma, db);

    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: PUBLIC_USER_SELECT,
    });
  }
}
