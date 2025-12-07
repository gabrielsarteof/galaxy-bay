import "dotenv/config";
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // Captura a conta que fará o deploy
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // 1) Deploy do contrato NFT
  console.log("\n📝 Deploying GalaxyBayNFT...");
  const NFT = await ethers.getContractFactory("GalaxyBayNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("✅ GalaxyBayNFT deployed at:", nftAddress);

  // 2) Deploy do contrato Marketplace
  console.log("\n📝 Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const market = await Marketplace.deploy();
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("✅ Marketplace deployed at:", marketAddress);

  // 3) Salvar endereços no arquivo .env.local do frontend
  const frontendEnvPath = path.join(__dirname, "../../frontend/.env.local");
  let envContent = "";

  if (fs.existsSync(frontendEnvPath)) {
    envContent = fs.readFileSync(frontendEnvPath, "utf8");
  }

  // Remove linhas antigas dos contratos se existirem
  envContent = envContent
    .split("\n")
    .filter(line =>
      !line.startsWith("NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=") &&
      !line.startsWith("NEXT_PUBLIC_MARKETPLACE_ADDRESS=")
    )
    .join("\n");

  // Adiciona os novos endereços
  envContent += `\nNEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${nftAddress}`;
  envContent += `\nNEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketAddress}\n`;

  fs.writeFileSync(frontendEnvPath, envContent);
  console.log("\n✅ Endereços salvos em frontend/.env.local");

  // 4) Copiar ABIs para o frontend
  const artifactsDir = path.join(__dirname, "../artifacts/contracts");
  const frontendContractsDir = path.join(__dirname, "../../frontend/src/contracts");

  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  // Copiar ABI do GalaxyBayNFT
  const nftArtifact = path.join(artifactsDir, "GalaxyBayNFT.sol/GalaxyBayNFT.json");
  const nftDest = path.join(frontendContractsDir, "GalaxyBayNFT.json");
  fs.copyFileSync(nftArtifact, nftDest);

  // Copiar ABI do Marketplace
  const marketArtifact = path.join(artifactsDir, "Marketplace.sol/Marketplace.json");
  const marketDest = path.join(frontendContractsDir, "Marketplace.json");
  fs.copyFileSync(marketArtifact, marketDest);

  console.log("✅ ABIs copiados para frontend/src/contracts");

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Deploy concluído com sucesso!");
  console.log("=".repeat(60));
  console.log("GalaxyBayNFT:", nftAddress);
  console.log("Marketplace:", marketAddress);
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
