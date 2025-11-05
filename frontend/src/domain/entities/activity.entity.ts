import { NftEntity } from './nft.entity';

/**
 * Domain entity representing an Activity/Transaction
 * Follows clean architecture - domain layer entities
 */
export interface ActivityEntity {
  id: string;
  nftId: string;
  pageId: string;
  type: ActivityType;
  fromAddress?: string;
  toAddress?: string;
  price?: number;
  transactionHash?: string;
  blockNumber?: number;
  timestamp: string;
  nft?: NftEntity;
}

export enum ActivityType {
  MINT = 'mint',
  LIST = 'list',
  SALE = 'sale',
  TRANSFER = 'transfer',
  OFFER = 'offer',
  CANCEL = 'cancel',
}

/**
 * Configuration for displaying activity types
 */
export interface ActivityConfig {
  icon: string;
  color: string;
  bgColor: string;
  label: string;
}
