import { Injectable, ConflictException, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaService } from '@/../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Page } from '@prisma/client';
import { IStorageService } from '@/core/interfaces/storage.interface';
import { ImageGeneratorService } from '@/infrastructure/storage/image-generator.service';

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

    // Cria página SEM imagens primeiro (precisa do ID)
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
        // avatarUrl e bannerUrl serão adicionados depois
      },
    });

    console.log(`[PageService] Página criada, gerando imagens padrão...`);

    try {
      const version = Date.now();

      // Gera e salva avatar (converte SVG para PNG)
      const avatarUrl = this.imageGenerator.getDefaultAvatarUrl(page.name);
      const avatarResponse = await fetch(avatarUrl);
      const avatarSvgBuffer = Buffer.from(await avatarResponse.arrayBuffer());
      const avatarPngBuffer = await this.imageGenerator.convertAvatarToPng(avatarSvgBuffer);
      const avatarPath = `avatars/${page.id}/avatar.png`;
      await this.storage.upload(avatarPath, avatarPngBuffer, 'image/png');
      const avatarPublicUrl = this.storage.getPublicUrl(avatarPath, version);

      // Gera e salva banner (converte SVG para PNG)
      const bannerSvgBuffer = this.imageGenerator.generateDefaultBanner(page.name);
      const bannerPngBuffer = await this.imageGenerator.convertBannerToPng(bannerSvgBuffer);
      const bannerPath = `banners/${page.id}/banner.png`;
      await this.storage.upload(bannerPath, bannerPngBuffer, 'image/png');
      const bannerPublicUrl = this.storage.getPublicUrl(bannerPath, version);

      // Atualiza página com as URLs
      const updatedPage = await this.prisma.page.update({
        where: { id: page.id },
        data: {
          avatarUrl: avatarPublicUrl,
          bannerUrl: bannerPublicUrl,
        },
      });

      console.log(`[PageService] ✅ Imagens salvas no storage e banco!`);
      return updatedPage;
    } catch (error) {
      console.error('[PageService] ❌ Erro ao gerar imagens:', error);
      // Retorna página mesmo sem imagens
      return page;
    }
  }

  async findOneByOwner(ownerId: string) {
    const page = await this.prisma.page.findUnique({
      where: { ownerId },
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
    await this.findOneById(ownerId, id);

    const updateData: Partial<Page> = {};
    const version = Date.now();

    if (files.avatar && files.avatar.length > 0) {
      const file = files.avatar[0];
      // Converte para PNG e padroniza extensão
      const pngBuffer = await this.imageGenerator.convertAvatarToPng(file.buffer);
      const filePath = `avatars/${id}/avatar.png`;

      await this.storage.upload(filePath, pngBuffer, 'image/png');

      updateData.avatarUrl = this.storage.getPublicUrl(filePath, version);
    }

    if (files.banner && files.banner.length > 0) {
      const file = files.banner[0];
      // Converte para PNG e padroniza extensão
      const pngBuffer = await this.imageGenerator.convertBannerToPng(file.buffer);
      const filePath = `banners/${id}/banner.png`;

      await this.storage.upload(filePath, pngBuffer, 'image/png');

      updateData.bannerUrl = this.storage.getPublicUrl(filePath, version);
    }

    return this.prisma.page.update({
      where: { id },
      data: updateData,
    });
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
}
