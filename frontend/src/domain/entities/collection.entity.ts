import { NftEntity } from './nft.entity';

/**
 * Domain entity representing a Collection
 * Follows clean architecture - domain layer entities
 */
export interface CollectionEntity {
  id: string;
  pageId: string;
  name: string;
  slug: string;
  description?: string;
  bannerUrl?: string;
  nfts?: NftEntity[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Collection statistics calculated from NFTs
 */
export interface CollectionStats {
  floorPrice: number | null;
  totalVolume: number;
  totalNfts: number;
}
