# Galaxy Bay NFT Marketplace - Documentação

## Visão Geral

Galaxy Bay é um marketplace de NFTs descentralizado estilo OpenSea, construído na rede Ethereum Sepolia. O projeto permite que criadores mintam, listem e vendam NFTs através de uma interface moderna e intuitiva.

## Stack Tecnológico

- **Smart Contracts:** Solidity 0.8.20 + OpenZeppelin + Hardhat
- **Backend:** NestJS 11 + TypeScript + Prisma ORM + PostgreSQL 16
- **Frontend:** Next.js 15 + React 19 + ethers.js v6 + TanStack Query
- **Storage:** IPFS (nft.storage) para metadata + PostgreSQL para indexação
- **Blockchain:** Ethereum Sepolia Testnet

## Arquitetura

```
┌─────────────┐
│  Frontend   │  Next.js + MetaMask Integration
│  (Next.js)  │
└──────┬──────┘
       │ REST API + Web3 RPC
       ▼
┌─────────────┐
│   Backend   │  NestJS + Event Indexing
│  (NestJS)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Blockchain (Sepolia)       │
│  - GalaxyBayNFT (ERC721)   │
│  - Marketplace (Escrow)     │
└─────────────────────────────┘
```

## Contratos Deployados

**Rede:** Sepolia Testnet

| Contrato | Endereço | Função |
|----------|----------|--------|
| GalaxyBayNFT | `0x4613a374097Ab5DB0bc47DA2725fC4eE285F3f21` | ERC721 NFT |
| Marketplace | `0x477b3ab5F17AecD7Ca5c189FC902CF05397eCED1` | Escrow + Trading |

