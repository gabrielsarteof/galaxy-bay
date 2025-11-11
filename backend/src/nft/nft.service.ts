import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { IpfsService } from 'src/utils/ipfs.service';
import { PinataService } from 'src/utils/pinata.service';
import { BlockchainService } from 'src/utils/blockchain.service';
import { RegisterNftDto } from './dto/register-nft.dto';
import { NftStatus } from './types/nft-status.type';

@Injectable()
export class NftService {
  private readonly logger = new Logger(NftService.name);

  constructor(
    private prisma: PrismaService,
    private ipfs: IpfsService,
    private pinata: PinataService,
    private blockchain: BlockchainService,
  ) {}

  async generateMetadata(dto: CreateMetadataDto): Promise<string> {
    // Monta o objeto JSON de metadata
    const metadata = {
      name: dto.name,
      description: dto.description,
      image: dto.image,
      attributes: dto.attributes,
    };
    // Envia para IPFS e obtém a URL
    const metadataUrl = await this.ipfs.uploadMetadata(metadata);
    return metadataUrl;
  }

  /**
   * Workflow completo de upload de NFT para IPFS via Pinata
   *
   * Fluxo:
   * 1. Validar entrada (buffer, nome, descrição)
   * 2. Upload imagem otimizada → imageCID
   * 3. Upload metadata com imageCID → metadataCID
   * 4. Retornar tokenURI para uso no mint on-chain
   *
   * Rationale: Separar upload IPFS do mint on-chain permite melhor
   * controle de erros e retry de uploads sem gastar gas.
   */
  async prepareNFTForMinting(
    imageBuffer: Buffer,
    nftName: string,
    description: string,
    attributes: Array<{
      trait_type: string;
      value: string | number;
      display_type?: string;
      max_value?: number;
    }>,
  ) {
    this.logger.log(`Preparando NFT para mint: ${nftName}`);

    if (!imageBuffer || imageBuffer.length === 0) {
      throw new BadRequestException('Buffer de imagem vazio ou inválido');
    }

    if (!nftName || nftName.trim().length === 0) {
      throw new BadRequestException('Nome do NFT é obrigatório');
    }

    if (!description || description.trim().length === 0) {
      throw new BadRequestException('Descrição do NFT é obrigatória');
    }

    const result = await this.pinata.uploadCompleteNFT(
      imageBuffer,
      nftName,
      description,
      attributes,
    );

    this.logger.log(
      `NFT preparado com sucesso: ${nftName} → tokenURI=${result.tokenURI}`
    );

    return result;
  }

  async register(dto: RegisterNftDto, ownerId: string) {
    this.logger.log(`Registering NFT tokenId=${dto.tokenId} for user ${ownerId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, address: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.transactionHash) {
      const receipt = await this.blockchain.getTransactionReceipt(dto.transactionHash);

      if (!receipt || receipt.status !== 1) {
        throw new BadRequestException('Transaction not found or failed');
      }

      if (!dto.tokenId) {
        const extractedTokenId = await this.blockchain.verifyMintTransaction(dto.transactionHash);
        if (extractedTokenId === null) {
          throw new BadRequestException('Could not extract tokenId from transaction');
        }
        dto.tokenId = String(extractedTokenId);
      }

      const onChainOwner = await this.blockchain.getNftOwner(Number(dto.tokenId));

      if (onChainOwner && onChainOwner.toLowerCase() !== user.address.toLowerCase()) {
        throw new ForbiddenException('NFT owner on blockchain does not match requesting user');
      }
    }

    const existing = await this.prisma.nft.findUnique({
      where: {
        pageId_tokenId: {
          pageId: dto.pageId,
          tokenId: String(dto.tokenId),
        },
      },
    });

    if (existing) {
      throw new BadRequestException('NFT already registered');
    }

    const nft = await this.prisma.nft.create({
      data: {
        tokenId: String(dto.tokenId),
        name: dto.name ?? '',
        description: dto.description,
        imageUrl: dto.imageUrl || '',
        metadataUrl: dto.metadataUrl,
        price: dto.price,
        status: 'minted',
        ownerId,
        pageId: dto.pageId,
        collectionId: dto.collectionId,
      },
    });

    if (dto.transactionHash) {
      const receipt = await this.blockchain.getTransactionReceipt(dto.transactionHash);

      await this.prisma.blockchainData.create({
        data: {
          nftId: nft.id,
          transactionHash: dto.transactionHash,
          blockHash: receipt?.blockHash || dto.blockHash || '',
        },
      });

      await this.prisma.activity.create({
        data: {
          nftId: nft.id,
          pageId: dto.pageId,
          type: 'mint',
          toAddress: user.address,
          transactionHash: dto.transactionHash,
          blockNumber: receipt?.blockNumber,
        },
      });
    }

    return nft;
  }

  async findAllPublic() {
    return this.prisma.nft.findMany({
      where: { status: 'listed' },
      select: {
        id: true,
        tokenId: true,
        name: true,
        description: true,
        imageUrl: true,
        price: true,
        status: true,
        ownerId: true,
        pageId: true,
        createdAt: true,
        page: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            address: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { listedAt: 'desc' },
      take: 50,
    });
  }

  async findFeatured(limit: number = 8) {
    return this.prisma.nft.findMany({
      where: {
        status: 'listed',
        price: { gt: 0 },
      },
      select: {
        id: true,
        tokenId: true,
        name: true,
        description: true,
        imageUrl: true,
        price: true,
        status: true,
        listedAt: true,
        createdAt: true,
        page: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            address: true,
          },
        },
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { listedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });
  }

  /**
   * Busca NFTs de uma página com filtros opcionais
   */
  async findByPage(pageId: string, filters?: {
    status?: NftStatus;
    collectionId?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { pageId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.collectionId) {
      where.collectionId = filters.collectionId;
    }

    let orderBy: any = { createdAt: 'desc' };

    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'price_low':
          orderBy = { price: 'asc' };
          break;
        case 'price_high':
          orderBy = { price: 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
    }

    return this.prisma.nft.findMany({
      where,
      orderBy,
      take: filters?.limit || 20,
      skip: filters?.offset || 0,
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Busca uma NFT específica por ID
   */
  async findOne(id: string) {
    const nft = await this.prisma.nft.findUnique({
      where: { id },
      include: {
        collection: true,
        page: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        blockchainData: true,
      },
    });

    if (!nft) {
      throw new NotFoundException('NFT não encontrada');
    }

    return nft;
  }

  /**
   * Atualiza informações de uma NFT (preço, status)
   */
  async update(
    id: string,
    userId: string,
    updateDto: { price?: number; status?: NftStatus },
  ) {
    const nft = await this.prisma.nft.findUnique({
      where: { id },
      include: {
        page: true,
      },
    });

    if (!nft) {
      throw new NotFoundException('NFT não encontrada');
    }

    if (nft.page.ownerId !== userId) {
      throw new ForbiddenException('Você não tem permissão para atualizar esta NFT');
    }

    return this.prisma.nft.update({
      where: { id },
      data: updateDto,
    });
  }
}
