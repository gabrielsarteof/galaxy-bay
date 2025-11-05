import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../utils/blockchain.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger = new Logger(IndexerService.name);
  private isIndexing = false;

  constructor(
    private prisma: PrismaService,
    private blockchain: BlockchainService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing blockchain indexer...');
    await this.indexHistoricalEvents();
    this.startEventListeners();
  }

  private async indexHistoricalEvents() {
    if (this.isIndexing) {
      this.logger.warn('Indexing already in progress');
      return;
    }

    this.isIndexing = true;
    this.logger.log('Starting historical event indexing...');

    try {
      const lastEvent = await this.prisma.contractEvent.findFirst({
        orderBy: { blockNumber: 'desc' },
      });

      const fromBlock = lastEvent ? lastEvent.blockNumber + 1 : 0;
      const toBlock = 'latest';

      this.logger.log(`Indexing from block ${fromBlock} to ${toBlock}`);

      await Promise.all([
        this.indexTransferEvents(fromBlock, toBlock),
        this.indexItemListedEvents(fromBlock, toBlock),
        this.indexItemSoldEvents(fromBlock, toBlock),
      ]);

      this.logger.log('Historical indexing completed');
    } catch (error) {
      this.logger.error('Error during historical indexing', error);
    } finally {
      this.isIndexing = false;
    }
  }

  private async indexTransferEvents(fromBlock: number | string, toBlock: number | string) {
    const events = await this.blockchain.queryTransferEvents(
      typeof fromBlock === 'string' ? 0 : fromBlock,
      toBlock,
    );

    this.logger.log(`Found ${events.length} Transfer events`);

    for (const event of events) {
      await this.processTransferEvent(event);
    }
  }

  private async indexItemListedEvents(fromBlock: number | string, toBlock: number | string) {
    const events = await this.blockchain.queryItemListedEvents(
      typeof fromBlock === 'string' ? 0 : fromBlock,
      toBlock,
    );

    this.logger.log(`Found ${events.length} ItemListed events`);

    for (const event of events) {
      await this.processItemListedEvent(event);
    }
  }

  private async indexItemSoldEvents(fromBlock: number | string, toBlock: number | string) {
    const events = await this.blockchain.queryItemSoldEvents(
      typeof fromBlock === 'string' ? 0 : fromBlock,
      toBlock,
    );

    this.logger.log(`Found ${events.length} ItemSold events`);

    for (const event of events) {
      await this.processItemSoldEvent(event);
    }
  }

  private async processTransferEvent(event: any) {
    const existing = await this.prisma.contractEvent.findUnique({
      where: {
        transactionHash_logIndex: {
          transactionHash: event.transactionHash,
          logIndex: 0,
        },
      },
    });

    if (existing && existing.processed) {
      return;
    }

    if (!existing) {
      await this.prisma.contractEvent.create({
        data: {
          contractAddress: event.nftContract || '',
          eventName: 'Transfer',
          blockNumber: event.blockNumber,
          blockHash: event.blockHash,
          transactionHash: event.transactionHash,
          logIndex: 0,
          eventData: {
            from: event.from,
            to: event.to,
            tokenId: event.tokenId,
          },
          processed: false,
        },
      });
    }

    const nft = await this.prisma.nft.findFirst({
      where: { tokenId: String(event.tokenId) },
    });

    if (nft && event.to) {
      const newOwner = await this.prisma.user.findUnique({
        where: { address: event.to },
      });

      if (newOwner) {
        await this.prisma.nft.update({
          where: { id: nft.id },
          data: {
            ownerId: newOwner.id,
            lastTransferHash: event.transactionHash,
          },
        });

        await this.prisma.activity.create({
          data: {
            nftId: nft.id,
            pageId: nft.pageId,
            type: 'transfer',
            fromAddress: event.from,
            toAddress: event.to,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
          },
        });
      }
    }

    await this.prisma.contractEvent.updateMany({
      where: {
        transactionHash: event.transactionHash,
        logIndex: 0,
      },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });
  }

  private async processItemListedEvent(event: any) {
    const existing = await this.prisma.contractEvent.findUnique({
      where: {
        transactionHash_logIndex: {
          transactionHash: event.transactionHash,
          logIndex: 1,
        },
      },
    });

    if (existing && existing.processed) {
      return;
    }

    if (!existing) {
      await this.prisma.contractEvent.create({
        data: {
          contractAddress: event.nftContract,
          eventName: 'ItemListed',
          blockNumber: event.blockNumber,
          blockHash: event.blockHash,
          transactionHash: event.transactionHash,
          logIndex: 1,
          eventData: {
            nftContract: event.nftContract,
            tokenId: event.tokenId,
            seller: event.seller,
            price: event.price,
          },
          processed: false,
        },
      });
    }

    const nft = await this.prisma.nft.findFirst({
      where: { tokenId: String(event.tokenId) },
    });

    if (nft) {
      await this.prisma.nft.update({
        where: { id: nft.id },
        data: {
          status: 'listed',
          price: parseFloat(event.price),
          listedAt: new Date(),
        },
      });
    }

    await this.prisma.contractEvent.updateMany({
      where: {
        transactionHash: event.transactionHash,
        logIndex: 1,
      },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });
  }

  private async processItemSoldEvent(event: any) {
    const existing = await this.prisma.contractEvent.findUnique({
      where: {
        transactionHash_logIndex: {
          transactionHash: event.transactionHash,
          logIndex: 2,
        },
      },
    });

    if (existing && existing.processed) {
      return;
    }

    if (!existing) {
      await this.prisma.contractEvent.create({
        data: {
          contractAddress: event.nftContract,
          eventName: 'ItemSold',
          blockNumber: event.blockNumber,
          blockHash: event.blockHash,
          transactionHash: event.transactionHash,
          logIndex: 2,
          eventData: {
            nftContract: event.nftContract,
            tokenId: event.tokenId,
            buyer: event.buyer,
            price: event.price,
          },
          processed: false,
        },
      });
    }

    const nft = await this.prisma.nft.findFirst({
      where: { tokenId: String(event.tokenId) },
    });

    if (nft && event.buyer) {
      const buyer = await this.prisma.user.findUnique({
        where: { address: event.buyer },
      });

      if (buyer) {
        await this.prisma.nft.update({
          where: { id: nft.id },
          data: {
            status: 'sold',
            ownerId: buyer.id,
            lastSalePrice: parseFloat(event.price),
            lastSaleAt: new Date(),
            totalSales: { increment: 1 },
          },
        });

        await this.prisma.activity.create({
          data: {
            nftId: nft.id,
            pageId: nft.pageId,
            type: 'sale',
            fromAddress: event.seller,
            toAddress: event.buyer,
            price: parseFloat(event.price),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
          },
        });
      }
    }

    await this.prisma.contractEvent.updateMany({
      where: {
        transactionHash: event.transactionHash,
        logIndex: 2,
      },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });
  }

  private startEventListeners() {
    this.logger.log('Starting real-time event listeners...');

    this.blockchain.startEventListeners({
      onTransfer: async (from, to, tokenId, event) => {
        this.logger.log(`Real-time Transfer: tokenId=${tokenId} from ${from} to ${to}`);
        await this.processTransferEvent({
          from,
          to,
          tokenId,
          blockNumber: event.log.blockNumber,
          blockHash: event.log.blockHash,
          transactionHash: event.log.transactionHash,
        });
      },
      onItemListed: async (nftContract, tokenId, seller, price, event) => {
        this.logger.log(`Real-time ItemListed: tokenId=${tokenId}, price=${price}`);
        await this.processItemListedEvent({
          nftContract,
          tokenId,
          seller,
          price: price.toString(),
          blockNumber: event.log.blockNumber,
          blockHash: event.log.blockHash,
          transactionHash: event.log.transactionHash,
        });
      },
      onItemSold: async (nftContract, tokenId, buyer, price, event) => {
        this.logger.log(`Real-time ItemSold: tokenId=${tokenId} to ${buyer}`);
        await this.processItemSoldEvent({
          nftContract,
          tokenId,
          buyer,
          seller: '',
          price: price.toString(),
          blockNumber: event.log.blockNumber,
          blockHash: event.log.blockHash,
          transactionHash: event.log.transactionHash,
        });
      },
    });
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncEvents() {
    this.logger.log('Running periodic event sync...');
    await this.indexHistoricalEvents();
  }
}
