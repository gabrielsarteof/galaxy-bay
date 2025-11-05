import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetListingsDto {
  @IsOptional()
  @IsString()
  pageId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
