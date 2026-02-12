import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dtos/createUser.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return await this.prismaService.user.create({ data: { ...createUserDto } });
  }

  async findOneByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    return user;
  }

  async findOneById(id: number) {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    return user;
  }
}
