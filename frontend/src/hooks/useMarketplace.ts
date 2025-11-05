import { useMutation, useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { getNftContract, getMarketContract, ensureCorrectNetwork } from '@/services/contract';
import { listItem, buyItem, cancelListing, getListings } from '@/services/marketplace';
import { updateNFT } from '@/services/nfts';

export function useMarketplace() {
  const listItemMutation = useMutation({
    mutationFn: async ({
      nftId,
      tokenId,
      price,
    }: {
      nftId: string;
      tokenId: number;
      price: string;
    }) => {
      await ensureCorrectNetwork();

      const nftContract = await getNftContract();
      const marketContract = await getMarketContract();
      const marketAddress = await marketContract.getAddress();

      const approveTx = await nftContract.approve(marketAddress, tokenId);
      await approveTx.wait();

      const priceWei = ethers.parseEther(price);
      const nftAddress = await nftContract.getAddress();
      const listTx = await marketContract.listItem(nftAddress, tokenId, priceWei);
      const receipt = await listTx.wait();

      await listItem({
        nftId,
        price: parseFloat(price),
        transactionHash: receipt.hash,
      });

      return { transactionHash: receipt.hash };
    },
  });

  const buyItemMutation = useMutation({
    mutationFn: async ({
      nftId,
      tokenId,
      price,
    }: {
      nftId: string;
      tokenId: number;
      price: string;
    }) => {
      await ensureCorrectNetwork();

      const nftContract = await getNftContract();
      const marketContract = await getMarketContract();
      const nftAddress = await nftContract.getAddress();

      const priceWei = ethers.parseEther(price);
      const buyTx = await marketContract.buyItem(nftAddress, tokenId, {
        value: priceWei,
      });
      const receipt = await buyTx.wait();

      await buyItem({
        nftId,
        transactionHash: receipt.hash,
      });

      return { transactionHash: receipt.hash };
    },
  });

  const cancelListingMutation = useMutation({
    mutationFn: async ({
      nftId,
      tokenId,
    }: {
      nftId: string;
      tokenId: number;
    }) => {
      await ensureCorrectNetwork();

      const nftContract = await getNftContract();
      const marketContract = await getMarketContract();
      const nftAddress = await nftContract.getAddress();

      const cancelTx = await marketContract.cancelListing(nftAddress, tokenId);
      const receipt = await cancelTx.wait();

      await cancelListing({
        nftId,
        transactionHash: receipt.hash,
      });

      return { transactionHash: receipt.hash };
    },
  });

  const useListing = (tokenId?: number) => {
    return useQuery({
      queryKey: ['listing', tokenId],
      queryFn: async () => {
        if (tokenId === undefined) return null;

        const nftContract = await getNftContract();
        const marketContract = await getMarketContract();
        const nftAddress = await nftContract.getAddress();

        const listing = await marketContract.listings(nftAddress, tokenId);

        if (listing.price === 0n) return null;

        return {
          seller: listing.seller,
          price: ethers.formatEther(listing.price),
        };
      },
      enabled: tokenId !== undefined,
    });
  };

  const useListings = (filters?: {
    pageId?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }) => {
    return useQuery({
      queryKey: ['listings', filters],
      queryFn: () => getListings(filters),
    });
  };

  return {
    listItem: listItemMutation.mutateAsync,
    isListing: listItemMutation.isPending,
    buyItem: buyItemMutation.mutateAsync,
    isBuying: buyItemMutation.isPending,
    cancelListing: cancelListingMutation.mutateAsync,
    isCanceling: cancelListingMutation.isPending,
    useListing,
    useListings,
  };
}
