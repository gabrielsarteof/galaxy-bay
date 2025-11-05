import { IsString, IsOptional } from 'class-validator';

export class BuyItemDto {
  @IsString()
  nftId: string;

  @IsOptional()
  @IsString()
  transactionHash?: string;
}
