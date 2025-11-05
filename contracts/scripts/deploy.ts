import "dotenv/config";
import { ethers } from "hardhat";

async function main() {
  // Captura a conta que fará o deploy
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with", deployer.address);

  // 1) Deploy do contrato NFT
  const NFT = await ethers.getContractFactory("GalaxyBayNFT");
  const nft = await NFT.deploy();                // gera a tx de deploy
  await nft.waitForDeployment();                 // ethers v6: espera mineração :contentReference[oaicite:0]{index=0}
  console.log("GalaxyBayNFT deployed at:", nft.target); // v6 usa .target em vez de .address :contentReference[oaicite:1]{index=1}

  // 2) Deploy do contrato Marketplace
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const market = await Marketplace.deploy();
  await market.waitForDeployment();
  console.log("Marketplace deployed at:", market.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
