import { useState, useEffect, useCallback } from 'react';
import { ethers, Eip1193Provider, BrowserProvider } from 'ethers';

// Estende Eip1193Provider com métodos de eventos do MetaMask
interface MetaMaskProvider extends Eip1193Provider {
  on?: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
}

interface MetaMaskState {
  isConnected: boolean;
  address: string | null;
  isInstalled: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseMetaMaskReturn extends MetaMaskState {
  connect: () => Promise<string | null>;
  disconnect: () => void;
  getProvider: () => Promise<BrowserProvider>;
  getSigner: () => Promise<ethers.JsonRpcSigner>;
  requestAccounts: () => Promise<string[]>;
}

/**
 * Hook personalizado para gerenciar conexão com MetaMask.
 *
 * Recursos:
 * - Detecta automaticamente se MetaMask está instalado
 * - Gerencia estado de conexão
 * - Trata reconexão quando MetaMask está bloqueado
 * - Monitora mudanças de conta
 * - Trata erros de forma amigável
 */
export function useMetaMask(): UseMetaMaskReturn {
  const [state, setState] = useState<MetaMaskState>({
    isConnected: false,
    address: null,
    isInstalled: false,
    isLoading: true,
    error: null,
  });

  // Verifica se MetaMask está instalado e restaura conexão anterior
  useEffect(() => {
    const ethereum = (window as { ethereum?: MetaMaskProvider }).ethereum;
    const storedAddress = localStorage.getItem('walletAddress');

    setState((prev) => ({
      ...prev,
      isInstalled: !!ethereum,
      isConnected: !!storedAddress,
      address: storedAddress,
      isLoading: false,
    }));
  }, []);

  // Monitora mudanças de conta
  useEffect(() => {
    const ethereum = (window as { ethereum?: MetaMaskProvider }).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountsArray = accounts as string[];
      if (accountsArray.length === 0) {
        // MetaMask desconectado
        localStorage.removeItem('walletAddress');
        setState((prev) => ({
          ...prev,
          isConnected: false,
          address: null,
          error: 'MetaMask desconectado',
        }));
      } else {
        // Conta mudou
        const newAddress = accountsArray[0];
        localStorage.setItem('walletAddress', newAddress);
        setState((prev) => ({
          ...prev,
          isConnected: true,
          address: newAddress,
          error: null,
        }));
      }
    };

    const handleChainChanged = () => {
      // Recarrega a página quando a rede muda (recomendação do MetaMask)
      window.location.reload();
    };

    const handleDisconnect = () => {
      localStorage.removeItem('walletAddress');
      setState((prev) => ({
        ...prev,
        isConnected: false,
        address: null,
        error: 'MetaMask desconectado',
      }));
    };

    // Registra listeners
    ethereum.on?.('accountsChanged', handleAccountsChanged);
    ethereum.on?.('chainChanged', handleChainChanged);
    ethereum.on?.('disconnect', handleDisconnect);

    // Cleanup
    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      ethereum.removeListener?.('chainChanged', handleChainChanged);
      ethereum.removeListener?.('disconnect', handleDisconnect);
    };
  }, []);

  /**
   * Solicita acesso às contas do MetaMask.
   * Abre o popup do MetaMask se estiver bloqueado.
   */
  const requestAccounts = useCallback(async (): Promise<string[]> => {
    const ethereum = (window as { ethereum?: MetaMaskProvider }).ethereum;
    if (!ethereum) {
      throw new Error('MetaMask não instalado');
    }

    try {
      const accounts = (await ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];
      return accounts;
    } catch (error) {
      if ((error as { code: number }).code === 4001) {
        // Usuário rejeitou a conexão
        throw new Error('Conexão rejeitada pelo usuário');
      } else if ((error as { code: number }).code === -32002) {
        // Já existe uma solicitação pendente
        throw new Error('Já existe uma solicitação de conexão pendente. Verifique o MetaMask.');
      }
      throw error;
    }
  }, []);

  /**
   * Conecta ao MetaMask e retorna o endereço conectado.
   */
  const connect = useCallback(async (): Promise<string | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const accounts = await requestAccounts();

      if (accounts.length === 0) {
        throw new Error('Nenhuma conta encontrada');
      }

      const address = accounts[0];

      // Salvar no localStorage para persistir entre recarregamentos
      localStorage.setItem('walletAddress', address);

      setState({
        isConnected: true,
        address,
        isInstalled: true,
        isLoading: false,
        error: null,
      });

      return address;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao conectar MetaMask';
      setState((prev) => ({
        ...prev,
        isConnected: false,
        address: null,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [requestAccounts]);

  /**
   * Desconecta do MetaMask (apenas limpa o estado local).
   * Nota: MetaMask não tem um método oficial de "disconnect" da aplicação.
   */
  const disconnect = useCallback(() => {
    localStorage.removeItem('walletAddress');
    setState((prev) => ({
      ...prev,
      isConnected: false,
      address: null,
      error: null,
    }));
  }, []);

  /**
   * Retorna o provider do MetaMask.
   * Se não estiver conectado, solicita conexão automaticamente.
   */
  const getProvider = useCallback(async (): Promise<BrowserProvider> => {
    const ethereum = (window as { ethereum?: MetaMaskProvider }).ethereum;
    if (!ethereum) {
      throw new Error('MetaMask não instalado');
    }

    // Verifica se está conectado, senão solicita conexão
    if (!state.isConnected) {
      await connect();
    }

    return new BrowserProvider(ethereum);
  }, [state.isConnected, connect]);

  /**
   * Retorna o signer do MetaMask.
   * Se não estiver conectado ou MetaMask estiver bloqueado, solicita reconexão.
   */
  const getSigner = useCallback(async (): Promise<ethers.JsonRpcSigner> => {
    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();
      return signer;
    } catch (error) {
      // Se getSigner falhar, pode ser que MetaMask esteja bloqueado
      // Tenta reconectar
      if (
        error instanceof Error &&
        (error.message.includes('unknown account') ||
          error.message.includes('accounts changed') ||
          error.message.includes('locked'))
      ) {
        console.log('MetaMask parece estar bloqueado, solicitando reconexão...');
        await connect();
        const provider = await getProvider();
        return provider.getSigner();
      }
      throw error;
    }
  }, [getProvider, connect]);

  return {
    ...state,
    connect,
    disconnect,
    getProvider,
    getSigner,
    requestAccounts,
  };
}
