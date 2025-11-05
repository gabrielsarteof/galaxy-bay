# Guia de Setup Rápido - Galaxy Bay NFT

## Pré-requisitos

- Node.js v18+
- PostgreSQL 16
- MetaMask instalado
- Conta Alchemy/Infura (para RPC)
- Sepolia ETH (faucet: https://sepoliafaucet.com/)

---

## 1. Setup do Backend

```bash
cd C:/Dev/Galaxy-Bay/backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais
```

### .env do Backend

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/galaxy_bay"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# NFT Storage (IPFS)
NFT_STORAGE_KEY="your-nft-storage-api-key"

# Blockchain
RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"
NFT_CONTRACT_ADDRESS="0x4613a374097Ab5DB0bc47DA2725fC4eE285F3f21"
MARKETPLACE_CONTRACT_ADDRESS="0x477b3ab5F17AecD7Ca5c189FC902CF05397eCED1"

# App
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:3001"
```

### Criar Database

```bash
# Criar database PostgreSQL
createdb galaxy_bay

# Ou via psql:
psql -U postgres
CREATE DATABASE galaxy_bay;
\q
```

### Rodar Migrações

```bash
# Gerar Prisma Client
npx prisma generate

# Rodar migrações
npx prisma migrate deploy

# Ou para desenvolvimento (cria nova migration se schema mudou):
npx prisma migrate dev
```

### Copiar ABIs dos Contratos

```bash
# Copiar ABIs para o backend (se ainda não estão lá)
mkdir -p src/contracts
cp ../contracts/artifacts/contracts/GalaxyBayNFT.sol/GalaxyBayNFT.json src/contracts/
cp ../contracts/artifacts/contracts/Marketplace.sol/Marketplace.json src/contracts/
```

### Iniciar Backend

```bash
npm run start:dev
```

O backend estará rodando em `http://localhost:3000`

---

## 2. Setup do Frontend

```bash
cd C:/Dev/Galaxy-Bay/frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local
```

### .env.local do Frontend

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS="0x4613a374097Ab5DB0bc47DA2725fC4eE285F3f21"
NEXT_PUBLIC_MARKETPLACE_ADDRESS="0x477b3ab5F17AecD7Ca5c189FC902CF05397eCED1"
```

### Copiar ABIs (se necessário)

```bash
# Copiar ABIs para o frontend (se ainda não estão lá)
mkdir -p src/contracts
cp ../contracts/artifacts/contracts/GalaxyBayNFT.sol/GalaxyBayNFT.json src/contracts/
cp ../contracts/artifacts/contracts/Marketplace.sol/Marketplace.json src/contracts/
```

### Iniciar Frontend

```bash
npm run dev
```

O frontend estará rodando em `http://localhost:3001`

---

## 3. Setup dos Contratos (Se precisar fazer deploy novamente)

```bash
cd C:/Dev/Galaxy-Bay/contracts

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env
```

### .env dos Contratos

```env
RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"
PRIVATE_KEY="your-wallet-private-key-here"
ETHERSCAN_API_KEY="your-etherscan-api-key"
```

### Compilar Contratos

```bash
npx hardhat compile
```

### Deploy (se necessário)

```bash
# Deploy na Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Anotar os endereços deployados e atualizar:
# - backend/.env (NFT_CONTRACT_ADDRESS, MARKETPLACE_CONTRACT_ADDRESS)
# - frontend/.env.local (NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, NEXT_PUBLIC_MARKETPLACE_ADDRESS)
```

### Verificar no Etherscan

```bash
npx hardhat verify --network sepolia <NFT_CONTRACT_ADDRESS>
npx hardhat verify --network sepolia <MARKETPLACE_CONTRACT_ADDRESS>
```

---

## 4. Configurar MetaMask

### Adicionar Rede Sepolia

1. Abrir MetaMask
2. Trocar de rede → "Add Network" → "Add a network manually"
3. Preencher:
   - **Network Name:** Sepolia
   - **RPC URL:** https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   - **Chain ID:** 11155111
   - **Currency Symbol:** ETH
   - **Block Explorer:** https://sepolia.etherscan.io

### Obter Sepolia ETH

1. Ir para https://sepoliafaucet.com/
2. Conectar carteira
3. Solicitar 0.5 ETH (pode levar alguns minutos)

---

## 5. Testar o Sistema

### 5.1 Testar Backend

```bash
# Health check
curl http://localhost:3000/health

# Verificar API docs
# Abrir: http://localhost:3000/api-docs
```

### 5.2 Testar Autenticação

1. Abrir `http://localhost:3001/auth/login`
2. Clicar em "Connect Wallet"
3. Aprovar no MetaMask
4. Assinar mensagem
5. Deve redirecionar para dashboard

### 5.3 Testar Mint de NFT

1. Ir para `http://localhost:3001/create-nft`
2. Upload de uma imagem
3. Preencher nome e descrição
4. Clicar "Mint NFT"
5. Aguardar:
   - Upload para IPFS
   - Transação no MetaMask (aprovar)
   - Confirmação on-chain
   - Registro no backend

---

## 6. Troubleshooting

### Backend não inicia

**Erro: "DATABASE_URL not found"**
```bash
# Verificar se .env existe e está correto
cat .env | grep DATABASE_URL
```

**Erro de conexão com PostgreSQL**
```bash
# Verificar se PostgreSQL está rodando
# Windows:
services.msc # Procurar PostgreSQL

# Testar conexão:
psql -U postgres -d galaxy_bay
```

**Erro: "NFT_STORAGE_KEY not found"**
```bash
# Obter API key em https://nft.storage/
# Adicionar em .env:
NFT_STORAGE_KEY="your-key-here"
```

### Frontend não conecta com Backend

**Erro: "Network Error" ou CORS**
```bash
# Verificar se backend está rodando:
curl http://localhost:3000/health

# Verificar CORS no backend:
# backend/src/main.ts deve ter:
app.enableCors({
  origin: 'http://localhost:3001',
  credentials: true,
});
```

### MetaMask não conecta

**Erro: "MetaMask not detected"**
- Instalar extensão do MetaMask
- Recarregar página

**Erro: "Wrong network"**
- Trocar para Sepolia no MetaMask
- Ou adicionar auto-switch no código

**Erro: "Insufficient funds"**
- Obter Sepolia ETH no faucet
- https://sepoliafaucet.com/

### Mint falha

**Erro: "Metadata upload failed"**
```bash
# Verificar NFT_STORAGE_KEY no backend
# Verificar logs do backend:
npm run start:dev
```

**Erro: "Transaction failed"**
- Verificar saldo de Sepolia ETH
- Verificar se contrato está correto
- Ver transação no Sepolia Etherscan

**Erro: "Not approved minter"**
```bash
# O contrato atual só permite owner mintar
# Solução: usar a mesma carteira que fez deploy
# Ou: modificar contrato para permitir outros minters
```

### Listagem no Marketplace falha

**Erro: "Approval failed"**
```bash
# Verificar se NFT realmente pertence ao usuário
# Ver no Etherscan: https://sepolia.etherscan.io/token/<NFT_CONTRACT>?a=<TOKEN_ID>
```

**Erro: "Transfer failed"**
```bash
# Verificar se approval foi feita antes
# Ver transações no MetaMask
```

### Database issues

**Erro: "Relation does not exist"**
```bash
# Rodar migrações:
cd backend
npx prisma migrate deploy
```

**Reset database (CUIDADO: apaga tudo)**
```bash
npx prisma migrate reset
```

**Ver dados no database**
```bash
npx prisma studio
# Abre GUI em http://localhost:5555
```

---

## 7. Comandos Úteis

### Backend
```bash
# Desenvolvimento
npm run start:dev

# Build
npm run build

# Testes
npm run test

# Prisma Studio (GUI database)
npx prisma studio

# Gerar nova migration
npx prisma migrate dev --name nome_da_migration

# Ver logs
# (logs aparecem no console)
```

### Frontend
```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Production
npm run start

# Lint
npm run lint
```

### Contratos
```bash
# Compilar
npx hardhat compile

# Testes
npx hardhat test

# Coverage
npx hardhat coverage

# Deploy
npx hardhat run scripts/deploy.ts --network sepolia

# Console (interagir com contratos)
npx hardhat console --network sepolia

# Verificar no Etherscan
npx hardhat verify --network sepolia <ADDRESS>
```

---

## 8. Estrutura de Pastas

```
Galaxy-Bay/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Autenticação Web3
│   │   ├── nft/            # NFT management
│   │   ├── pages/          # Creator pages
│   │   ├── utils/
│   │   │   ├── ipfs.service.ts
│   │   │   └── blockchain.service.ts ⚠️ IMPLEMENTAR
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── .env
│
├── frontend/                # Next.js App
│   ├── src/
│   │   ├── app/            # Pages (App Router)
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── contracts/      # ABIs
│   └── .env.local
│
├── contracts/               # Smart Contracts
│   ├── contracts/
│   │   ├── GalaxyBayNFT.sol
│   │   └── Marketplace.sol
│   ├── scripts/
│   │   └── deploy.ts
│   ├── test/
│   └── .env
│
└── docs/                    # Documentação
    ├── NFT_IMPLEMENTATION.md
    ├── IMPLEMENTATION_CHECKLIST.md
    └── QUICK_START.md
```

---

## 9. Próximos Passos

Após setup completo:

1. ✅ Testar mint de NFT
2. ✅ Testar criação de página
3. ⚠️ **TODO:** Implementar BlockchainService
4. ⚠️ **TODO:** Implementar useMarketplace hook
5. ⚠️ **TODO:** Testar listagem no marketplace
6. ⚠️ **TODO:** Testar compra de NFT

Ver checklist completo em: `docs/IMPLEMENTATION_CHECKLIST.md`

---

## 10. Recursos

- **Documentação Principal:** [NFT_IMPLEMENTATION.md](./NFT_IMPLEMENTATION.md)
- **Checklist:** [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)
- **Sepolia Faucet:** https://sepoliafaucet.com/
- **Sepolia Etherscan:** https://sepolia.etherscan.io/
- **NFT.Storage:** https://nft.storage/
- **Alchemy:** https://www.alchemy.com/
- **OpenZeppelin:** https://docs.openzeppelin.com/

---

## Contato e Suporte

Para dúvidas ou problemas:
1. Verificar documentação em `/docs`
2. Verificar logs do backend/frontend
3. Verificar transações no Etherscan
4. Consultar equipe de desenvolvimento

**Última atualização:** Janeiro 2025
