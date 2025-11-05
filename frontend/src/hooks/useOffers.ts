import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOffer, getOffersByNft, acceptOffer, cancelOffer } from '@/services/offers';

export function useOffers(nftId?: string) {
  const queryClient = useQueryClient();

  const offersQuery = useQuery({
    queryKey: ['offers', nftId],
    queryFn: () => getOffersByNft(nftId!),
    enabled: !!nftId,
  });

  const createOfferMutation = useMutation({
    mutationFn: createOffer,
    onSuccess: () => {
      if (nftId) {
        queryClient.invalidateQueries({ queryKey: ['offers', nftId] });
      }
    },
  });

  const acceptOfferMutation = useMutation({
    mutationFn: acceptOffer,
    onSuccess: () => {
      if (nftId) {
        queryClient.invalidateQueries({ queryKey: ['offers', nftId] });
        queryClient.invalidateQueries({ queryKey: ['nft', nftId] });
      }
    },
  });

  const cancelOfferMutation = useMutation({
    mutationFn: cancelOffer,
    onSuccess: () => {
      if (nftId) {
        queryClient.invalidateQueries({ queryKey: ['offers', nftId] });
      }
    },
  });

  return {
    offers: offersQuery.data || [],
    isLoading: offersQuery.isLoading,
    createOffer: createOfferMutation.mutateAsync,
    isCreating: createOfferMutation.isPending,
    acceptOffer: acceptOfferMutation.mutateAsync,
    isAccepting: acceptOfferMutation.isPending,
    cancelOffer: cancelOfferMutation.mutateAsync,
    isCanceling: cancelOfferMutation.isPending,
  };
}
