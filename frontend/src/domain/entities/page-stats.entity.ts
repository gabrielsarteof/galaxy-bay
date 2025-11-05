import { NftEntity } from './nft.entity';
import { ActivityEntity } from './activity.entity';

/**
 * Page statistics aggregated data
 * Follows clean architecture - domain layer entities
 */
export interface PageStatsEntity {
  totalNfts: number;
  totalSold: number;
  totalHolders: number;
  totalVolume: string;
  floorPrice?: string;
  featuredNfts: NftEntity[];
  recentActivities: ActivityEntity[];
}

/**
 * Community statistics for a creator page
 */
export interface CommunityStatsEntity {
  totalHolders: number;
  totalNftsOwned: number;
  topHolders: TopHolderEntity[];
}

/**
 * Top holder information
 */
export interface TopHolderEntity {
  address: string;
  nftsOwned: number;
  totalSpent?: string;
}
