import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiPropertyOptional({
    description: 'Nome de exibição do usuário',
    example: 'Alice',
  })
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Handle público (username) do usuário',
    example: 'alice123',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'Biografia curta do usuário',
    example: 'Desenvolvedora de dApps apaixonada por NFTs.',
  })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Localização geográfica do usuário',
    example: 'São Paulo, Brasil',
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'URL da imagem de avatar do usuário',
    example: 'https://meusite.com/avatar.png',
  })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'URL da imagem de banner do perfil',
    example: 'https://meusite.com/banner.png',
  })
  bannerUrl?: string;
}
