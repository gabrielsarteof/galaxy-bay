import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { useMetaMask } from './useMetaMask';
import { generateMetadata, registerNft } from '@/services/nfts';
import { getNftContract, ensureCorrectNetwork } from '@/services/contract';
import { retryTransaction, parseTransactionError } from '@/utils/retryTransaction';

interface MintNFTParams {
  name: string;
  description?: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string }>;
  pageId: string;
  collectionId: string;
}

type MintStatus = 'idle' | 'uploading' | 'minting' | 'registering';

export function useMint() {
  const { address } = useMetaMask();
  const [status, setStatus] = useState<MintStatus>('idle');
  const [retryCount, setRetryCount] = useState(0);

  const mint = useMutation({
    mutationFn: async (params: MintNFTParams) => {
      if (!address) {
        throw new Error('Carteira não conectada');
      }

      try {
        await ensureCorrectNetwork();

        setStatus('uploading');
        const { metadataUrl } = await generateMetadata({
          name: params.name,
          description: params.description || '',
          image: params.image,
          attributes: params.attributes,
        });

        setStatus('minting');
        const contract = await getNftContract();

        const receipt = await retryTransaction(
          async () => {
            const tx = await contract.mintTo(address, metadataUrl);
            return await tx.wait();
          },
          {
            maxRetries: 3,
            retryDelay: 2000,
            onRetry: (attempt, error) => {
              setRetryCount(attempt);
              console.log(`Retry attempt ${attempt}:`, error);
            },
          }
        );

        const transferEvent = receipt.logs.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog({
              topics: log.topics,
              data: log.data,
            });
            return parsed?.name === 'Transfer';
          } catch {
            return false;
          }
        });

        if (!transferEvent) {
          throw new Error('Transfer event não encontrado');
        }

        const parsedEvent = contract.interface.parseLog({
          topics: transferEvent.topics,
          data: transferEvent.data,
        });

        const tokenId = Number(parsedEvent?.args?.tokenId);

        setStatus('registering');
        const nft = await registerNft({
          tokenId,
          transactionHash: receipt.hash,
          metadataUrl,
          name: params.name,
          description: params.description || '',
          imageUrl: params.image,
          pageId: params.pageId,
          collectionId: params.collectionId,
          blockHash: receipt.blockHash,
        });

        setStatus('idle');
        setRetryCount(0);
        return { nft, tokenId, transactionHash: receipt.hash };
      } catch (error: any) {
        setStatus('idle');
        setRetryCount(0);
        const errorMessage = parseTransactionError(error);
        throw new Error(errorMessage);
      }
    },
  });

  return {
    mint: mint.mutateAsync,
    isLoading: mint.isPending,
    error: mint.error,
    status,
    retryCount,
    reset: mint.reset,
  };
}
