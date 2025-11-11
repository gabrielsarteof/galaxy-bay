import { Test, TestingModule } from '@nestjs/testing';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';

describe('NftController', () => {
  let controller: NftController;

  const mockNftService = {
    generateMetadata: jest.fn(),
    prepareNFTForMinting: jest.fn(),
    register: jest.fn(),
    findAllPublic: jest.fn(),
    findFeatured: jest.fn(),
    findByPage: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftController],
      providers: [
        { provide: NftService, useValue: mockNftService },
      ],
    }).compile();

    controller = module.get<NftController>(NftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
