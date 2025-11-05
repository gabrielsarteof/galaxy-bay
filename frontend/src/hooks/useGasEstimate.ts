import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { getProvider } from '@/services/contract';

interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  estimatedCost: string;
}

export function useGasEstimate() {
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimate, setEstimate] = useState<GasEstimate | null>(null);

  const estimateGas = useCallback(async (
    contract: ethers.Contract,
    method: string,
    args: any[]
  ): Promise<GasEstimate | null> => {
    setIsEstimating(true);
    try {
      const provider = await getProvider();

      const gasLimit = await contract[method].estimateGas(...args);

      const feeData = await provider.getFeeData();

      const gasPrice = feeData.gasPrice || 0n;
      const maxFeePerGas = feeData.maxFeePerGas || undefined;
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || undefined;

      const estimatedCost = ethers.formatEther(gasLimit * gasPrice);

      const result: GasEstimate = {
        gasLimit,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        estimatedCost,
      };

      setEstimate(result);
      return result;
    } catch (error) {
      console.error('Error estimating gas:', error);
      return null;
    } finally {
      setIsEstimating(false);
    }
  }, []);

  return {
    estimate,
    estimateGas,
    isEstimating,
  };
}
