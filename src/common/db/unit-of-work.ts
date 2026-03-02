import { Db } from './db.type';

export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK');

export interface UnitOfWork {
  transaction<T>(fn: (db: Db) => Promise<T>): Promise<T>;
}
