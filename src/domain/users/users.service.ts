import { Inject, Injectable } from '@nestjs/common';
import { UpdateProfileDto } from './types/users.schema';
import {
  USERS_REPOSITORY,
  type IUsersRepository,
} from './infrastructure/users.repository.interface';
import { Db } from 'src/common/db/db.type';
import { CreateUserInput, PrivateUser, PublicUser } from './types/users.types';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}
  /**
   * * * * * * * * * * *
   * Public user profile (safe fields only).
   * * * * * * * * * * *
   */
  async findPublicUserById(id: string, db?: Db): Promise<PublicUser> {
    return this.usersRepository.getPublicUserById(id, db);
  }

  async createUser(
    createUserInput: CreateUserInput,
    hashedPassword: string,
    db?: Db,
  ): Promise<PublicUser> {
    return this.usersRepository.createUser(createUserInput, hashedPassword, db);
  }

  async updateUser(
    id: string,
    updateProfileDto: UpdateProfileDto,
    db?: Db,
  ): Promise<PublicUser> {
    return this.usersRepository.updateUser(id, updateProfileDto, db);
  }

  async updatePassword(
    id: string,
    hashedPassword: string,
    db?: Db,
  ): Promise<PublicUser> {
    return this.usersRepository.updatePassword(id, hashedPassword, db);
  }

  /**
   * * * * * * * * * *
   * Internal methods (can include sensitive relations).
   * * * * * * * * * *
   */
  async findPrivateUserByEmail(
    email: string,
    db?: Db,
  ): Promise<PrivateUser | null> {
    return this.usersRepository.getPrivateUserByEmail(email, db);
  }

  async findPrivateUserById(id: string, db?: Db): Promise<PrivateUser> {
    return this.usersRepository.getPrivateUserById(id, db);
  }
}
