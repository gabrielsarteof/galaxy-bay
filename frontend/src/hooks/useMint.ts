import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { useMetaMask } from './useMetaMask';
import { prepareMintNFT, registerNft } from '@/services/nfts';
import { getNftContract, ensureCorrectNetwork } from '@/services/contract';
import { retryTransaction, parseTransactionError } from '@/utils/retryTransaction';

interface MintNFTParams {
  name: string;
  description?: string;
  image: File;  // Mudado de string para File
  attributes?: Array<{ trait_type: string; value: string | number }>;
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
      console.log('[useMint] Iniciando mint com params:', params);

      if (!address) {
        console.error('[useMint] Carteira não conectada');
        throw new Error('Carteira não conectada');
      }

      console.log('[useMint] Address encontrado:', address);

      try {
        console.log('[useMint] Verificando rede...');
        await ensureCorrectNetwork();

        // Upload completo para IPFS via Pinata (imagem + metadata)
        console.log('[useMint] Iniciando upload para IPFS...');
        setStatus('uploading');
        const uploadResult = await prepareMintNFT({
          image: params.image,
          name: params.name,
          description: params.description || '',
          attributes: params.attributes,
        });
        console.log('[useMint] Upload concluído:', uploadResult);

        // Usar o tokenURI retornado (ipfs://...)
        const tokenURI = uploadResult.tokenURI;

        console.log('[useMint] Iniciando mint na blockchain...');
        setStatus('minting');
        const contract = await getNftContract();

        const receipt = await retryTransaction(
          async () => {
            const tx = await contract.mintTo(address, tokenURI);
            console.log('[useMint] Transação enviada:', tx.hash);
            const receipt = await tx.wait();
            console.log('[useMint] Transação confirmada:', receipt);
            return receipt;
          },
          {
            maxRetries: 3,
            retryDelay: 2000,
            onRetry: (attempt, error) => {
              setRetryCount(attempt);
              console.log(`[useMint] Retry attempt ${attempt}:`, error);
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
          console.error('[useMint] Transfer event não encontrado nos logs:', receipt.logs);
          throw new Error('Transfer event não encontrado');
        }

        const parsedEvent = contract.interface.parseLog({
          topics: transferEvent.topics,
          data: transferEvent.data,
        });

        const tokenId = Number(parsedEvent?.args?.tokenId);
        console.log('[useMint] TokenId extraído:', tokenId);

        console.log('[useMint] Registrando NFT no backend...');
        setStatus('registering');
        const nft = await registerNft({
          tokenId: tokenId.toString(), // Converter para string
          transactionHash: receipt.hash,
          metadataUrl: uploadResult.metadataUrl,
          name: params.name,
          description: params.description || '',
          imageUrl: uploadResult.imageUrl,
          pageId: params.pageId,
          collectionId: params.collectionId,
          blockHash: receipt.blockHash,
        });
        console.log('[useMint] NFT registrada no backend:', nft);

        setStatus('idle');
        setRetryCount(0);
        return { nft, tokenId, transactionHash: receipt.hash };
      } catch (error: any) {
        console.error('[useMint] Erro durante mint:', error);
        console.error('[useMint] Error details:', {
          message: error.message,
          code: error.code,
          stack: error.stack,
        });
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
