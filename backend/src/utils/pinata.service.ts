import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PinataSDK } from 'pinata';
import * as sharp from 'sharp';

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

interface NFTUploadResult {
  imageCID: string;
  metadataCID: string;
  tokenURI: string;
  imageUrl: string;
  metadataUrl: string;
}

@Injectable()
export class PinataService {
  private readonly logger = new Logger(PinataService.name);
  private readonly client: PinataSDK;

  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY_MS = 1000;
  private readonly DEFAULT_IMAGE_MAX_DIMENSION = 2000;
  private readonly DEFAULT_IMAGE_QUALITY = 85;

  constructor() {
    const jwt = process.env.PINATA_JWT;
    const gateway = process.env.PINATA_GATEWAY;

    if (!jwt) {
      throw new Error(
        'PINATA_JWT não encontrado em variáveis de ambiente. ' +
        'Configure em .env conforme .env.example'
      );
    }

    if (!gateway) {
      throw new Error(
        'PINATA_GATEWAY não encontrado em variáveis de ambiente. ' +
        'Configure em .env conforme .env.example'
      );
    }

    this.client = new PinataSDK({
      pinataJwt: jwt,
      pinataGateway: gateway,
    });

    this.logger.log('PinataService inicializado com gateway dedicado');
  }

  /**
   * Executa operação com retry automático e exponential backoff
   *
   * Estratégia de retry:
   * - Tentativa 1: imediata
   * - Tentativa 2: após 1s
   * - Tentativa 3: após 2s
   * - Tentativa 4: após 4s (se MAX_RETRIES = 3)
   *
   * Rationale: Falhas de rede IPFS são comuns mas transitórias.
   * Exponential backoff evita sobrecarregar serviço durante instabilidade.
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        this.logger.warn(
          `${operationName} falhou (tentativa ${attempt}/${this.MAX_RETRIES}): ${error.message}`
        );

        if (attempt < this.MAX_RETRIES) {
          const delayMs = this.INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          this.logger.log(`Aguardando ${delayMs}ms antes de retry...`);
          await this.sleep(delayMs);
        }
      }
    }

    this.logger.error(
      `${operationName} falhou após ${this.MAX_RETRIES} tentativas: ${lastError?.message}`
    );

    throw new InternalServerErrorException(
      `Falha ao comunicar com IPFS após ${this.MAX_RETRIES} tentativas. ` +
      `Tente novamente em alguns minutos.`
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Otimiza imagem para reduzir tamanho mantendo qualidade aceitável
   *
   * Processo:
   * 1. Resize proporcional (max 2000x2000 por padrão)
   * 2. Conversão para JPEG (melhor compressão que PNG)
   * 3. Compressão quality 85% (imperceptível ao olho humano)
   *
   * Economia típica: 60-80% do tamanho original
   *
   * @param buffer Buffer da imagem original
   * @param filename Nome do arquivo (usado para logging)
   * @param options Opções de otimização
   * @returns Buffer da imagem otimizada
   */
  private async optimizeImage(
    buffer: Buffer,
    filename: string,
    options: ImageOptimizationOptions = {},
  ): Promise<Buffer> {
    const maxWidth = options.maxWidth || this.DEFAULT_IMAGE_MAX_DIMENSION;
    const maxHeight = options.maxHeight || this.DEFAULT_IMAGE_MAX_DIMENSION;
    const quality = options.quality || this.DEFAULT_IMAGE_QUALITY;

    this.logger.debug(
      `Otimizando imagem ${filename}: max ${maxWidth}x${maxHeight}, quality ${quality}%`
    );

    try {
      const optimizedBuffer = await sharp(buffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .toBuffer();

      const originalSizeKB = Math.round(buffer.length / 1024);
      const optimizedSizeKB = Math.round(optimizedBuffer.length / 1024);
      const savingsPercent = Math.round(
        ((buffer.length - optimizedBuffer.length) / buffer.length) * 100
      );

      this.logger.log(
        `Imagem otimizada: ${originalSizeKB}KB → ${optimizedSizeKB}KB (${savingsPercent}% economia)`
      );

      return optimizedBuffer;
    } catch (error) {
      this.logger.error(`Erro ao otimizar imagem ${filename}:`, error);
      throw new InternalServerErrorException(
        `Falha ao processar imagem. Verifique se o arquivo é uma imagem válida.`
      );
    }
  }

  /**
   * Faz upload de imagem para IPFS via Pinata
   *
   * @param buffer Buffer da imagem
   * @param filename Nome do arquivo
   * @param options Opções de otimização
   * @returns CID (Content Identifier) da imagem no IPFS
   */
  async uploadImageToIPFS(
    buffer: Buffer,
    filename: string,
    options?: ImageOptimizationOptions,
  ): Promise<string> {
    return this.executeWithRetry(async () => {
      const optimizedBuffer = await this.optimizeImage(buffer, filename, options);

      const blob = new Blob([optimizedBuffer], { type: 'image/jpeg' });
      const file = new File([blob], filename);

      const upload = await this.client.upload.file(file);

      this.logger.log(
        `Imagem enviada para IPFS: ${filename} → CID=${upload.cid} (${upload.size} bytes)`
      );

      return upload.cid;
    }, `Upload de imagem ${filename}`);
  }

  /**
   * Faz upload de metadata JSON para IPFS via Pinata
   *
   * Metadata deve seguir padrão OpenSea:
   * - name (obrigatório)
   * - description (obrigatório)
   * - image (obrigatório, formato ipfs://CID)
   * - attributes (opcional, array de traits)
   * - external_url (opcional)
   *
   * @param metadata Objeto com metadata do NFT
   * @returns CID do metadata no IPFS
   */
  async uploadMetadataToIPFS(metadata: Record<string, any>): Promise<string> {
    this.validateMetadataStructure(metadata);

    return this.executeWithRetry(async () => {
      const upload = await this.client.upload.json(metadata);

      this.logger.log(
        `Metadata enviada para IPFS: ${metadata.name} → CID=${upload.cid}`
      );

      return upload.cid;
    }, `Upload de metadata "${metadata.name}"`);
  }

  /**
   * Valida estrutura de metadata antes do upload
   *
   * Evita uploads de metadata inválida que seria rejeitada por marketplaces
   */
  private validateMetadataStructure(metadata: Record<string, any>): void {
    if (!metadata.name || typeof metadata.name !== 'string') {
      throw new Error('Metadata inválida: campo "name" obrigatório e deve ser string');
    }

    if (!metadata.description || typeof metadata.description !== 'string') {
      throw new Error('Metadata inválida: campo "description" obrigatório e deve ser string');
    }

    if (!metadata.image || typeof metadata.image !== 'string') {
      throw new Error('Metadata inválida: campo "image" obrigatório e deve ser string');
    }

    if (!metadata.image.startsWith('ipfs://')) {
      throw new Error(
        'Metadata inválida: campo "image" deve usar protocolo ipfs:// (ex: ipfs://QmXXX...)'
      );
    }

    if (metadata.attributes && !Array.isArray(metadata.attributes)) {
      throw new Error('Metadata inválida: campo "attributes" deve ser array');
    }
  }

  /**
   * Workflow completo: upload de imagem + criação e upload de metadata
   *
   * Fluxo:
   * 1. Upload imagem otimizada → imageCID
   * 2. Construir metadata com ipfs://{imageCID}
   * 3. Upload metadata → metadataCID
   * 4. Retornar tokenURI = ipfs://{metadataCID}
   *
   * @returns Objeto com CIDs e URLs
   */
  async uploadCompleteNFT(
    imageBuffer: Buffer,
    nftName: string,
    description: string,
    attributes: Array<{
      trait_type: string;
      value: string | number;
      display_type?: string;
      max_value?: number;
    }>,
  ): Promise<NFTUploadResult> {
    this.logger.log(`Iniciando upload completo de NFT: ${nftName}`);

    const imageCID = await this.uploadImageToIPFS(imageBuffer, `${nftName}.jpg`);

    const metadata = {
      name: nftName,
      description,
      image: `ipfs://${imageCID}`,
      attributes,
    };

    const metadataCID = await this.uploadMetadataToIPFS(metadata);

    const result: NFTUploadResult = {
      imageCID,
      metadataCID,
      tokenURI: `ipfs://${metadataCID}`,
      imageUrl: this.buildGatewayURL(imageCID),
      metadataUrl: this.buildGatewayURL(metadataCID),
    };

    this.logger.log(
      `Upload completo de NFT finalizado: ${nftName} → tokenURI=${result.tokenURI}`
    );

    return result;
  }

  /**
   * Constrói URL de gateway dedicado Pinata
   *
   * Gateway dedicado oferece:
   * - Performance superior (CDN global)
   * - Confiabilidade (99.9% uptime SLA)
   * - Segurança (apenas CIDs que você pinnou)
   */
  buildGatewayURL(cid: string): string {
    return `https://${process.env.PINATA_GATEWAY}/ipfs/${cid}`;
  }

  /**
   * Constrói URL de imagem otimizada com parâmetros
   *
   * Pinata suporta otimização on-the-fly via query params:
   * - img-width: largura máxima
   * - img-height: altura máxima
   * - img-quality: qualidade JPEG (1-100)
   *
   * Economia de banda sem re-upload
   */
  buildOptimizedImageURL(
    cid: string,
    width?: number,
    height?: number,
    quality?: number,
  ): string {
    const baseUrl = this.buildGatewayURL(cid);
    const params = new URLSearchParams();

    if (width) params.append('img-width', width.toString());
    if (height) params.append('img-height', height.toString());
    if (quality) params.append('img-quality', quality.toString());

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  }

  /**
   * Recupera conteúdo do IPFS via gateway Pinata
   *
   * Útil para validar uploads ou reprocessar metadata
   */
  async fetchContentFromIPFS(cid: string): Promise<any> {
    try {
      return await this.client.gateways.get(cid);
    } catch (error) {
      this.logger.error(`Erro ao recuperar conteúdo do IPFS (CID=${cid}):`, error);
      throw new InternalServerErrorException(
        `Não foi possível recuperar conteúdo do IPFS. Verifique se o CID é válido.`
      );
    }
  }
}
