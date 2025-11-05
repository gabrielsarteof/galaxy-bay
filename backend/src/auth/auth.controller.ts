// backend/src/auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService }            from './auth.service';
import { LoginDto }               from './dto/login.dto';
import { RegisterDto }            from './dto/register.dto';
import { RequestNonceResponseDto } from './dto/request-nonce-response.dto';
import { LoginResponseDto }        from './dto/login-response.dto';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBody,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async register(
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.register(registerDto);
  }

  @Post('request-nonce')
  @ApiOperation({ summary: 'Solicitar nonce para autenticação' })
  @ApiBody({
    schema: { type: 'object', properties: { address: { type: 'string', example: '0x…' } } },
  })
  @ApiResponse({
    status: 200,
    description: 'Nonce gerado com sucesso.',
    type: RequestNonceResponseDto,       // ← informa o tipo de resposta
  })
  async getNonce(@Body() body: { address: string }) {
    return this.authService.requestNonce(body.address);
  }

  @Post('login')
  @ApiOperation({ summary: 'Verificar assinatura e gerar JWT' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'JWT gerado com sucesso.',
    type: LoginResponseDto,              // ← informa o tipo de resposta
  })
  @ApiResponse({ status: 401, description: 'Assinatura inválida.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.verifySignature(loginDto.address, loginDto.signature);
  }
}
