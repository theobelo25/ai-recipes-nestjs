/**
 * Public API for auth: guards, decorators, and shared types.
 * Other domains can import from here instead of deep paths.
 */
export { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
export { Public } from './decorators/public.decorator';
export { User } from './decorators/user.decorator';
export { RefreshToken } from './decorators/refresh-token.decorator';
export { RotatedRefreshToken } from './decorators/rotated-refresh.decorator';
export type { RequestUser } from './interfaces/request-user.interface';
export type { JwtPayload } from './interfaces/jwt-payload.interface';
