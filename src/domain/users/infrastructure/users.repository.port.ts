import { SignupDto } from 'src/domain/auth/types/auth.schema';
import type { UpdateProfileDto } from '../types/users.schema';
import { PrivateUser, PublicUser } from '../types/users.types';
import { Db } from 'src/prisma/types/db.type';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface UsersRepositoryPort {
  getPublicUserById(id: string): Promise<PublicUser>;
  createUser(signupDto: SignupDto, hashedPassword: string): Promise<PublicUser>;
  updateUser(id: string, dto: UpdateProfileDto): Promise<PublicUser>;
  updatePassword(
    id: string,
    hashedPassword: string,
    db?: Db,
  ): Promise<PublicUser>;
  getPrivateUserByEmail(email: string): Promise<PrivateUser>;
  getPrivateUserById(id: string): Promise<PrivateUser>;
}
