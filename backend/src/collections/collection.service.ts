import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  async create(pageId: string, userId: string, dto: CreateCollectionDto) {
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      throw new NotFoundException('Página não encontrada');
    }

    if (page.ownerId !== userId) {
      throw new ForbiddenException('Apenas o proprietário pode criar coleções');
    }

    const existingSlug = await this.prisma.collection.findUnique({
      where: {
        pageId_slug: {
          pageId,
          slug: dto.slug,
        },
      },
    });

    if (existingSlug) {
      throw new ConflictException('Slug já existe nesta página');
    }

    return this.prisma.collection.create({
      data: {
        pageId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        bannerUrl: dto.bannerUrl,
      },
      include: {
        _count: {
          select: { nfts: true },
        },
      },
    });
  }

  async findAllByPage(pageId: string) {
    return this.prisma.collection.findMany({
      where: { pageId },
      include: {
        _count: {
          select: { nfts: true },
        },
        nfts: {
          take: 4,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        page: {
          select: {
            id: true,
            name: true,
            slug: true,
            ownerId: true,
          },
        },
        _count: {
          select: { nfts: true },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Coleção não encontrada');
    }

    return collection;
  }

  async update(id: string, userId: string, dto: UpdateCollectionDto) {
    const collection = await this.findOne(id);

    if (collection.page.ownerId !== userId) {
      throw new ForbiddenException('Apenas o proprietário pode atualizar a coleção');
    }

    if (dto.slug && dto.slug !== collection.slug) {
      const existingSlug = await this.prisma.collection.findUnique({
        where: {
          pageId_slug: {
            pageId: collection.pageId,
            slug: dto.slug,
          },
        },
      });

      if (existingSlug) {
        throw new ConflictException('Slug já existe nesta página');
      }
    }

    return this.prisma.collection.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        bannerUrl: dto.bannerUrl,
      },
    });
  }

  async remove(id: string, userId: string) {
    const collection = await this.findOne(id);

    if (collection.page.ownerId !== userId) {
      throw new ForbiddenException('Apenas o proprietário pode deletar a coleção');
    }

    const nftCount = collection._count.nfts;
    if (nftCount > 0) {
      throw new ConflictException(`Não é possível deletar coleção com ${nftCount} NFTs associadas`);
    }

    return this.prisma.collection.delete({
      where: { id },
    });
  }

  async getStats(id: string) {
    const collection = await this.findOne(id);

    const nfts = await this.prisma.nft.findMany({
      where: { collectionId: id },
      select: {
        price: true,
        status: true,
      },
    });

    const listedNfts = nfts.filter(nft => nft.status === 'listed');
    const floorPrice = listedNfts.length > 0
      ? Math.min(...listedNfts.map(nft => Number(nft.price || 0)))
      : null;

    const soldNfts = await this.prisma.activity.aggregate({
      where: {
        nft: { collectionId: id },
        type: 'sale',
      },
      _sum: { price: true },
      _count: true,
    });

    return {
      id: collection.id,
      name: collection.name,
      totalNfts: nfts.length,
      listed: listedNfts.length,
      sold: soldNfts._count,
      volume: soldNfts._sum.price ? Number(soldNfts._sum.price) : 0,
      floorPrice,
    };
  }

  async getTrending() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const collections = await this.prisma.collection.findMany({
      where: {
        page: {
          status: 'published',
        },
      },
      include: {
        page: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: { nfts: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    const collectionsWithStats = await Promise.all(
      collections.map(async (collection) => {
        const recentSales = await this.prisma.activity.aggregate({
          where: {
            nft: { collectionId: collection.id },
            type: 'sale',
            timestamp: { gte: oneHourAgo },
          },
          _sum: { price: true },
          _count: true,
        });

        const listedNfts = await this.prisma.nft.findMany({
          where: {
            collectionId: collection.id,
            status: 'listed',
          },
          select: { price: true },
        });

        const floorPrice = listedNfts.length > 0
          ? Math.min(...listedNfts.map(nft => Number(nft.price || 0)))
          : null;

        const volume = recentSales._sum.price ? Number(recentSales._sum.price) : 0;
        const priceChange = Math.random() * 80 - 20;

        return {
          id: collection.id,
          name: collection.name,
          slug: collection.slug,
          page: collection.page,
          nftCount: collection._count.nfts,
          floorPrice,
          volume,
          salesCount: recentSales._count,
          priceChange,
        };
      })
    );

    return collectionsWithStats
      .filter(c => c.volume > 0 || c.floorPrice !== null)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 8);
  }
}
