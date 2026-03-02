import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/prisma/generated/client';
import { Db } from 'src/common/db/db.type';

export type PrismaDb = PrismaService | Prisma.TransactionClient;

export const asPrismaDb = (prisma: PrismaService, db?: Db): PrismaDb => {
  // If you pass a TransactionClient from $transaction callback,
  // it will have the same model delegates (recipe, ingredient, etc.)
  return (db as PrismaDb) ?? prisma;
};
