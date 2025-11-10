import { IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FeaturedNftsQueryDto {
  @ApiPropertyOptional({ description: 'Número de NFTs', default: 8, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 8;

  @ApiPropertyOptional({
    description: 'Tipo de ordenação',
    enum: ['recent', 'price-high', 'price-low', 'popular'],
    default: 'recent'
  })
  @IsOptional()
  @IsIn(['recent', 'price-high', 'price-low', 'popular'])
  sortBy?: string = 'recent';
}
