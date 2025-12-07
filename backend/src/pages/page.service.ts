import { Injectable, ConflictException, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaService } from '@/../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { DiscoverQueryDto } from './dto/discover-query.dto';
import { Page, Prisma } from '@prisma/client';
import { IStorageService } from '@/core/interfaces/storage.interface';
import { ImageGeneratorService } from '@/infrastructure/storage/image-generator.service';
import axios from 'axios';

@Injectable()
export class PageService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IStorageService') private readonly storage: IStorageService,
    private readonly imageGenerator: ImageGeneratorService,
  ) {}

  async create(ownerId: string, dto: CreatePageDto) {
    console.log('[PageService.create] Iniciando criação de página');
    console.log('[PageService.create] ownerId recebido:', ownerId);
    console.log('[PageService.create] dto:', dto);

    // Verifica se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: ownerId },
    });
    console.log('[PageService.create] Usuário encontrado:', user ? 'SIM' : 'NÃO');
    if (!user) {
      throw new ConflictException('Usuário não encontrado no sistema');
    }

    // Verifica se usuário já possui uma página
    const existing = await this.prisma.page.findUnique({
      where: { ownerId },
    });
    if (existing) {
      throw new ConflictException(
        'Você já possui uma página cadastrada'
      );
    }

    // Valida unicidade do slug
    const slugExists = await this.prisma.page.findUnique({
      where: { slug: dto.slug },
    });
    if (slugExists) {
      throw new ConflictException('O slug informado já está em uso');
    }

    console.log('[PageService.create] Validações OK, criando página...');

    // Cria página
    const page = await this.prisma.page.create({
      data: {
        ownerId,
        name: dto.name,
        slug: dto.slug,
        tagline: dto.tagline,
        description: dto.description,
        status: dto.status,
        category: dto.category,
        tags: dto.tags,
      },
    });

    // Gera imagens padrão de forma síncrona
    try {
      await this.generatePageImagesAsync(page.id, page.name);
    } catch (error) {
      console.error('[PageService] Erro ao gerar imagens:', error);
    }

    return page;
  }

  /**
   * Gera imagens padrão para uma página em background.
   * Este método roda de forma assíncrona e não bloqueia a criação da página.
   */
  private async generatePageImagesAsync(pageId: string, pageName: string): Promise<void> {
    try {
      // Gera e salva avatar
      const avatarUrl = this.imageGenerator.getDefaultAvatarUrl(pageName);
      const avatarResponse = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
      const avatarSvgBuffer = Buffer.from(avatarResponse.data);
      const avatarPngBuffer = await this.imageGenerator.convertAvatarToPng(avatarSvgBuffer);
      const avatarPath = `avatars/${pageId}/avatar.png`;
      await this.storage.upload(avatarPath, avatarPngBuffer, 'image/png');

      // Gera e salva banner
      const bannerSvgBuffer = this.imageGenerator.generateDefaultBanner(pageName);
      const bannerPngBuffer = await this.imageGenerator.convertBannerToPng(bannerSvgBuffer);
      const bannerPath = `banners/${pageId}/banner.png`;
      await this.storage.upload(bannerPath, bannerPngBuffer, 'image/png');
    } catch (error) {
      console.error('[PageService] Erro ao gerar imagens:', error);
      throw error;
    }
  }

  async findOneByOwner(ownerId: string) {
    const page = await this.prisma.page.findUnique({
      where: { ownerId },
      include: {
        collections: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { nfts: true },
            },
          },
        },
      },
    });
    if (!page) {
      throw new NotFoundException('Página não encontrada');
    }
    return page;
  }

  async findOneById(ownerId: string, id: string) {
    const page = await this.prisma.page.findFirst({
      where: { ownerId, id },
    });
    if (!page) {
      throw new NotFoundException('Página não encontrada');
    }
    return page;
  }

  async findOneBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
    });
    if (!page) {
      throw new NotFoundException('Página não encontrada');
    }
    return page;
  }

  async update(ownerId: string, id: string, dto: UpdatePageDto): Promise<Page> {
    const page = await this.findOneById(ownerId, id);

    // Valida novo slug se fornecido
    if (dto.slug && dto.slug !== page.slug) {
      const slugExists = await this.prisma.page.findUnique({
        where: { slug: dto.slug },
      });
      if (slugExists) {
        throw new ConflictException('O slug informado já está em uso');
      }
    }

    return this.prisma.page.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Upload de avatar e/ou banner com estratégia de ID fixo.
   * Path fixo: {type}/{pageId}/{filename}.ext
   * Sobrescreve arquivo anterior automaticamente (zero órfãos).
   */
  async uploadImages(
    ownerId: string,
    id: string,
    files: {
      avatar?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ): Promise<Page> {
    const page = await this.findOneById(ownerId, id);

    if (files.avatar && files.avatar.length > 0) {
      const file = files.avatar[0];
      const pngBuffer = await this.imageGenerator.convertAvatarToPng(file.buffer);
      const filePath = `avatars/${id}/avatar.png`;
      await this.storage.upload(filePath, pngBuffer, 'image/png');
    }

    if (files.banner && files.banner.length > 0) {
      const file = files.banner[0];
      const pngBuffer = await this.imageGenerator.convertBannerToPng(file.buffer);
      const filePath = `banners/${id}/banner.png`;
      await this.storage.upload(filePath, pngBuffer, 'image/png');
    }

    // Retorna página sem modificar avatarUrl/bannerUrl no banco
    // URLs são construídas dinamicamente no frontend usando pageId
    return page;
  }

  async getStats(slug: string) {
    const page = await this.findOneBySlug(slug);

    const [totalNfts, listedNfts, holders, soldActivities, featuredNfts] = await Promise.all([
      this.prisma.nft.count({
        where: { pageId: page.id },
      }),

      this.prisma.nft.findMany({
        where: { pageId: page.id, status: 'listed' },
        select: { price: true },
        orderBy: { price: 'asc' },
        take: 1,
      }),

      this.prisma.nft.findMany({
        where: { pageId: page.id },
        select: { ownerId: true },
        distinct: ['ownerId'],
      }),

      this.prisma.activity.aggregate({
        where: {
          pageId: page.id,
          type: 'sale',
        },
        _sum: { price: true },
        _count: true,
      }),

      this.prisma.nft.findMany({
        where: {
          id: { in: page.featuredNftIds },
        },
        select: {
          id: true,
          tokenId: true,
          name: true,
          imageUrl: true,
          price: true,
          status: true,
        },
        take: 4,
      }),
    ]);

    const floorPrice = listedNfts.length > 0 && listedNfts[0].price
      ? Number(listedNfts[0].price)
      : null;

    return {
      totalNfts,
      totalSold: soldActivities._count,
      totalHolders: holders.length,
      totalVolume: soldActivities._sum.price ? Number(soldActivities._sum.price) : 0,
      floorPrice,
      featuredNfts,
    };
  }

  async getCommunityStats(slug: string) {
    const page = await this.findOneBySlug(slug);

    const [nfts, totalHolders] = await Promise.all([
      this.prisma.nft.groupBy({
        by: ['ownerId'],
        where: { pageId: page.id },
        _count: { ownerId: true },
        orderBy: { _count: { ownerId: 'desc' } },
        take: 10,
      }),

      this.prisma.nft.findMany({
        where: { pageId: page.id },
        select: { ownerId: true },
        distinct: ['ownerId'],
      }),
    ]);

    const topHolders = await Promise.all(
      nfts.map(async (item) => {
        const user = await this.prisma.user.findUnique({
          where: { id: item.ownerId },
          select: { address: true, username: true },
        });
        return {
          address: user?.address || item.ownerId,
          username: user?.username,
          nftsOwned: item._count.ownerId,
        };
      }),
    );

    const totalNfts = nfts.reduce((sum, item) => sum + item._count.ownerId, 0);

    return {
      totalHolders: totalHolders.length,
      totalNftsOwned: totalNfts,
      topHolders,
      benefitsText: page.benefitsText,
    };
  }

  async discover(query: DiscoverQueryDto) {
    const { category, search, page = 1, limit = 12, sortBy = 'recent' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PageWhereInput = {
      status: 'published',
      ...(category && category !== 'Tudo' && { category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { hasSome: [search] } },
        ],
      }),
    };

    const orderBy: Prisma.PageOrderByWithRelationInput =
      sortBy === 'popular' ? { viewCount: 'desc' } :
      sortBy === 'volume' ? { salesCount: 'desc' } :
      sortBy === 'name' ? { name: 'asc' } :
      { createdAt: 'desc' };

    const [pages, total] = await Promise.all([
      this.prisma.page.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          owner: { select: { address: true, username: true } },
          _count: { select: { nfts: true } },
        },
      }),
      this.prisma.page.count({ where }),
    ]);

    return {
      data: pages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTrending(limit: number = 5) {
    const pages = await this.prisma.page.findMany({
      where: { status: 'published' },
      take: limit,
      orderBy: [
        { salesCount: 'desc' },
        { viewCount: 'desc' },
      ],
      include: {
        owner: { select: { address: true, username: true } },
        _count: { select: { nfts: true } },
      },
    });

    return pages;
  }

  async getCategories() {
    const pages = await this.prisma.page.findMany({
      where: {
        status: 'published',
        category: { not: null },
      },
      select: { category: true },
      distinct: ['category'],
    });

    const categories = ['Tudo', ...pages.map(p => p.category).filter(Boolean)];
    return categories;
  }
}
