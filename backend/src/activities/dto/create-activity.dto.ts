import { IsString, IsOptional, IsNumber, IsEnum, IsEthereumAddress } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty({ example: 'uuid-nft-id', description: 'ID da NFT' })
  @IsString()
  nftId: string;

  @ApiProperty({ example: 'sale', enum: ['mint', 'list', 'sale', 'transfer', 'offer', 'cancel'] })
  @IsEnum(['mint', 'list', 'sale', 'transfer', 'offer', 'cancel'])
  type: string;

  @ApiPropertyOptional({ example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', description: 'Endereço de origem' })
  @IsOptional()
  @IsString()
  fromAddress?: string;

  @ApiPropertyOptional({ example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', description: 'Endereço de destino' })
  @IsOptional()
  @IsString()
  toAddress?: string;

  @ApiPropertyOptional({ example: 1.5, description: 'Preço da transação em ETH' })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ example: '0xabc123...', description: 'Hash da transação blockchain' })
  @IsOptional()
  @IsString()
  transactionHash?: string;

  @ApiPropertyOptional({ example: 12345678, description: 'Número do bloco' })
  @IsOptional()
  @IsNumber()
  blockNumber?: number;
}
