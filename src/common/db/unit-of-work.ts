import { Db } from 'src/prisma/types/db.type';

export interface UnitOfWork {
  transaction<T>(fn: (db: Db) => Promise<T>): Promise<T>;
}
