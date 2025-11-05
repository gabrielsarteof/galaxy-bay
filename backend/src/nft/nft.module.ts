import { Module } from '@nestjs/common';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';
import { IpfsModule } from '../utils/ipfs.module';

@Module({
  imports: [IpfsModule],
  controllers: [NftController],
  providers: [NftService]
})
export class NftModule {}
