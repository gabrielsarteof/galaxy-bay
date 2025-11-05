import { Injectable, Logger } from '@nestjs/common';
import { NFTStorage, File } from 'nft.storage';

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  private readonly client: NFTStorage;

  constructor() {
    const token = process.env.NFT_STORAGE_KEY;
    if (!token) {
      throw new Error('Missing NFT_STORAGE_KEY in .env');
    }
    this.client = new NFTStorage({ token });
  }

  /**
   * Recebe um objeto JS e envia como metadata.json para o IPFS.
   * Retorna a URL pública do IPFS.
   */
  async uploadMetadata(metadata: Record<string, any>): Promise<string> {
    // Converte o objeto em Blob e em File (browser API)
    const blob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json',
    });
    const file = new File([blob], 'metadata.json');
    // Armazena e obtém o CID
    const cid = await this.client.storeBlob(file);
    const url = `https://ipfs.io/ipfs/${cid}`;
    this.logger.log(`Metadata uploaded: ${url}`);
    return url;
  }
}
