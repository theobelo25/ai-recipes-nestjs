import { Db } from '../db/db.type';

export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK');

export interface IUnitOfWork {
  transaction<T>(fn: (db: Db) => Promise<T>): Promise<T>;
}
