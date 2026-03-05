/**
 * Public API for users: module, service, and shared types.
 * Other domains can import from here instead of deep paths.
 */
export { UsersModule } from './users.module';
export { UsersService } from './users.service';
export type { PublicUser, PrivateUser, CreateUserInput } from './types/users.types';
