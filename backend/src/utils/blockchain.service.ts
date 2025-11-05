import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

// Importar ABIs (assumindo que estão copiados para src/contracts)
import GalaxyBayNFTABI from '../contracts/GalaxyBayNFT.json';
import MarketplaceABI from '../contracts/Marketplace.json';

export interface TransactionReceipt {
  hash: string;
  blockNumber: number;
  blockHash: string;
  status: number;
  from: string;
  to: string;
  gasUsed: bigint;
}

export interface NFTListing {
  seller: string;
  price: string; // Em ETH
  priceWei: bigint;
}

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private nftContract: ethers.Contract;
  private marketplaceContract: ethers.Contract;
  private nftContractAddress: string;
  private marketplaceContractAddress: string;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    try {
      this.logger.log('Initializing Blockchain Service...');

      // Setup provider
      const rpcUrl = this.config.get<string>('RPC_URL');
      if (!rpcUrl) {
        throw new Error('RPC_URL not configured in environment');
      }

      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Setup contract addresses
      this.nftContractAddress = this.config.get<string>(
        'NFT_CONTRACT_ADDRESS',
      )!;
      this.marketplaceContractAddress = this.config.get<string>(
        'MARKETPLACE_CONTRACT_ADDRESS',
      )!;

      if (!this.nftContractAddress || !this.marketplaceContractAddress) {
        throw new Error('Contract addresses not configured');
      }

      // Initialize contracts (read-only)
      this.nftContract = new ethers.Contract(
        this.nftContractAddress,
        GalaxyBayNFTABI.abi,
        this.provider,
      );

      this.marketplaceContract = new ethers.Contract(
        this.marketplaceContractAddress,
        MarketplaceABI.abi,
        this.provider,
      );

      // Test connection
      const blockNumber = await this.provider.getBlockNumber();
      this.logger.log(`Connected to blockchain at block ${blockNumber}`);
      this.logger.log(`NFT Contract: ${this.nftContractAddress}`);
      this.logger.log(`Marketplace Contract: ${this.marketplaceContractAddress}`);
    } catch (error) {
      this.logger.error('Failed to initialize Blockchain Service', error);
      throw error;
    }
  }

  /**
   * Get current block number
   */
  async getCurrentBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(
    hash: string,
  ): Promise<TransactionReceipt | null> {
    try {
      const receipt = await this.provider.getTransactionReceipt(hash);
      if (!receipt) return null;

      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        status: receipt.status || 0,
        from: receipt.from,
        to: receipt.to || '',
        gasUsed: receipt.gasUsed,
      };
    } catch (error) {
      this.logger.error(`Error getting transaction receipt: ${hash}`, error);
      return null;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    hash: string,
    confirmations: number = 1,
  ): Promise<TransactionReceipt | null> {
    try {
      const receipt = await this.provider.waitForTransaction(
        hash,
        confirmations,
      );
      if (!receipt) return null;

      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        status: receipt.status || 0,
        from: receipt.from,
        to: receipt.to || '',
        gasUsed: receipt.gasUsed,
      };
    } catch (error) {
      this.logger.error(`Error waiting for transaction: ${hash}`, error);
      return null;
    }
  }

  /**
   * Get NFT owner
   */
  async getNftOwner(tokenId: number): Promise<string | null> {
    try {
      const owner = await this.nftContract.ownerOf(tokenId);
      return owner.toLowerCase();
    } catch (error) {
      this.logger.error(`Error getting NFT owner for tokenId ${tokenId}`, error);
      return null;
    }
  }

  /**
   * Get token URI
   */
  async getTokenURI(tokenId: number): Promise<string | null> {
    try {
      const uri = await this.nftContract.tokenURI(tokenId);
      return uri;
    } catch (error) {
      this.logger.error(`Error getting token URI for tokenId ${tokenId}`, error);
      return null;
    }
  }

  /**
   * Get NFT balance of address
   */
  async getNftBalance(address: string): Promise<number> {
    try {
      const balance = await this.nftContract.balanceOf(address);
      return Number(balance);
    } catch (error) {
      this.logger.error(`Error getting NFT balance for ${address}`, error);
      return 0;
    }
  }

  /**
   * Get next token ID (what will be minted next)
   */
  async getNextTokenId(): Promise<number> {
    try {
      const nextTokenId = await this.nftContract.nextTokenId();
      return Number(nextTokenId);
    } catch (error) {
      this.logger.error('Error getting next token ID', error);
      return 0;
    }
  }

  /**
   * Get marketplace listing
   */
  async getListing(tokenId: number): Promise<NFTListing | null> {
    try {
      const listing = await this.marketplaceContract.listings(
        this.nftContractAddress,
        tokenId,
      );

      // Se price = 0, não está listado
      if (listing.price === 0n) {
        return null;
      }

      return {
        seller: listing.seller.toLowerCase(),
        price: ethers.formatEther(listing.price),
        priceWei: listing.price,
      };
    } catch (error) {
      this.logger.error(
        `Error getting listing for tokenId ${tokenId}`,
        error,
      );
      return null;
    }
  }

  /**
   * Verify if NFT is approved for marketplace
   */
  async isApprovedForMarketplace(tokenId: number): Promise<boolean> {
    try {
      const approved = await this.nftContract.getApproved(tokenId);
      return approved.toLowerCase() === this.marketplaceContractAddress.toLowerCase();
    } catch (error) {
      this.logger.error(
        `Error checking approval for tokenId ${tokenId}`,
        error,
      );
      return false;
    }
  }

  /**
   * Get contract read-only instances
   */
  getNftContractReadOnly(): ethers.Contract {
    return this.nftContract;
  }

  getMarketplaceContractReadOnly(): ethers.Contract {
    return this.marketplaceContract;
  }

  /**
   * Verify NFT mint transaction
   * Retorna o tokenId se válido, null caso contrário
   */
  async verifyMintTransaction(txHash: string): Promise<number | null> {
    try {
      const receipt = await this.getTransactionReceipt(txHash);

      if (!receipt || receipt.status !== 1) {
        this.logger.warn(`Transaction ${txHash} failed or not found`);
        return null;
      }

      // Buscar evento Transfer do NFT contract
      const fullReceipt = await this.provider.getTransactionReceipt(txHash);
      if (!fullReceipt) return null;

      // Procurar pelo evento Transfer
      for (const log of fullReceipt.logs) {
        if (log.address.toLowerCase() !== this.nftContractAddress.toLowerCase()) {
          continue;
        }

        try {
          const parsedLog = this.nftContract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });

          if (parsedLog && parsedLog.name === 'Transfer') {
            const tokenId = Number(parsedLog.args.tokenId);
            this.logger.log(`Found Transfer event with tokenId ${tokenId}`);
            return tokenId;
          }
        } catch (err) {
          // Log pode não ser do nosso contrato
          continue;
        }
      }

      this.logger.warn(`No Transfer event found in transaction ${txHash}`);
      return null;
    } catch (error) {
      this.logger.error(`Error verifying mint transaction ${txHash}`, error);
      return null;
    }
  }

  /**
   * Verify listing transaction
   */
  async verifyListingTransaction(txHash: string): Promise<{
    tokenId: number;
    price: string;
  } | null> {
    try {
      const receipt = await this.getTransactionReceipt(txHash);

      if (!receipt || receipt.status !== 1) {
        return null;
      }

      const fullReceipt = await this.provider.getTransactionReceipt(txHash);
      if (!fullReceipt) return null;

      for (const log of fullReceipt.logs) {
        if (log.address.toLowerCase() !== this.marketplaceContractAddress.toLowerCase()) {
          continue;
        }

        try {
          const parsedLog = this.marketplaceContract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });

          if (parsedLog && parsedLog.name === 'ItemListed') {
            const tokenId = Number(parsedLog.args.tokenId);
            const price = ethers.formatEther(parsedLog.args.price);
            return { tokenId, price };
          }
        } catch (err) {
          continue;
        }
      }

      return null;
    } catch (error) {
      this.logger.error(`Error verifying listing transaction ${txHash}`, error);
      return null;
    }
  }

  /**
   * Start listening to blockchain events
   * Deve ser chamado após a aplicação iniciar
   */
  startEventListeners(callbacks?: {
    onTransfer?: (from: string, to: string, tokenId: number, event: any) => void;
    onItemListed?: (nftContract: string, tokenId: number, seller: string, price: bigint, event: any) => void;
    onItemSold?: (nftContract: string, tokenId: number, buyer: string, price: bigint, event: any) => void;
    onItemCanceled?: (nftContract: string, tokenId: number, event: any) => void;
  }) {
    this.logger.log('Starting blockchain event listeners...');

    // Transfer events
    this.nftContract.on(
      'Transfer',
      async (from: string, to: string, tokenId: bigint, event: any) => {
        this.logger.log(
          `Transfer event: tokenId ${tokenId} from ${from} to ${to}`,
        );

        if (callbacks?.onTransfer) {
          callbacks.onTransfer(
            from.toLowerCase(),
            to.toLowerCase(),
            Number(tokenId),
            event,
          );
        }
      },
    );

    // ItemListed events
    this.marketplaceContract.on(
      'ItemListed',
      async (
        nftContract: string,
        tokenId: bigint,
        seller: string,
        price: bigint,
        event: any,
      ) => {
        this.logger.log(
          `ItemListed event: tokenId ${tokenId}, price ${ethers.formatEther(price)} ETH`,
        );

        if (callbacks?.onItemListed) {
          callbacks.onItemListed(
            nftContract.toLowerCase(),
            Number(tokenId),
            seller.toLowerCase(),
            price,
            event,
          );
        }
      },
    );

    // ItemSold events
    this.marketplaceContract.on(
      'ItemSold',
      async (
        nftContract: string,
        tokenId: bigint,
        buyer: string,
        price: bigint,
        event: any,
      ) => {
        this.logger.log(
          `ItemSold event: tokenId ${tokenId} to ${buyer} for ${ethers.formatEther(price)} ETH`,
        );

        if (callbacks?.onItemSold) {
          callbacks.onItemSold(
            nftContract.toLowerCase(),
            Number(tokenId),
            buyer.toLowerCase(),
            price,
            event,
          );
        }
      },
    );

    // ItemCanceled events
    this.marketplaceContract.on(
      'ItemCanceled',
      async (nftContract: string, tokenId: bigint, event: any) => {
        this.logger.log(`ItemCanceled event: tokenId ${tokenId}`);

        if (callbacks?.onItemCanceled) {
          callbacks.onItemCanceled(
            nftContract.toLowerCase(),
            Number(tokenId),
            event,
          );
        }
      },
    );

    this.logger.log('Event listeners started successfully');
  }

  /**
   * Stop all event listeners
   */
  stopEventListeners() {
    this.logger.log('Stopping blockchain event listeners...');
    this.nftContract.removeAllListeners();
    this.marketplaceContract.removeAllListeners();
    this.logger.log('Event listeners stopped');
  }

  /**
   * Query historical events
   */
  async queryTransferEvents(
    fromBlock: number,
    toBlock: number | 'latest' = 'latest',
  ): Promise<any[]> {
    try {
      const filter = this.nftContract.filters.Transfer();
      const events = await this.nftContract.queryFilter(
        filter,
        fromBlock,
        toBlock,
      );

      return events.map((event: any) => ({
        from: event.args?.from.toLowerCase(),
        to: event.args?.to.toLowerCase(),
        tokenId: Number(event.args?.tokenId),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        blockHash: event.blockHash,
      }));
    } catch (error) {
      this.logger.error('Error querying Transfer events', error);
      return [];
    }
  }

  async queryItemListedEvents(
    fromBlock: number,
    toBlock: number | 'latest' = 'latest',
  ): Promise<any[]> {
    try {
      const filter = this.marketplaceContract.filters.ItemListed();
      const events = await this.marketplaceContract.queryFilter(
        filter,
        fromBlock,
        toBlock,
      );

      return events.map((event: any) => ({
        nftContract: event.args?.nftContract.toLowerCase(),
        tokenId: Number(event.args?.tokenId),
        seller: event.args?.seller.toLowerCase(),
        price: ethers.formatEther(event.args?.price),
        priceWei: event.args?.price,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        blockHash: event.blockHash,
      }));
    } catch (error) {
      this.logger.error('Error querying ItemListed events', error);
      return [];
    }
  }

  async queryItemSoldEvents(
    fromBlock: number,
    toBlock: number | 'latest' = 'latest',
  ): Promise<any[]> {
    try {
      const filter = this.marketplaceContract.filters.ItemSold();
      const events = await this.marketplaceContract.queryFilter(
        filter,
        fromBlock,
        toBlock,
      );

      return events.map((event: any) => ({
        nftContract: event.args?.nftContract.toLowerCase(),
        tokenId: Number(event.args?.tokenId),
        buyer: event.args?.buyer.toLowerCase(),
        price: ethers.formatEther(event.args?.price),
        priceWei: event.args?.price,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        blockHash: event.blockHash,
      }));
    } catch (error) {
      this.logger.error('Error querying ItemSold events', error);
      return [];
    }
  }

  /**
   * Get provider for direct access if needed
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    blockNumber?: number;
    error?: string;
  }> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      return { healthy: true, blockNumber };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
