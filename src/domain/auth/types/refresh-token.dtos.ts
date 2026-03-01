export type CreateRefreshTokenDTO = {
  userId: string;
  tokenHash: string;
  tokenPrefix: string;
  expiresAt: Date;
};

export type RotateRefreshTokenDTO = {
  currentId: string;
  userId: string;
  tokenHash: string;
  tokenPrefix: string;
  expiresAt: Date;
};

export type ReplaceRefreshTokenDTO = {
  currentId: string;
  replacedById: string;
  now: Date;
};
