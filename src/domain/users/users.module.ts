import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaUsersRepository } from './infrastructure/prisma-users.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { USERS_REPOSITORY } from './infrastructure/users.repository.interface';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaUsersRepository,
    { provide: USERS_REPOSITORY, useExisting: PrismaUsersRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}
