import { ethers } from 'ethers';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: any) => void;
}

export async function retryTransaction<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, retryDelay = 2000, onRetry } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      const isUserRejection =
        error?.code === 'ACTION_REJECTED' ||
        error?.code === 4001 ||
        error?.message?.includes('user rejected');

      if (isUserRejection) {
        throw new Error('Transação cancelada pelo usuário');
      }

      const isNonceError =
        error?.code === 'NONCE_EXPIRED' ||
        error?.message?.includes('nonce');

      if (isNonceError && attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt, error);
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      const isNetworkError =
        error?.code === 'NETWORK_ERROR' ||
        error?.message?.includes('network');

      if (isNetworkError && attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt, error);
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      if (attempt === maxRetries) {
        break;
      }
    }
  }

  throw lastError;
}

export function parseTransactionError(error: any): string {
  if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
    return 'Transação cancelada pelo usuário';
  }

  if (error?.code === 'INSUFFICIENT_FUNDS') {
    return 'Saldo insuficiente para completar a transação';
  }

  if (error?.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return 'Não foi possível estimar o gas. A transação pode falhar.';
  }

  if (error?.message?.includes('execution reverted')) {
    const reason = error?.reason || error?.data?.message;
    if (reason) {
      return `Transação revertida: ${reason}`;
    }
    return 'Transação revertida pelo contrato';
  }

  if (error?.message?.includes('nonce')) {
    return 'Erro de nonce. Tente novamente em alguns segundos.';
  }

  if (error?.message?.includes('network')) {
    return 'Erro de rede. Verifique sua conexão.';
  }

  return error?.message || 'Erro desconhecido na transação';
}