[Ver no Etherscan](https://sepolia.etherscan.io/)

## Funcionalidades

### ✅ Implementadas

- Autenticação Web3 (wallet-based, sem senha)
- Mint de NFTs com metadata IPFS
- Páginas de criadores personalizáveis
- Coleções de NFTs
- Sistema de atividades (histórico)
- Upload de imagens otimizado
- API REST completa

### 🚧 Em Desenvolvimento

- Marketplace (listagem, compra, cancelamento)
- Event indexing automático
- Sistema de ofertas
- Royalties (EIP-2981)
- Analytics e estatísticas

### 📋 Planejado

- Leilões
- Multi-chain support
- Lazy minting
- Notificações push

## Documentação

### Guias Principais

| Documento | Descrição |
|-----------|-----------|
| [NFT_IMPLEMENTATION.md](./NFT_IMPLEMENTATION.md) | Documentação técnica completa (200+ páginas) |
| [QUICK_START.md](./QUICK_START.md) | Guia rápido de setup e configuração |
| [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) | Checklist detalhado de tarefas |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Guia de resolução de problemas |

### Estrutura da Documentação

```
docs/
├── README.md                      # Este arquivo (overview)
├── NFT_IMPLEMENTATION.md          # Documentação técnica completa
│   ├── Arquitetura detalhada
│   ├── Análise de contratos
│   ├── Backend (NestJS)
│   ├── Frontend (Next.js)
│   ├── Integração IPFS
│   ├── Fluxos de funcionalidades
│   ├── Roadmap de implementação
│   ├── Segurança
│   └── Deploy e testes
├── IMPLEMENTATION_CHECKLIST.md    # Checklist de tarefas
│   ├── Fase 1: Contratos
│   ├── Fase 2: Backend
│   ├── Fase 3: Frontend
│   ├── Fase 4: Advanced Features
│   ├── Fase 5: Testing
│   ├── Fase 6: Security
│   └── Fase 7: Deploy
├── QUICK_START.md                 # Setup rápido
│   ├── Pré-requisitos
│   ├── Setup backend
│   ├── Setup frontend
│   ├── Setup contratos
│   ├── Configuração MetaMask
│   └── Primeiros testes
└── TROUBLESHOOTING.md             # Solução de problemas
    ├── Configuração
    ├── Backend
    ├── Frontend
    ├── Blockchain
    ├── Database
    ├── IPFS
    └── MetaMask
```

## Quick Start

### 1. Clone o repositório

```bash
cd C:/Dev/Galaxy-Bay
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env com suas credenciais
npx prisma migrate deploy
npm run start:dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Editar .env.local
npm run dev
```

### 4. Acessar

- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

## Pré-requisitos

- Node.js v18+
- PostgreSQL 16
- MetaMask
- Sepolia ETH ([Faucet](https://sepoliafaucet.com/))
- Alchemy/Infura API Key
- NFT.Storage API Key

## Variáveis de Ambiente

### Backend (.env)

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
NFT_STORAGE_KEY="..."
RPC_URL="https://eth-sepolia.g.alchemy.com/v2/..."
NFT_CONTRACT_ADDRESS="0x..."
MARKETPLACE_CONTRACT_ADDRESS="0x..."
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_MARKETPLACE_ADDRESS="0x..."
```

Ver configuração detalhada em [QUICK_START.md](./QUICK_START.md)

## Estrutura do Projeto

```
Galaxy-Bay/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Autenticação Web3
│   │   ├── nft/            # NFT management
│   │   ├── pages/          # Creator pages
│   │   ├── collections/    # NFT collections
│   │   ├── activities/     # Activity log
│   │   └── utils/
│   │       ├── ipfs.service.ts
│   │       └── blockchain.service.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── frontend/                # Next.js App
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── contracts/      # ABIs
│   │   └── domain/         # Entities
│   └── package.json
│
├── contracts/               # Smart Contracts
│   ├── contracts/
│   │   ├── GalaxyBayNFT.sol
│   │   └── Marketplace.sol
│   ├── scripts/
│   │   └── deploy.ts
│   ├── test/
│   └── hardhat.config.ts
│
└── docs/                    # Documentação
    ├── README.md
    ├── NFT_IMPLEMENTATION.md
    ├── IMPLEMENTATION_CHECKLIST.md
    ├── QUICK_START.md
    └── TROUBLESHOOTING.md
```

## Principais Componentes

### Smart Contracts

**GalaxyBayNFT.sol** - ERC721 com URI storage
- Mint de NFTs com metadata IPFS
- Auto-incremento de tokenId
- Ownership control

**Marketplace.sol** - Trading com escrow
- Listagem de NFTs para venda
- Compra com ETH
- Cancelamento de listagens
- ReentrancyGuard para segurança

### Backend Services

| Service | Função |
|---------|--------|
| AuthService | Autenticação Web3 (nonce + signature) |
| NftService | CRUD de NFTs + IPFS upload |
| PageService | Gerenciamento de páginas de criadores |
| IpfsService | Upload de metadata para IPFS |
| BlockchainService | Interação com contratos + events |

### Frontend Hooks

| Hook | Função |
|------|--------|
| useMetaMask | Conexão com wallet |
| useAuth | Autenticação + JWT |
| useMint | Mint de NFTs (IPFS + blockchain) |
| useMarketplace | Listagem, compra, cancelamento |
| useBlockchain | Queries on-chain (owner, URI, balance) |

## Fluxos Principais

### Mint de NFT

1. User faz upload da imagem (frontend)
2. Frontend envia para backend: `POST /api/nfts/generate-metadata`
3. Backend faz upload IPFS e retorna metadataUrl
4. Frontend chama `mintTo(address, metadataUrl)` no contrato
5. User aprova transação no MetaMask
6. Após confirmação, frontend registra no backend: `POST /api/nfts/register`
7. Backend salva NFT no database e cria activity log

### Listagem no Marketplace

1. User clica "List for Sale" e define preço
2. Frontend chama `approve(marketplace, tokenId)` no NFT contract
3. User aprova no MetaMask
4. Frontend chama `listItem(nftContract, tokenId, price)` no marketplace
5. NFT é transferido para marketplace (escrow)
6. Frontend atualiza status no backend: `PUT /api/nfts/:id`

### Compra de NFT

1. Buyer clica "Buy Now"
2. Frontend chama `buyItem(nftContract, tokenId) { value: price }`
3. Marketplace transfere ETH para seller
4. Marketplace transfere NFT para buyer
5. Frontend atualiza backend com nova transação

## Segurança

### Smart Contracts
- OpenZeppelin libraries (auditados)
- ReentrancyGuard em funções payable
- Access control (Ownable)
- Evita uso de `transfer()` (preferir `call()`)

### Backend
- Input validation (class-validator)
- JWT com expiração
- CORS configurado
- Helmet security headers
- Environment variables segregadas

### Frontend
- Validação com Zod
- Verificação de rede (Sepolia)
- Verificação de saldo antes de transações
- Nunca armazenar private keys
- HTTPS em produção

## Testing

### Contratos
```bash
cd contracts
npx hardhat test
npx hardhat coverage
```

### Backend
```bash
cd backend
npm run test
npm run test:cov
```

### Frontend
```bash
cd frontend
npm run test
```

## Deploy

### Contratos (Sepolia)
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia
npx hardhat verify --network sepolia <ADDRESS>
```

### Backend (Production)
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
```

## Próximos Passos

### Prioridade Alta
1. Implementar BlockchainService completo
2. Criar hooks de marketplace (listagem, compra)
3. Implementar event indexing
4. Adicionar royalties aos contratos (EIP-2981)

### Prioridade Média
5. Sistema de ofertas
6. Analytics dashboard
7. Filtros e busca avançada
8. Notificações

### Prioridade Baixa
9. Leilões
10. Lazy minting
11. Multi-chain support

Ver roadmap completo em [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)

## Recursos

### Documentação Externa
- [OpenZeppelin](https://docs.openzeppelin.com/contracts/)
- [ethers.js v6](https://docs.ethers.org/v6/)
- [NestJS](https://docs.nestjs.com/)
- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [IPFS](https://docs.ipfs.tech/)

### Ferramentas
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [NFT.Storage](https://nft.storage/)
- [Alchemy](https://www.alchemy.com/)
- [Hardhat](https://hardhat.org/)

### Comunidade
- GitHub Issues: [Galaxy-Bay/issues](https://github.com/yourusername/galaxy-bay/issues)
- Discord: [Link]
- Twitter: [@GalaxyBayNFT](https://twitter.com/galaxybaynft)

## Licença

MIT License - Ver LICENSE file para detalhes

## Equipe

- **Lead Developer:** [Nome]
- **Smart Contracts:** [Nome]
- **Frontend:** [Nome]
- **Backend:** [Nome]

## Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Status do Projeto

🟢 **Fase de Desenvolvimento Ativo**

- ✅ Contratos deployados
- ✅ Backend funcional
- ✅ Frontend funcional
- ✅ Autenticação Web3
- ✅ Mint de NFTs
- 🚧 Marketplace (em desenvolvimento)
- 🚧 Event indexing (em desenvolvimento)

---

**Última atualização:** Janeiro 2025
**Versão:** 1.0.0-beta

Para começar, veja [QUICK_START.md](./QUICK_START.md)
