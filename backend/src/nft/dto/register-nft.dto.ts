import { IsString, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class RegisterNftDto {
  @IsString()
  tokenId: string;

  @IsString() @IsOptional()
  name?: string;

  @IsString() @IsOptional()
  description?: string;

  @IsUrl() @IsOptional()
  imageUrl?: string;

  @IsUrl()
  metadataUrl: string;

  @IsNumber()
  price: number;

  @IsString()
  pageId: string;

  @IsString()
  collectionId: string;

  @IsString()
  transactionHash: string;

  @IsString()
  blockHash: string;
}
