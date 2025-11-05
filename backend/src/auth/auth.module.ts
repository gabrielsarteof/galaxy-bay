import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '1h' } })],
  controllers: [AuthController],
  providers: [AuthService, UserService, PrismaService, JwtStrategy],
})
export class AuthModule {}
