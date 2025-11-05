import { BrowserProvider, Contract, Eip1193Provider } from "ethers";
import GalaxyBayNFTAbi from "../contracts/GalaxyBayNFT.json";
import MarketplaceAbi from "../contracts/Marketplace.json";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!;
export const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS!;
export const SEPOLIA_CHAIN_ID = '0xaa36a7';
export const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

export async function getProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask não encontrado");
  }
  return new BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

export async function getNftContract() {
  const signer = await getSigner();
  return new Contract(NFT_CONTRACT_ADDRESS, GalaxyBayNFTAbi.abi, signer);
}

export async function getMarketContract() {
  const signer = await getSigner();
  return new Contract(MARKETPLACE_ADDRESS, MarketplaceAbi.abi, signer);
}

export async function checkNetwork(): Promise<boolean> {
  const provider = await getProvider();
  const network = await provider.getNetwork();

  if (network.chainId !== BigInt(SEPOLIA_CHAIN_ID_DECIMAL)) {
    return false;
  }

  return true;
}

export async function switchToSepolia(): Promise<boolean> {
  if (!window.ethereum) {
    throw new Error("MetaMask não encontrado");
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
    return true;
  } catch (error: any) {
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: SEPOLIA_CHAIN_ID,
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add Sepolia network:', addError);
        return false;
      }
    }
    console.error('Failed to switch network:', error);
    return false;
  }
}

export async function ensureCorrectNetwork(): Promise<void> {
  const isCorrectNetwork = await checkNetwork();
  if (!isCorrectNetwork) {
    const switched = await switchToSepolia();
    if (!switched) {
      throw new Error('Por favor, mude para a rede Sepolia no MetaMask');
    }
  }
}
