import { Prisma } from '../generated/client';
import { PrismaService } from '../prisma.service';

export type Db = PrismaService | Prisma.TransactionClient;

export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK');
