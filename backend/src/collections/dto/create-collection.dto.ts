import { IsString, MinLength, Matches, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCollectionDto {
  @ApiProperty({ example: 'Galaxy Series', description: 'Nome da coleção' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'galaxy-series', description: 'Slug único (minúsculas, números, hífens)' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug deve conter apenas letras minúsculas, números e hífens',
  })
  slug: string;

  @ApiPropertyOptional({ example: 'Coleção de arte espacial cyberpunk', description: 'Descrição da coleção' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.exemplo.com/banner.jpg', description: 'URL do banner da coleção' })
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;
}
