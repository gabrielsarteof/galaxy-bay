import { ApiProperty } from '@nestjs/swagger';

export class RequestNonceResponseDto {
  @ApiProperty({ example: 'random-string-nonce', description: 'Nonce gerado para assinar' })
  nonce: string;
}