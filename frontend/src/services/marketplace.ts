import api from './api';

export interface ListItemDto {
  nftId: string;
  price: number;
  transactionHash?: string;
}

export interface BuyItemDto {
  nftId: string;
  transactionHash?: string;
}

export interface CancelListingDto {
  nftId: string;
  transactionHash?: string;
}

export async function listItem(dto: ListItemDto) {
  const { data } = await api.post('/marketplace/list', dto);
  return data;
}

export async function buyItem(dto: BuyItemDto) {
  const { data } = await api.post('/marketplace/buy', dto);
  return data;
}

export async function cancelListing(dto: CancelListingDto) {
  const { data } = await api.post('/marketplace/cancel', dto);
  return data;
}

export async function getListings(filters?: {
  pageId?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.pageId) params.append('pageId', filters.pageId);
  if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());

  const { data } = await api.get(`/marketplace/listings?${params.toString()}`);
  return data;
}
