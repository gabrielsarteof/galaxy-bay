import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PageResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Identificador único da página',
  })
  id: string;

  @ApiProperty({
    example: 'Galaxy Bay Official',
    description: 'Nome para exibição da página',
  })
  name: string;

  @ApiProperty({
    example: 'galaxy-bay-official',
    description: 'Slug único para URL',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'O melhor lugar para explorar o universo NFT.',
    description: 'Tagline curta da página',
  })
  tagline?: string;

  @ApiPropertyOptional({
    example: 'Aqui você encontra …',
    description: 'Descrição completa em texto rico',
  })
  description?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.exemplo.com/avatar.png',
    description: 'URL do avatar da página',
  })
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.exemplo.com/banner.jpg',
    description: 'URL do banner da página',
  })
  bannerUrl?: string;

  @ApiPropertyOptional({
    example: 'draft',
    description: "Status da página (por exemplo: 'draft', 'published')",
  })
  status?: string;

  @ApiPropertyOptional({
    example: 'arte digital',
    description: 'Categoria da página',
  })
  category?: string;

  @ApiPropertyOptional({
    example: ['nft', 'arte', 'galáxia'],
    description: 'Tags associadas à página',
    type: [String],
  })
  tags?: string[];

  @ApiProperty({
    example: 123,
    description: 'Total de visualizações da página',
  })
  viewCount: number;

  @ApiProperty({
    example: 45,
    description: 'Total de inscritos na página',
  })
  salesCount: number;

  @ApiProperty({
    example: '2025-05-11T14:23:00.000Z',
    description: 'Data de criação da página',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-05-12T08:30:00.000Z',
    description: 'Data da última atualização da página',
    format: 'date-time',
  })
  updatedAt: Date;
}
