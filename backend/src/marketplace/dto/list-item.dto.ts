import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class ListItemDto {
  @IsString()
  nftId: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  transactionHash?: string;
}
