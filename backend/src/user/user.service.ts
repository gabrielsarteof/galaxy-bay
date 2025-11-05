import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async createUser(address: string) {
    const nonce = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        address,
        nonce,
      },
    });

    return user;
  }

  async getProfile(address: string) {
    const user = await this.prisma.user.findUnique({
      where: { address },
      include: {
        page: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      username: user.username,
      avatarUrl: user.avatarUrl,
      page: user.page
        ? {
          id: user.page.id,
          name: user.page.name,
          slug: user.page.slug,
        }
        : null,
    };
  }

  async updateProfile(address: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { address } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.prisma.user.update({
      where: { address },
      data: {
        username: dto.username,
        avatarUrl: dto.avatarUrl,
      },
    });
  }
}
