import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from './utils/blockchain.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private blockchain: BlockchainService,
  ) {}

  getHello(): string {
    return 'Galaxy Bay NFT API';
  }

  async healthCheck() {
    const checks: Record<string, any> = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: { status: 'unknown' },
      blockchain: { status: 'unknown' },
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = {
        status: 'healthy',
        connected: true,
      };
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      checks.status = 'degraded';
    }

    try {
      const blockchainHealth = await this.blockchain.healthCheck();
      checks.blockchain = blockchainHealth;

      if (!blockchainHealth.healthy) {
        checks.status = 'degraded';
      }
    } catch (error) {
      checks.blockchain = {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      checks.status = 'degraded';
    }

    return checks;
  }
}
