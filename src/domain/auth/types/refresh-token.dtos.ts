export type CreateRefreshTokenDTO = {
  userId: string;
  tokenHash: string;
  tokenPrefix: string;
  expiresAt: Date;
  deviceLabel?: string | null;
  userAgentHash?: string | null;
  ipFirstSeen?: string | null;
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
