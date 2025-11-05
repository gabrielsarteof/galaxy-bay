import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: 'ey…jwt-token…abc', description: 'Token de acesso JWT' })
  accessToken: string;
}
