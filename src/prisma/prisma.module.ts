import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { UNIT_OF_WORK } from './prisma.unit-of-work';
import { PrismaUnitOfWork } from './prisma.unit-of-work';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    { provide: UNIT_OF_WORK, useClass: PrismaUnitOfWork },
  ],
  exports: [PrismaService, UNIT_OF_WORK],
})
export class PrismaModule {}
