import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty }          from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Endereço Ethereum do usuário',
    example: '0x1234abcd5678efgh9012ijklmnopqrstuvwx',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Assinatura gerada pelo usuário para provar propriedade do address',
    example: '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef1',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;
}
