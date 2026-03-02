import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUnitOfWork } from './unit-of-work.interface';
import { Db } from '../db/db.type';

@Injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  transaction<T>(fn: (db: Db) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) => fn(tx));
  }
}
