import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../utils/blockchain.service';
import { ListItemDto } from './dto/list-item.dto';
import { BuyItemDto } from './dto/buy-item.dto';
import { CancelListingDto } from './dto/cancel-listing.dto';

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(
    private prisma: PrismaService,
    private blockchain: BlockchainService,
  ) {}

  async listItem(userId: string, dto: ListItemDto) {
    const nft = await this.prisma.nft.findUnique({
      where: { id: dto.nftId },
      select: {
        id: true,
        tokenId: true,
        status: true,
        ownerId: true,
        pageId: true,
        owner: { select: { address: true } },
      },
    });

    if (!nft) {
      throw new NotFoundException('NFT not found');
    }

    if (nft.ownerId !== userId) {
      throw new ForbiddenException('You are not the owner of this NFT');
    }

    if (nft.status === 'listed') {
      throw new BadRequestException('NFT is already listed');
    }

    if (dto.transactionHash) {
      const listingData = await this.blockchain.verifyListingTransaction(dto.transactionHash);

      if (!listingData) {
        throw new BadRequestException('Invalid listing transaction');
      }

      if (listingData.tokenId !== parseInt(nft.tokenId)) {
        throw new BadRequestException('TokenId mismatch');
      }

      const onChainListing = await this.blockchain.getListing(parseInt(nft.tokenId));
      if (!onChainListing) {
        throw new BadRequestException('NFT not listed on blockchain');
      }
    }

    const updated = await this.prisma.nft.update({
      where: { id: dto.nftId },
      data: {
        status: 'listed',
        price: dto.price,
        listedAt: new Date(),
      },
    });

    await this.prisma.activity.create({
      data: {
        nftId: nft.id,
        pageId: nft.pageId,
        type: 'list',
        fromAddress: nft.owner.address,
        price: dto.price,
        transactionHash: dto.transactionHash,
      },
    });

    this.logger.log(`NFT ${nft.id} listed for ${dto.price} ETH`);

    return updated;
  }

  async buyItem(userId: string, dto: BuyItemDto) {
    const nft = await this.prisma.nft.findUnique({
      where: { id: dto.nftId },
      select: {
        id: true,
        tokenId: true,
        status: true,
        price: true,
        ownerId: true,
        pageId: true,
        owner: { select: { address: true } },
      },
    });

    if (!nft) {
      throw new NotFoundException('NFT not found');
    }

    if (nft.status !== 'listed') {
      throw new BadRequestException('NFT is not listed for sale');
    }

    if (nft.ownerId === userId) {
      throw new BadRequestException('You cannot buy your own NFT');
    }

    const buyer = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, address: true },
    });
    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    if (dto.transactionHash) {
      const receipt = await this.blockchain.getTransactionReceipt(dto.transactionHash);

      if (!receipt || receipt.status !== 1) {
        throw new BadRequestException('Invalid transaction');
      }

      const onChainOwner = await this.blockchain.getNftOwner(parseInt(nft.tokenId));
      if (onChainOwner?.toLowerCase() !== buyer.address.toLowerCase()) {
        throw new BadRequestException('Blockchain ownership does not match buyer');
      }
    }

    const updated = await this.prisma.nft.update({
      where: { id: dto.nftId },
      data: {
        status: 'sold',
        ownerId: userId,
        lastSalePrice: nft.price,
        lastSaleAt: new Date(),
        totalSales: { increment: 1 },
      },
    });

    await this.prisma.transaction.create({
      data: {
        nftId: nft.id,
        buyerId: userId,
        price: Number(nft.price),
        status: 'completed',
      },
    });

    await this.prisma.activity.create({
      data: {
        nftId: nft.id,
        pageId: nft.pageId,
        type: 'sale',
        fromAddress: nft.owner.address,
        toAddress: buyer.address,
        price: nft.price,
        transactionHash: dto.transactionHash,
      },
    });

    this.logger.log(`NFT ${nft.id} sold to user ${userId} for ${nft.price} ETH`);

    return updated;
  }

  async cancelListing(userId: string, dto: CancelListingDto) {
    const nft = await this.prisma.nft.findUnique({
      where: { id: dto.nftId },
      select: {
        id: true,
        tokenId: true,
        status: true,
        ownerId: true,
        pageId: true,
        owner: { select: { address: true } },
      },
    });

    if (!nft) {
      throw new NotFoundException('NFT not found');
    }

    if (nft.ownerId !== userId) {
      throw new ForbiddenException('You are not the owner of this NFT');
    }

    if (nft.status !== 'listed') {
      throw new BadRequestException('NFT is not listed');
    }

    if (dto.transactionHash) {
      const receipt = await this.blockchain.getTransactionReceipt(dto.transactionHash);

      if (!receipt || receipt.status !== 1) {
        throw new BadRequestException('Invalid transaction');
      }

      const onChainListing = await this.blockchain.getListing(parseInt(nft.tokenId));
      if (onChainListing) {
        throw new BadRequestException('NFT still listed on blockchain');
      }
    }

    const updated = await this.prisma.nft.update({
      where: { id: dto.nftId },
      data: {
        status: 'minted',
        price: null,
        listedAt: null,
      },
    });

    await this.prisma.activity.create({
      data: {
        nftId: nft.id,
        pageId: nft.pageId,
        type: 'cancel',
        fromAddress: nft.owner.address,
        transactionHash: dto.transactionHash,
      },
    });

    this.logger.log(`NFT ${nft.id} listing canceled`);

    return updated;
  }

  async getListings(filters?: {
    pageId?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { status: 'listed' };

    if (filters?.pageId) {
      where.pageId = filters.pageId;
    }

    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters.minPrice) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice) {
        where.price.lte = filters.maxPrice;
      }
    }

    const [nfts, total] = await Promise.all([
      this.prisma.nft.findMany({
        where,
        include: {
          collection: true,
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
        },
        orderBy: { listedAt: 'desc' },
        take: filters?.limit || 20,
        skip: filters?.offset || 0,
      }),
      this.prisma.nft.count({ where }),
    ]);

    return { nfts, total };
  }
}
