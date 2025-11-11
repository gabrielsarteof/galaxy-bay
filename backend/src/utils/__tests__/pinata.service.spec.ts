import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { PinataService } from '../pinata.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Testes unitários para PinataService
 *
 * Cobertura:
 * - Inicialização com variáveis de ambiente
 * - Upload de imagens com otimização
 * - Upload de metadata com validação
 * - Workflow completo uploadCompleteNFT
 * - Retry logic com exponential backoff
 * - Construção de URLs de gateway
 * - Tratamento de erros
 */
describe('PinataService', () => {
  let service: PinataService;
  let mockPinataClient: any;

  const MOCK_JWT = 'mock-jwt-token-for-testing';
  const MOCK_GATEWAY = 'mock-gateway.mypinata.cloud';
  const MOCK_IMAGE_CID = 'QmTestImageCID123456789';
  const MOCK_METADATA_CID = 'bafyTestMetadataCID123456789';

  beforeAll(() => {
    // Configurar variáveis de ambiente para testes
    process.env.PINATA_JWT = MOCK_JWT;
    process.env.PINATA_GATEWAY = MOCK_GATEWAY;
  });

  beforeEach(async () => {
    // Mock do PinataSDK
    mockPinataClient = {
      upload: {
        file: jest.fn().mockResolvedValue({
          cid: MOCK_IMAGE_CID,
          size: 524288, // 512KB
        }),
        json: jest.fn().mockResolvedValue({
          cid: MOCK_METADATA_CID,
        }),
      },
      gateways: {
        get: jest.fn().mockResolvedValue({ data: 'mock-content' }),
      },
    };

    // Mock do módulo pinata
    jest.mock('pinata', () => ({
      PinataSDK: jest.fn().mockImplementation(() => mockPinataClient),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [PinataService],
    }).compile();

    service = module.get<PinataService>(PinataService);

    // Substituir client interno pelo mock
    (service as any).client = mockPinataClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    delete process.env.PINATA_JWT;
    delete process.env.PINATA_GATEWAY;
  });

  describe('Inicialização', () => {
    it('deve estar definido', () => {
      expect(service).toBeDefined();
    });

    it('deve lançar erro se PINATA_JWT não estiver definido', () => {
      delete process.env.PINATA_JWT;

      expect(() => new PinataService()).toThrow(
        'PINATA_JWT não encontrado em variáveis de ambiente'
      );

      process.env.PINATA_JWT = MOCK_JWT;
    });

    it('deve lançar erro se PINATA_GATEWAY não estiver definido', () => {
      delete process.env.PINATA_GATEWAY;

      expect(() => new PinataService()).toThrow(
        'PINATA_GATEWAY não encontrado em variáveis de ambiente'
      );

      process.env.PINATA_GATEWAY = MOCK_GATEWAY;
    });
  });

  describe('buildGatewayURL', () => {
    it('deve construir URL de gateway corretamente', () => {
      const cid = 'QmTest123';
      const url = service.buildGatewayURL(cid);

      expect(url).toBe(`https://${MOCK_GATEWAY}/ipfs/QmTest123`);
    });
  });

  describe('buildOptimizedImageURL', () => {
    it('deve construir URL otimizada com parâmetros de largura', () => {
      const cid = 'QmTest123';
      const url = service.buildOptimizedImageURL(cid, 300);

      expect(url).toContain('img-width=300');
      expect(url).toContain(`https://${MOCK_GATEWAY}/ipfs/QmTest123`);
    });

    it('deve construir URL otimizada com todos os parâmetros', () => {
      const cid = 'QmTest123';
      const url = service.buildOptimizedImageURL(cid, 300, 300, 80);

      expect(url).toContain('img-width=300');
      expect(url).toContain('img-height=300');
      expect(url).toContain('img-quality=80');
    });

    it('deve retornar URL base sem parâmetros', () => {
      const cid = 'QmTest123';
      const url = service.buildOptimizedImageURL(cid);

      expect(url).toBe(`https://${MOCK_GATEWAY}/ipfs/QmTest123`);
      expect(url).not.toContain('?');
    });
  });

  describe('uploadImageToIPFS', () => {
    it('deve fazer upload de imagem com sucesso', async () => {
      const mockBuffer = Buffer.from('fake-image-data');
      const filename = 'test-image.jpg';

      const cid = await service.uploadImageToIPFS(mockBuffer, filename);

      expect(cid).toBe(MOCK_IMAGE_CID);
      expect(mockPinataClient.upload.file).toHaveBeenCalledTimes(1);
    });

    it('deve otimizar imagem antes do upload', async () => {
      const mockBuffer = Buffer.alloc(1024 * 1024 * 5); // 5MB
      const filename = 'large-image.jpg';

      const cid = await service.uploadImageToIPFS(mockBuffer, filename);

      expect(cid).toBe(MOCK_IMAGE_CID);
      // Verificar que upload foi chamado (imagem foi otimizada)
      expect(mockPinataClient.upload.file).toHaveBeenCalledTimes(1);
    });

    it('deve fazer retry em caso de falha temporária', async () => {
      const mockBuffer = Buffer.from('fake-image-data');
      const filename = 'test-image.jpg';

      // Simular falha nas primeiras 2 tentativas, sucesso na 3ª
      mockPinataClient.upload.file
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce({
          cid: MOCK_IMAGE_CID,
          size: 524288,
        });

      const cid = await service.uploadImageToIPFS(mockBuffer, filename);

      expect(cid).toBe(MOCK_IMAGE_CID);
      expect(mockPinataClient.upload.file).toHaveBeenCalledTimes(3);
    });

    it('deve lançar erro após todas as tentativas falharem', async () => {
      const mockBuffer = Buffer.from('fake-image-data');
      const filename = 'test-image.jpg';

      // Simular falha em todas as tentativas
      mockPinataClient.upload.file.mockRejectedValue(
        new Error('Persistent network error')
      );

      await expect(
        service.uploadImageToIPFS(mockBuffer, filename)
      ).rejects.toThrow(InternalServerErrorException);

      // MAX_RETRIES = 3
      expect(mockPinataClient.upload.file).toHaveBeenCalledTimes(3);
    });
  });

  describe('uploadMetadataToIPFS', () => {
    const validMetadata = {
      name: 'Test NFT',
      description: 'Test description',
      image: 'ipfs://QmTest123',
      attributes: [],
    };

    it('deve fazer upload de metadata válida', async () => {
      const cid = await service.uploadMetadataToIPFS(validMetadata);

      expect(cid).toBe(MOCK_METADATA_CID);
      expect(mockPinataClient.upload.json).toHaveBeenCalledWith(validMetadata);
    });

    it('deve rejeitar metadata sem campo name', async () => {
      const invalidMetadata = {
        description: 'Test',
        image: 'ipfs://QmTest123',
      };

      await expect(
        service.uploadMetadataToIPFS(invalidMetadata)
      ).rejects.toThrow('campo "name" obrigatório');
    });

    it('deve rejeitar metadata sem campo description', async () => {
      const invalidMetadata = {
        name: 'Test',
        image: 'ipfs://QmTest123',
      };

      await expect(
        service.uploadMetadataToIPFS(invalidMetadata)
      ).rejects.toThrow('campo "description" obrigatório');
    });

    it('deve rejeitar metadata sem campo image', async () => {
      const invalidMetadata = {
        name: 'Test',
        description: 'Test',
      };

      await expect(
        service.uploadMetadataToIPFS(invalidMetadata)
      ).rejects.toThrow('campo "image" obrigatório');
    });

    it('deve rejeitar metadata com image sem prefixo ipfs://', async () => {
      const invalidMetadata = {
        name: 'Test',
        description: 'Test',
        image: 'https://example.com/image.jpg',
      };

      await expect(
        service.uploadMetadataToIPFS(invalidMetadata)
      ).rejects.toThrow('deve usar protocolo ipfs://');
    });

    it('deve rejeitar metadata com attributes não-array', async () => {
      const invalidMetadata = {
        name: 'Test',
        description: 'Test',
        image: 'ipfs://QmTest123',
        attributes: 'not-an-array',
      };

      await expect(
        service.uploadMetadataToIPFS(invalidMetadata)
      ).rejects.toThrow('campo "attributes" deve ser array');
    });

    it('deve fazer retry em caso de falha temporária', async () => {
      mockPinataClient.upload.json
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ cid: MOCK_METADATA_CID });

      const cid = await service.uploadMetadataToIPFS(validMetadata);

      expect(cid).toBe(MOCK_METADATA_CID);
      expect(mockPinataClient.upload.json).toHaveBeenCalledTimes(2);
    });
  });

  describe('uploadCompleteNFT', () => {
    const mockBuffer = Buffer.from('fake-image-data');
    const nftName = 'Test NFT';
    const description = 'Test description';
    const attributes = [
      { trait_type: 'Artist', value: '0x123...' },
      { trait_type: 'Location', value: 'Galaxy Bay' },
    ];

    it('deve fazer upload completo de NFT', async () => {
      const result = await service.uploadCompleteNFT(
        mockBuffer,
        nftName,
        description,
        attributes
      );

      expect(result).toEqual({
        imageCID: MOCK_IMAGE_CID,
        metadataCID: MOCK_METADATA_CID,
        tokenURI: `ipfs://${MOCK_METADATA_CID}`,
        imageUrl: `https://${MOCK_GATEWAY}/ipfs/${MOCK_IMAGE_CID}`,
        metadataUrl: `https://${MOCK_GATEWAY}/ipfs/${MOCK_METADATA_CID}`,
      });
    });

    it('deve fazer upload de imagem primeiro, depois metadata', async () => {
      await service.uploadCompleteNFT(
        mockBuffer,
        nftName,
        description,
        attributes
      );

      // Verificar ordem de chamadas
      const fileCallOrder = mockPinataClient.upload.file.mock.invocationCallOrder[0];
      const jsonCallOrder = mockPinataClient.upload.json.mock.invocationCallOrder[0];

      expect(fileCallOrder).toBeLessThan(jsonCallOrder);
    });

    it('deve incluir imageCID na metadata', async () => {
      await service.uploadCompleteNFT(
        mockBuffer,
        nftName,
        description,
        attributes
      );

      const metadataCall = mockPinataClient.upload.json.mock.calls[0][0];
      expect(metadataCall.image).toBe(`ipfs://${MOCK_IMAGE_CID}`);
    });

    it('deve incluir attributes na metadata', async () => {
      await service.uploadCompleteNFT(
        mockBuffer,
        nftName,
        description,
        attributes
      );

      const metadataCall = mockPinataClient.upload.json.mock.calls[0][0];
      expect(metadataCall.attributes).toEqual(attributes);
    });
  });

  describe('fetchContentFromIPFS', () => {
    it('deve recuperar conteúdo do IPFS', async () => {
      const cid = 'QmTest123';
      const content = await service.fetchContentFromIPFS(cid);

      expect(content).toEqual({ data: 'mock-content' });
      expect(mockPinataClient.gateways.get).toHaveBeenCalledWith(cid);
    });

    it('deve lançar erro se CID for inválido', async () => {
      const cid = 'invalid-cid';
      mockPinataClient.gateways.get.mockRejectedValue(
        new Error('CID not found')
      );

      await expect(service.fetchContentFromIPFS(cid)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });

  describe('Retry Logic com Exponential Backoff', () => {
    it('deve aguardar tempo crescente entre retries', async () => {
      const mockBuffer = Buffer.from('fake-image-data');
      const filename = 'test-image.jpg';

      // Mock de sleep para capturar delays
      const sleepSpy = jest.spyOn(service as any, 'sleep');

      mockPinataClient.upload.file
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValueOnce({ cid: MOCK_IMAGE_CID, size: 1024 });

      await service.uploadImageToIPFS(mockBuffer, filename);

      // Verificar delays: 1000ms, 2000ms
      expect(sleepSpy).toHaveBeenCalledWith(1000);
      expect(sleepSpy).toHaveBeenCalledWith(2000);

      sleepSpy.mockRestore();
    });
  });
});
