import { Module } from '@nestjs/common';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';
import { PinataModule } from '../utils/pinata.module';
import { IpfsModule } from '../utils/ipfs.module';

@Module({
  imports: [
    PinataModule, // Novo: Pinata para uploads IPFS
    IpfsModule,   // Mantido temporariamente para compatibilidade
  ],
  controllers: [NftController],
  providers: [NftService],
  exports: [NftService],
})
export class NftModule {}
