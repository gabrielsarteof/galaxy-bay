import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ActivityType } from '@prisma/client';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateActivityDto) {
    const nft = await this.prisma.nft.findUnique({
      where: { id: dto.nftId },
      include: { page: true },
    });

    if (!nft) {
      throw new NotFoundException('NFT não encontrada');
    }

    return this.prisma.activity.create({
      data: {
        nftId: dto.nftId,
        pageId: nft.pageId,
        type: dto.type as ActivityType,
        fromAddress: dto.fromAddress,
        toAddress: dto.toAddress,
        price: dto.price,
        transactionHash: dto.transactionHash,
        blockNumber: dto.blockNumber,
      },
      include: {
        nft: {
          select: {
            id: true,
            tokenId: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  async findByPage(
    pageId: string,
    filters?: {
      type?: ActivityType;
      nftId?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const { type, nftId, limit = 20, offset = 0 } = filters || {};

    return this.prisma.activity.findMany({
      where: {
        pageId,
        ...(type && { type }),
        ...(nftId && { nftId }),
      },
      include: {
        nft: {
          select: {
            id: true,
            tokenId: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async findByNft(nftId: string, limit = 20, offset = 0) {
    const nft = await this.prisma.nft.findUnique({
      where: { id: nftId },
    });

    if (!nft) {
      throw new NotFoundException('NFT não encontrada');
    }

    return this.prisma.activity.findMany({
      where: { nftId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getRecentActivities(pageId: string, limit = 5) {
    return this.findByPage(pageId, { limit });
  }

  async findRecent(limit = 10) {
    return this.prisma.activity.findMany({
      include: {
        nft: {
          select: {
            id: true,
            tokenId: true,
            name: true,
            imageUrl: true,
            page: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
