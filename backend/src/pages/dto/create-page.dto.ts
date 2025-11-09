import {
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsUrl,
  IsArray,
  ArrayUnique,
  IsEnum
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PageStatus } from '@prisma/client';

export class CreatePageDto {
  @ApiProperty({ example: 'Galaxy Bay Official', description: 'Nome para exibição da página' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'galaxy-bay-official', description: 'Slug único para URL (apenas minúsculas, números e hífens)' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'O slug só pode ter letras minúsculas, números e hífens',
  })
  slug: string;

  @ApiPropertyOptional({ example: 'O melhor lugar para explorar o universo NFT.', description: 'Tagline curta da página' })
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional({ example: 'Aqui você encontra …', description: 'Descrição completa em texto ricco' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.exemplo.com/avatar.png', description: 'URL do avatar da página' })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.exemplo.com/banner.jpg', description: 'URL do banner da página' })
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @ApiPropertyOptional({ example: 'draft', enum: PageStatus, description: "Status da página" })
  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @ApiPropertyOptional({ example: 'arte digital', description: 'Categoria da página' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: ['nft', 'arte', 'galáxia'], description: 'Tags associadas à página' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'https://twitter.com/galaxy-bay', description: 'URL do perfil no Twitter' })
  @IsOptional()
  @IsUrl()
  twitterUrl?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/galaxy-bay', description: 'URL do perfil no Instagram' })
  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @ApiPropertyOptional({ example: 'https://galaxy-bay.com', description: 'URL do website' })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiPropertyOptional({ example: 'https://discord.gg/galaxy-bay', description: 'URL do servidor Discord' })
  @IsOptional()
  @IsUrl()
  discordUrl?: string;

  @ApiPropertyOptional({ example: 'Holders ganham acesso exclusivo a eventos e lançamentos.', description: 'Texto descrevendo benefícios para a comunidade' })
  @IsOptional()
  @IsString()
  benefitsText?: string;

  @ApiPropertyOptional({ example: ['uuid1', 'uuid2'], description: 'IDs dos NFTs em destaque' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  featuredNftIds?: string[];
}
