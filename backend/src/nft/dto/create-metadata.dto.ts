// backend/src/nft/dto/create-metadata.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class Attribute {
  @ApiProperty({ description: 'Tipo de trait do atributo', example: 'Background' })
  @IsString()
  @IsNotEmpty()
  trait_type: string;

  @ApiProperty({ description: 'Valor do atributo', example: 'Blue' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateMetadataDto {
  @ApiProperty({ description: 'Nome da NFT', example: 'Minha NFT' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Descrição da NFT', example: 'Descrição detalhada da minha NFT' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'URL da imagem da NFT', example: 'https://ipfs.io/ipfs/abcdef123456/image.png' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiPropertyOptional({
    description: 'Lista de atributos adicionais da NFT',
    type: [Attribute],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Attribute)
  @IsOptional()
  attributes?: Attribute[];
}
