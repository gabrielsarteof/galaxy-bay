declare module "*.json";

// Tipagem de variáveis de ambiente
declare namespace NodeJS {
  interface ProcessEnv {
    RPC_URL: string;
    PRIVATE_KEY: string;
    NEXT_PUBLIC_NFT_CONTRACT_ADDRESS: string;
    NEXT_PUBLIC_MARKETPLACE_ADDRESS: string;
  }
}
