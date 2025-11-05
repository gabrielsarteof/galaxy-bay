import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { verifyMessage } from 'ethers';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
  ) { }

  // Método para registrar um novo usuário
  async register(registerDto: RegisterDto) {
    const { address } = registerDto;

    const userExists = await this.prisma.user.findUnique({ where: { address } });
    if (userExists) {
      throw new ConflictException('Usuário já existe');
    }

    const user = await this.userService.createUser(address);
    return { message: 'Usuário registrado com sucesso', user };
  }

  // Método para verificar a assinatura e gerar o token
  async verifySignature(address: string, signature: string) {
    const user = await this.prisma.user.findUnique({ where: { address } });
    if (!user || !user.nonce) {
      this.logger.warn(`Login falhou: usuário inexistente ou nonce ausente [address=${address}]`);
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Usuário não encontrado ou nonce inválido.',
        error: 'Unauthorized',
      });
    }

    this.logger.log(`Esperando assinatura sobre ="${user.nonce}"`);

    const expectedMessage = user.nonce;
    let signer: string;

    try {
      signer = verifyMessage(expectedMessage, signature);
    } catch (err) {
      this.logger.warn(`Assinatura malformada recebida para ${address}`, err);
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Assinatura inválida.',
        error: 'Unauthorized',
      });
    }

    if (signer.toLowerCase() !== address.toLowerCase()) {
      this.logger.warn(`Assinatura não corresponde ao endereço. [expected=${address}, received=${signer}]`);
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Assinatura não corresponde ao endereço informado.',
        error: 'Unauthorized',
      });
    }

    const token = this.jwtService.sign({ sub: user.id, address: user.address });

    await this.prisma.user.update({
      where: { address },
      data: { nonce: '' },
    });

    return { access_token: token };
  }

  // Rota para pedir o nonce (usado na assinatura)
  async requestNonce(address: string) {
    const nonce = uuidv4();
    await this.prisma.user.upsert({
      where: { address },
      update: { nonce },
      create: { address, nonce },
    });
    return { nonce };
  }
}
