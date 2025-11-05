import { IsOptional, IsString, MaxLength, IsUrl, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alice' })
  @IsString() @IsOptional() @MaxLength(30)
  displayName?: string;

  @ApiPropertyOptional({ example: 'alice123' })
  @IsString() @IsOptional() @MaxLength(30)
  username?: string;

  @ApiPropertyOptional({ example: 'Desenvolvedora e colecionadora de NFTs.' })
  @IsString() @IsOptional() @MaxLength(280)
  bio?: string;

  @ApiPropertyOptional({ example: 'São Paulo, Brasil' })
  @IsString() @IsOptional() @MaxLength(50)
  location?: string;

  @ApiPropertyOptional({ example: 'https://.../avatar.png' })
  @IsUrl() @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'https://.../banner.png' })
  @IsUrl() @IsOptional()
  bannerUrl?: string;
}