import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { IndexerService } from './indexer.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BlockchainModule } from '../utils/blockchain.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    BlockchainModule,
  ],
  providers: [IndexerService],
  exports: [IndexerService],
})
export class BlockchainIndexerModule {}
