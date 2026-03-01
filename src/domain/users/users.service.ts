import { Inject, Injectable } from '@nestjs/common';
import { UpdateProfileDto } from './types/users.schema';
import {
  USERS_REPOSITORY,
  type UsersRepositoryPort,
} from './infrastructure/users.repository.port';
import { SignupDto } from '../auth/types/auth.schema';
import { Db } from 'src/prisma/types/db.type';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepositoryPort,
  ) {}
  /**
   * * * * * * * * * * *
   * Public user profile (safe fields only).
   * * * * * * * * * * *
   */
  async findPublicUserById(id: string) {
    return this.usersRepository.getPublicUserById(id);
  }

  async createUser(signupDto: SignupDto, hashedPassword: string) {
    return this.usersRepository.createUser(signupDto, hashedPassword);
  }

  async updateUser(id: string, updateProfileDto: UpdateProfileDto) {
    return this.usersRepository.updateUser(id, updateProfileDto);
  }

  async updatePassword(id: string, hashedPassword: string, db?: Db) {
    return this.usersRepository.updatePassword(id, hashedPassword, db);
  }

  /**
   * * * * * * * * * *
   * Internal methods (can include sensitive relations).
   * * * * * * * * * *
   */
  async findPrivateUserByEmail(email: string) {
    return this.usersRepository.getPrivateUserByEmail(email);
  }

  async findPrivateUserById(id: string) {
    return this.usersRepository.getPrivateUserById(id);
  }
}
