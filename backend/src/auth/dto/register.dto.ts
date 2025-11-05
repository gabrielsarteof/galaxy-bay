import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Endereço Ethereum do usuário',
    example: '0x1234abcd5678efgh9012ijklmnopqrstuvwx',
  })
  @IsNotEmpty()
  @IsEthereumAddress()
  address: string;
}
