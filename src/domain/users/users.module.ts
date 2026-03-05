import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaUsersRepository } from './infrastructure/prisma-users.repository';
import { USERS_REPOSITORY } from './infrastructure/users.repository.interface';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaUsersRepository,
    { provide: USERS_REPOSITORY, useExisting: PrismaUsersRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}
