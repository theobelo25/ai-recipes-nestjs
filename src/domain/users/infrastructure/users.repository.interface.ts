import type { UpdateProfileDto } from '../types/users.schema';
import { CreateUserInput, PrivateUser, PublicUser } from '../types/users.types';
import { Db } from 'src/common/db/db.type';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface IUsersRepository {
  getPublicUserById(id: string, db?: Db): Promise<PublicUser>;
  createUser(
    createUserInput: CreateUserInput,
    hashedPassword: string,
    db?: Db,
  ): Promise<PublicUser>;
  updateUser(id: string, dto: UpdateProfileDto, db?: Db): Promise<PublicUser>;
  updatePassword(
    id: string,
    hashedPassword: string,
    db?: Db,
  ): Promise<PublicUser>;
  getPrivateUserByEmail(email: string, db?: Db): Promise<PrivateUser | null>;
  getPrivateUserById(id: string, db?: Db): Promise<PrivateUser>;
}
