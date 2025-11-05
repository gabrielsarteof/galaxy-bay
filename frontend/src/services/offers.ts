import api from './api';

export interface CreateOfferDto {
  nftId: string;
  amount: number;
  expiration: string;
}

export interface AcceptOfferDto {
  offerId: string;
  transactionHash?: string;
}

export async function createOffer(dto: CreateOfferDto) {
  const { data } = await api.post('/offers', dto);
  return data;
}

export async function getOffersByNft(nftId: string) {
  const { data } = await api.get(`/offers/nft/${nftId}`);
  return data;
}

export async function acceptOffer(dto: AcceptOfferDto) {
  const { data } = await api.post(`/offers/${dto.offerId}/accept`, {
    transactionHash: dto.transactionHash,
  });
  return data;
}

export async function cancelOffer(offerId: string) {
  const { data } = await api.delete(`/offers/${offerId}`);
  return data;
}
