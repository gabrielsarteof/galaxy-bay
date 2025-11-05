import { useQuery } from '@tanstack/react-query';
import { getNftContract } from '@/services/contract';

export function useBlockchain() {
  const useNftOwner = (tokenId?: number) => {
    return useQuery({
      queryKey: ['nft-owner', tokenId],
      queryFn: async () => {
        if (tokenId === undefined) return null;
        const contract = await getNftContract();
        const owner = await contract.ownerOf(tokenId);
        return owner.toLowerCase();
      },
      enabled: tokenId !== undefined,
      staleTime: 30000,
    });
  };

  const useTokenURI = (tokenId?: number) => {
    return useQuery({
      queryKey: ['token-uri', tokenId],
      queryFn: async () => {
        if (tokenId === undefined) return null;
        const contract = await getNftContract();
        const uri = await contract.tokenURI(tokenId);
        return uri;
      },
      enabled: tokenId !== undefined,
      staleTime: Infinity,
    });
  };

  const useNftBalance = (address?: string) => {
    return useQuery({
      queryKey: ['nft-balance', address],
      queryFn: async () => {
        if (!address) return 0;
        const contract = await getNftContract();
        const balance = await contract.balanceOf(address);
        return Number(balance);
      },
      enabled: !!address,
      staleTime: 30000,
    });
  };

  const useNextTokenId = () => {
    return useQuery({
      queryKey: ['next-token-id'],
      queryFn: async () => {
        const contract = await getNftContract();
        const nextTokenId = await contract.nextTokenId();
        return Number(nextTokenId);
      },
      staleTime: 10000,
    });
  };

  return {
    useNftOwner,
    useTokenURI,
    useNftBalance,
    useNextTokenId,
  };
}
