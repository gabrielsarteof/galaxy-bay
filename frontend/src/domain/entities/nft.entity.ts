/**
 * Domain entity representing an NFT
 * Follows clean architecture - domain layer entities
 */
export interface NftEntity {
  id: string;
  tokenId: string;
  name: string;
  description?: string;
  imageUrl: string;
  metadataUrl: string;
  price?: number;
  status: NftStatus;
  ownerId: string;
  pageId: string;
  collectionId: string;
  createdAt: string;
  updatedAt: string;
  collection?: {
    id: string;
    name: string;
    slug: string;
  };
  page?: {
    id: string;
    name: string;
    slug: string;
  };
}

export enum NftStatus {
  MINTED = 'minted',
  LISTED = 'listed',
  SOLD = 'sold',
  TRANSFERRED = 'transferred',
}
