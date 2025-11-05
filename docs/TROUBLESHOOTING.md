# Guia de Troubleshooting - Galaxy Bay NFT

## Índice

1. [Problemas de Configuração](#1-problemas-de-configuração)
2. [Problemas de Backend](#2-problemas-de-backend)
3. [Problemas de Frontend](#3-problemas-de-frontend)
4. [Problemas de Blockchain](#4-problemas-de-blockchain)
5. [Problemas de Database](#5-problemas-de-database)
6. [Problemas de IPFS](#6-problemas-de-ipfs)
7. [Erros Comuns do MetaMask](#7-erros-comuns-do-metamask)
8. [Performance Issues](#8-performance-issues)

---

## 1. Problemas de Configuração

### ❌ Erro: "Environment variable not found"

**Sintoma:**
```
Error: Environment variable DATABASE_URL is not defined
```

**Solução:**
```bash
# 1. Verificar se .env existe
ls -la .env

# 2. Criar .env se não existir
cp .env.example .env

# 3. Editar com valores corretos
nano .env

# 4. Reiniciar aplicação
npm run start:dev
```

### ❌ Erro: ".env.example not found"

**Solução: Criar .env manualmente**

**Backend (.env):**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/galaxy_bay"
JWT_SECRET="your-secret-key-min-32-chars"
NFT_STORAGE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
NFT_CONTRACT_ADDRESS="0x4613a374097Ab5DB0bc47DA2725fC4eE285F3f21"
MARKETPLACE_CONTRACT_ADDRESS="0x477b3ab5F17AecD7Ca5c189FC902CF05397eCED1"
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:3001"
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS="0x4613a374097Ab5DB0bc47DA2725fC4eE285F3f21"
NEXT_PUBLIC_MARKETPLACE_ADDRESS="0x477b3ab5F17AecD7Ca5c189FC902CF05397eCED1"
```

**Contracts (.env):**
```env
RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
PRIVATE_KEY="your-wallet-private-key"
ETHERSCAN_API_KEY="your-etherscan-key"
```

---

## 2. Problemas de Backend

### ❌ Backend não inicia

**Erro: "Cannot find module '@nestjs/...'"**

**Solução:**
```bash
# Limpar e reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Verificar versões
npm list @nestjs/core
```

**Erro: "Port 3000 already in use"**

**Solução:**
```bash
# Windows: Encontrar processo
netstat -ano | findstr :3000

# Matar processo
taskkill /PID <PID> /F

# Ou: Mudar porta no .env
PORT=3001
```

### ❌ Erro: "Prisma Client not generated"

**Sintoma:**
```
Error: Cannot find module '@prisma/client'
```

**Solução:**
```bash
cd backend

# Gerar Prisma Client
npx prisma generate

# Se schema mudou, rodar migration
npx prisma migrate dev

# Reiniciar aplicação
npm run start:dev
```

### ❌ Erro: "Invalid JWT token"

**Sintoma:**
```
401 Unauthorized
```

**Solução:**
```bash
# 1. Verificar JWT_SECRET no .env
cat .env | grep JWT_SECRET

# 2. Fazer logout e login novamente no frontend
localStorage.removeItem('token');

# 3. Verificar expiração (padrão: 1h)
# backend/src/auth/jwt.strategy.ts
```

### ❌ Erro: "CORS blocked"

**Sintoma:**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/...'
from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Solução:**
```typescript
// backend/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
});
```

---

## 3. Problemas de Frontend

### ❌ Frontend não inicia

**Erro: "Module not found"**

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules .next package-lock.json
npm install

# Reiniciar
npm run dev
```

**Erro: "Port 3000 already in use"**

**Solução:**
```bash
# Next.js usa porta 3000 por padrão
# Mudar porta:
npm run dev -- -p 3001

# Ou adicionar em package.json:
"dev": "next dev -p 3001"
```

### ❌ API calls falhando

**Erro: "Network Error"**

**Diagnóstico:**
```bash
# 1. Verificar se backend está rodando
curl http://localhost:3000/health

# 2. Verificar NEXT_PUBLIC_API_URL
cat .env.local | grep API_URL

# 3. Ver console do navegador (F12)
# Procurar por erros de rede
```

**Solução:**
```bash
# Reiniciar backend
cd backend
npm run start:dev

# Verificar .env.local do frontend
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

### ❌ "Hydration failed" error

**Sintoma:**
```
Error: Hydration failed because the initial UI does not match
what was rendered on the server
```

**Solução:**
```typescript
// Usar useEffect para código client-side
'use client'

import { useEffect, useState } from 'react';

export function MyComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <div>...</div>;
}
```

### ❌ Images não carregam

**Erro: "Invalid src prop"**

**Solução:**
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud', 'localhost'],
  },
};
```

---

## 4. Problemas de Blockchain

### ❌ "Provider not connected"

**Sintoma:**
```
Error: Provider not found
```

**Solução:**
```typescript
// Verificar se RPC_URL está correto
// backend/.env
RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"

// Testar conexão
const provider = new ethers.JsonRpcProvider(RPC_URL);
const blockNumber = await provider.getBlockNumber();
console.log('Connected! Block:', blockNumber);
```

### ❌ "Transaction failed"

**Erro: "insufficient funds for intrinsic transaction cost"**

**Solução:**
```bash
# Obter Sepolia ETH
# https://sepoliafaucet.com/

# Verificar saldo no MetaMask
# Ou via ethers:
const balance = await provider.getBalance(address);
console.log('Balance:', ethers.formatEther(balance), 'ETH');
```

**Erro: "nonce too low"**

**Solução:**
```bash
# Reset account no MetaMask:
# Settings → Advanced → Reset Account
```

**Erro: "replacement fee too low"**

**Solução:**
```bash
# Aguardar transação anterior confirmar
# Ou: aumentar gas price na nova transação
```

### ❌ "Contract not deployed"

**Erro: "code=CALL_EXCEPTION"**

**Diagnóstico:**
```bash
# Verificar se contrato existe na Sepolia
# https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>

# Verificar endereço no .env
cat .env | grep CONTRACT_ADDRESS
```

**Solução:**
```bash
# Se contrato não existe, fazer deploy:
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia

# Atualizar endereços em todos os .env
```

### ❌ "Wrong network"

**Sintoma:**
```
Please switch to Sepolia network
```

**Solução:**
```typescript
// Auto-switch network
const chainId = await window.ethereum.request({ method: 'eth_chainId' });

if (chainId !== '0xaa36a7') { // Sepolia = 11155111 = 0xaa36a7
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    });
  } catch (error) {
    // Network não adicionada, adicionar:
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0xaa36a7',
        chainName: 'Sepolia Testnet',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://rpc.sepolia.org'],
        blockExplorerUrls: ['https://sepolia.etherscan.io']
      }],
    });
  }
}
```

### ❌ Events não são recebidos

**Sintoma:**
```
Event listeners não disparam
```

**Diagnóstico:**
```typescript
// Verificar se listeners estão ativos
const listenerCount = contract.listenerCount('Transfer');
console.log('Active listeners:', listenerCount);
```

**Solução:**
```typescript
// Remover listeners antigos antes de adicionar novos
contract.removeAllListeners('Transfer');

// Adicionar listener
contract.on('Transfer', (from, to, tokenId) => {
  console.log('Transfer:', { from, to, tokenId });
});

// Para production, usar WebSocket provider
const provider = new ethers.WebSocketProvider(
  'wss://eth-sepolia.g.alchemy.com/v2/YOUR_KEY'
);
```

---

## 5. Problemas de Database

### ❌ "Connection refused"

**Sintoma:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solução:**
```bash
# Verificar se PostgreSQL está rodando

# Windows:
services.msc  # Procurar PostgreSQL

# Iniciar serviço:
net start postgresql-x64-16

# Testar conexão:
psql -U postgres -d galaxy_bay
```

### ❌ "Database does not exist"

**Sintoma:**
```
Error: database "galaxy_bay" does not exist
```

**Solução:**
```bash
# Criar database
createdb galaxy_bay

# Ou via psql:
psql -U postgres
CREATE DATABASE galaxy_bay;
\q

# Rodar migrations
npx prisma migrate deploy
```

### ❌ "Migration failed"

**Erro: "Unique constraint violation"**

**Solução:**
```bash
# Ver estado das migrations
npx prisma migrate status

# Resolver manualmente
npx prisma migrate resolve --applied <migration_name>

# Ou reset (CUIDADO: apaga dados)
npx prisma migrate reset
```

### ❌ "Schema out of sync"

**Erro: "Prisma schema and database are out of sync"**

**Solução:**
```bash
# Desenvolvimento: Criar migration
npx prisma migrate dev --name sync_schema

# Produção: Deploy existing migrations
npx prisma migrate deploy

# Regenerar client
npx prisma generate
```

### ❌ Performance lenta

**Sintoma:**
```
Queries demorando muito
```

**Diagnóstico:**
```typescript
// Enable query logging
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["tracing"]
}

// No código:
prisma.$on('query', (e) => {
  console.log('Query:', e.query);
  console.log('Duration:', e.duration, 'ms');
});
```

**Solução:**
```prisma
// Adicionar índices
model NFT {
  // ...

  @@index([pageId])
  @@index([status])
  @@index([collectionId])
  @@index([tokenId])
}

model Activity {
  // ...

  @@index([pageId])
  @@index([nftId])
  @@index([type])
  @@index([createdAt])
}
```

```bash
# Aplicar índices
npx prisma migrate dev --name add_indexes
```

---

## 6. Problemas de IPFS

### ❌ "Upload failed"

**Erro: "Failed to upload to IPFS"**

**Diagnóstico:**
```bash
# Testar API key
curl -X POST https://api.nft.storage/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@test.png"
```

**Solução:**
```bash
# 1. Verificar NFT_STORAGE_KEY
cat backend/.env | grep NFT_STORAGE_KEY

# 2. Obter nova key em https://nft.storage/

# 3. Verificar limites da conta
# Free tier: 31 GB storage, unlimited uploads

# 4. Alternativa: usar Pinata
# https://www.pinata.cloud/
```

### ❌ "IPFS content not loading"

**Sintoma:**
```
Image não carrega de https://ipfs.io/ipfs/Qm...
```

**Solução:**
```typescript
// Usar múltiplos gateways como fallback
const gateways = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

function getIpfsUrl(cid: string, gatewayIndex = 0): string {
  if (gatewayIndex >= gateways.length) {
    throw new Error('All IPFS gateways failed');
  }
  return gateways[gatewayIndex] + cid;
}

// Tentar próximo gateway se falhar
<img
  src={getIpfsUrl(cid, 0)}
  onError={(e) => {
    e.currentTarget.src = getIpfsUrl(cid, 1);
  }}
/>
```

### ❌ "Metadata format invalid"

**Erro: "Invalid metadata structure"**

**Solução:**
```typescript
// Seguir padrão ERC721 Metadata JSON Schema
interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URL
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  background_color?: string;
}

// Exemplo:
const metadata: NFTMetadata = {
  name: "Cool NFT #1",
  description: "My awesome NFT",
  image: "https://ipfs.io/ipfs/Qm...",
  attributes: [
    { trait_type: "Background", value: "Blue" },
    { trait_type: "Rarity", value: "Rare" }
  ]
};
```

---

## 7. Erros Comuns do MetaMask

### ❌ "MetaMask not detected"

**Solução:**
```typescript
// Verificar instalação
if (typeof window.ethereum === 'undefined') {
  alert('Please install MetaMask!');
  window.open('https://metamask.io/download/', '_blank');
  return;
}
```

### ❌ "User rejected transaction"

**Sintoma:**
```
Error: User denied transaction signature
```

**Solução:**
```typescript
// Adicionar try-catch e mensagem amigável
try {
  const tx = await contract.mintTo(address, uri);
  await tx.wait();
} catch (error: any) {
  if (error.code === 'ACTION_REJECTED') {
    alert('Transaction was rejected');
  } else {
    alert('Transaction failed: ' + error.message);
  }
}
```

### ❌ "Insufficient funds"

**Sintoma:**
```
Error: insufficient funds for intrinsic transaction cost
```

**Solução:**
```typescript
// Verificar saldo antes de transação
const balance = await provider.getBalance(address);
const gasEstimate = await contract.mintTo.estimateGas(address, uri);
const gasPrice = await provider.getFeeData();

const totalCost = gasEstimate * (gasPrice.gasPrice || 0n);

if (balance < totalCost) {
  alert(`Insufficient funds. Need ${ethers.formatEther(totalCost)} ETH`);
  return;
}
```

### ❌ "Nonce too low"

**Solução:**
```bash
# No MetaMask:
# Settings → Advanced → Reset Account
# (Isso limpa o histórico de transações local)
```

### ❌ "Gas estimation failed"

**Erro: "cannot estimate gas"**

**Diagnóstico:**
```typescript
// Tentar com gas limit manual
try {
  const tx = await contract.mintTo(address, uri, {
    gasLimit: 500000
  });
} catch (error) {
  console.error('Transaction would fail:', error);
}
```

**Causas comuns:**
- Contrato vai reverter (require falha)
- Endereço inválido
- Parâmetros incorretos
- Contrato pausado

---

## 8. Performance Issues

### ❌ Backend lento

**Diagnóstico:**
```typescript
// Adicionar timing logs
const start = Date.now();
const result = await someOperation();
console.log(`Operation took ${Date.now() - start}ms`);
```

**Soluções:**

1. **Database queries lentas:**
```prisma
// Adicionar índices (ver seção Database)
// Usar select para buscar apenas campos necessários
const nfts = await prisma.nFT.findMany({
  select: {
    id: true,
    name: true,
    imageUrl: true,
    price: true
  }
});

// Usar pagination
const nfts = await prisma.nFT.findMany({
  take: 20,
  skip: page * 20
});
```

2. **IPFS upload lento:**
```typescript
// Comprimir imagens antes de upload
import sharp from 'sharp';

const compressed = await sharp(buffer)
  .resize(1024, 1024, { fit: 'inside' })
  .jpeg({ quality: 80 })
  .toBuffer();
```

3. **Blockchain queries lentas:**
```typescript
// Usar caching
import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  private cache = new Map();

  async get(key: string, ttl: number, fn: () => Promise<any>) {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }

    const value = await fn();
    this.cache.set(key, { value, expires: Date.now() + ttl });
    return value;
  }
}
```

### ❌ Frontend lento

**Soluções:**

1. **Bundle size grande:**
```bash
# Analisar bundle
npm run build
npm run analyze  # Se configurado

# Usar dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSkeleton />
});
```

2. **Muitos re-renders:**
```typescript
// Usar React.memo
export const NFTCard = React.memo(function NFTCard({ nft }) {
  // ...
});

// Usar useMemo e useCallback
const filteredNfts = useMemo(() =>
  nfts.filter(nft => nft.status === 'listed'),
  [nfts]
);

const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

3. **Images não otimizadas:**
```typescript
// Usar Next.js Image
import Image from 'next/image';

<Image
  src={nft.imageUrl}
  alt={nft.name}
  width={300}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

---

## 9. Ferramentas de Debug

### Backend
```bash
# Logs detalhados
DEBUG=* npm run start:dev

# Prisma query logs
# .env
DATABASE_URL="postgresql://...?query_log=true"
```

### Frontend
```typescript
// React Query Devtools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Blockchain
```bash
# Hardhat console
npx hardhat console --network sepolia

# Interagir com contrato:
> const NFT = await ethers.getContractAt("GalaxyBayNFT", "0x...");
> const owner = await NFT.owner();
> console.log(owner);
```

---

## 10. Logs Úteis

### Verificar health de todos os serviços

```bash
# Backend
curl http://localhost:3000/health

# Database
psql -U postgres -d galaxy_bay -c "SELECT 1;"

# Blockchain
curl https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Monitorar transações

```bash
# Ver transação no Etherscan
https://sepolia.etherscan.io/tx/<TX_HASH>

# Via ethers:
const receipt = await provider.getTransactionReceipt(txHash);
console.log(receipt);
```

---

## Contato

Se o problema persistir após seguir este guia:

1. Verificar documentação completa em `/docs`
2. Verificar issues conhecidos no GitHub
3. Contatar equipe de desenvolvimento

**Última atualização:** Janeiro 2025
