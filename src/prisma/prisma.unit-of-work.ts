import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UnitOfWork } from 'src/common/db/unit-of-work';
import { Db } from './types/db.type';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  transaction<T>(fn: (db: Db) => Promise<T>) {
    return this.prisma.$transaction((tx) => fn(tx));
  }
}
