import { Test, TestingModule } from '@nestjs/testing';
import { NftService } from './nft.service';
import { PrismaService } from '../../prisma/prisma.service';
import { IpfsService } from '../utils/ipfs.service';
import { PinataService } from '../utils/pinata.service';
import { BlockchainService } from '../utils/blockchain.service';

describe('NftService', () => {
  let service: NftService;

  const mockPrismaService = {
    user: { findUnique: jest.fn() },
    nft: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    blockchainData: { create: jest.fn() },
    activity: { create: jest.fn() },
  };

  const mockIpfsService = {
    uploadMetadata: jest.fn(),
  };

  const mockPinataService = {
    uploadCompleteNFT: jest.fn(),
  };

  const mockBlockchainService = {
    getTransactionReceipt: jest.fn(),
    verifyMintTransaction: jest.fn(),
    getNftOwner: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NftService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: IpfsService, useValue: mockIpfsService },
        { provide: PinataService, useValue: mockPinataService },
        { provide: BlockchainService, useValue: mockBlockchainService },
      ],
    }).compile();

    service = module.get<NftService>(NftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
