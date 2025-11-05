import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BlockchainModule } from '../utils/blockchain.module';

@Module({
  imports: [PrismaModule, BlockchainModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
