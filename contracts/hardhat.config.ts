import "dotenv/config";    // carrega o .env antes de tudo
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.RPC_URL!,           // agora não será undefined
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: { url: "http://127.0.0.1:8545" },
  },
  paths: {
    sources: "contracts",
    artifacts: "artifacts",
    cache: "cache",
  },
  mocha: { timeout: 200000 },
};

export default config;
