import { IsString, IsOptional } from 'class-validator';

export class CancelListingDto {
  @IsString()
  nftId: string;

  @IsOptional()
  @IsString()
  transactionHash?: string;
}
