# 🏗️ Arquitetura do Sistema

## Visão Geral

Galaxy Bay é uma plataforma NFT fullstack com arquitetura em três camadas:

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   UI     │  │  Hooks   │  │  Web3    │  │  State   │  │
│  │Components│◄─┤ (React   │◄─┤ (ethers) │◄─┤ (React   │  │
│  │          │  │  Query)  │  │          │  │  Query)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (NestJS)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   API    │  │ Services │  │Blockchain│  │  Prisma  │  │
│  │Controllers◄─┤          │◄─┤  Service │◄─┤   ORM    │  │
│  │          │  │          │  │ (ethers) │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  └────┬─────┘  │
└───────────────────────────────────────────────────┼─────────┘
                         │                          │
                         ▼                          ▼
         ┌───────────────────────┐      ┌──────────────────┐
         │   Blockchain Layer    │      │   PostgreSQL     │
         │  ┌─────────────────┐ │      │   Database       │
         │  │ GalaxyBayNFT    │ │      │                  │
         │  │ (ERC721)        │ │      │ - Users          │
         │  ├─────────────────┤ │      │ - Pages          │
         │  │ Marketplace     │ │      │ - NFTs           │
         │  │ (Buy/Sell)      │ │      │ - Transactions   │
         │  └─────────────────┘ │      │ - Activities     │
         └───────────────────────┘      └──────────────────┘
                  │
                  ▼
         ┌───────────────────────┐
         │   IPFS (NFT.Storage)  │
         │   - Metadata          │
         │   - Images            │
         └───────────────────────┘
```

## Camadas da Aplicação

### 1. Frontend Layer (Next.js 14)

**Responsabilidades:**
- Interface do usuário
- Gestão de estado client-side
- Integração com carteiras Web3
- Comunicação com backend via REST API
- Otimização de assets e performance

**Tecnologias:**
- Next.js 14 (App Router)
- React 19
- TypeScript
- TailwindCSS
- React Query (cache e state)
- Ethers.js (Web3)
- Zod (validação)

**Estrutura:**
```
frontend/src/
├── app/              # Pages (App Router)
├── components/       # React components
├── hooks/            # Custom hooks
├── services/         # API clients
├── utils/            # Helpers
└── types/            # TypeScript types
```

### 2. Backend Layer (NestJS)

**Responsabilidades:**
- API REST
- Autenticação JWT
- Integração blockchain
- Indexação de eventos on-chain
- Upload e otimização de imagens
- Validação de dados
- Rate limiting e segurança

**Tecnologias:**
- NestJS
- Prisma ORM
- PostgreSQL
- Ethers.js
- JWT/Passport
- Sharp (image processing)
- Helmet (security)

**Estrutura:**
```
backend/src/
├── auth/             # Autenticação JWT
├── user/             # Gestão de usuários
├── pages/            # Páginas de criadores
├── nft/              # NFTs e metadata
├── marketplace/      # Compra/venda
├── blockchain/       # Indexer de eventos
├── common/           # Guards, pipes, interceptors
└── utils/            # Blockchain service, IPFS
```

**Padrões:**
- Repository pattern (Prisma)
- Service layer
- DTO validation
- Guards para autenticação
- Interceptors para logging
- Exception filters

### 3. Blockchain Layer

**Smart Contracts:**

#### GalaxyBayNFT (ERC721)
```solidity
- mintTo(address, tokenURI) → tokenId
- Eventos: Transfer, NFTMinted
```

#### Marketplace
```solidity
- listItem(nftAddress, tokenId, price)
- buyItem(nftAddress, tokenId)
- cancelListing(nftAddress, tokenId)
- Eventos: ItemListed, ItemSold, ListingCanceled
```

**Rede:**
- Sepolia Testnet (development)
- Mainnet (production - futuro)

### 4. Storage Layer

**PostgreSQL:**
- Dados estruturados
- Relacionamentos
- Índices otimizados
- Transações ACID

**IPFS (NFT.Storage):**
- Metadata JSON
- Imagens dos NFTs
- Descentralizado e permanente

**Local/S3:**
- Avatares de usuários
- Banners de páginas
- Assets temporários

## Fluxos Principais

### 1. Autenticação Web3

```
1. User → Frontend: Conecta MetaMask
2. Frontend → Backend: POST /auth/nonce (address)
3. Backend → Frontend: { nonce }
4. Frontend: User assina mensagem com nonce
5. Frontend → Backend: POST /auth/verify { address, signature }
6. Backend: Verifica assinatura
7. Backend → Frontend: { access_token, user }
8. Frontend: Armazena token, faz requisições com Bearer
```

### 2. Mint de NFT

```
1. User → Frontend: Upload imagem + metadata
2. Frontend: Comprime imagem (browser-image-compression)
3. Frontend → Backend: POST /nft/generate-metadata
4. Backend → IPFS: Upload metadata
5. Backend → Frontend: { metadataUrl }
6. Frontend → Blockchain: contract.mintTo(address, metadataUrl)
7. Blockchain → Frontend: { transactionHash, tokenId }
8. Frontend → Backend: POST /nft/register
9. Backend: Verifica transação on-chain
10. Backend → Database: Cria registro NFT
11. Backend → Frontend: { nft }
```

### 3. Marketplace - Listar NFT

```
1. Frontend → Blockchain: nft.approve(marketplace, tokenId)
2. Frontend → Blockchain: marketplace.listItem(nft, tokenId, price)
3. Blockchain → Frontend: { transactionHash }
4. Frontend → Backend: POST /marketplace/list
5. Backend: Verifica transação + listing on-chain
6. Backend → Database: Atualiza NFT (status: listed)
7. Backend → Frontend: { success }
```

### 4. Indexer de Eventos

```
┌─────────────────────────────────────────────┐
│         Indexer Service (NestJS)            │
├─────────────────────────────────────────────┤
│  @Cron('*/10 * * * *')                     │
│  async syncEvents()                         │
│    ↓                                        │
│  1. Get last synced block                   │
│  2. Query blockchain events (from..to)      │
│  3. Process each event:                     │
│     - Transfer → Update NFT owner           │
│     - ItemListed → Update NFT status        │
│     - ItemSold → Create transaction         │
│  4. Save to ContractEvent table             │
│  5. Update lastSyncedBlock                  │
└─────────────────────────────────────────────┘
```

## Segurança

### Backend
- **Helmet**: Security headers (CSP, HSTS, etc)
- **CORS**: Origens específicas permitidas
- **Rate Limiting**: 100 req/min por IP
- **Input Sanitization**: Pipe para prevenir XSS
- **JWT**: Tokens com expiração
- **Validation**: class-validator em todos os DTOs

### Frontend
- **CSP**: Content Security Policy configurado
- **Input Validation**: Zod schemas
- **Error Boundaries**: Captura erros React
- **XSS Prevention**: Sanitização de inputs

### Blockchain
- **Signature Verification**: Apenas owner pode fazer ações
- **On-chain Validation**: Backend verifica transações antes de atualizar DB
- **Private Keys**: Nunca expostas, apenas no deploy

## Performance

### Backend
- **Database Indexes**: Otimizados para queries comuns
- **Query Optimization**: Select específico, evita N+1
- **Image Optimization**: Sharp para WebP/AVIF
- **Caching**: Headers apropriados

### Frontend
- **Code Splitting**: Lazy loading de componentes
- **Image Optimization**: Next.js Image com múltiplos tamanhos
- **Bundle Size**: Tree shaking, imports otimizados
- **React Query**: Cache inteligente de dados

### Blockchain
- **Batch Reads**: Multicall quando possível
- **Event Indexing**: Evita polling, usa eventos
- **Gas Optimization**: Contratos otimizados

## Observabilidade

### Logs
- Structured logging (NestJS Logger)
- Request/Response logging
- Error tracking (preparado para Sentry)

### Metrics
- Health checks (`/health`, `/metrics`)
- Performance monitoring
- Query performance tracking

### Monitoring
- Database connection pool
- Blockchain RPC status
- API response times

## Escalabilidade

**Horizontal:**
- Backend: Stateless, pode escalar horizontalmente
- Database: PostgreSQL replication
- Storage: S3 ou CDN

**Vertical:**
- Otimização de queries
- Cache layers (Redis - futuro)
- CDN para assets

## Dependências Externas

| Serviço | Propósito | Alternativas |
|---------|-----------|--------------|
| Alchemy/Infura | RPC Ethereum | QuickNode, Ankr |
| NFT.Storage | IPFS pinning | Pinata, Web3.Storage |
| PostgreSQL | Database | MySQL, MongoDB |
| Vercel/Railway | Hosting | AWS, GCP, DigitalOcean |

## Diagramas de Sequência

### Compra de NFT

```
User        Frontend    Backend     Blockchain    Database
 │              │           │            │            │
 │─Click Buy──▶│           │            │            │
 │              │──Check───▶│            │            │
 │              │  price    │            │            │
 │              │◀──────────│            │            │
 │              │           │            │            │
 │              │──────buyItem────────▶│            │
 │              │   (send ETH)          │            │
 │              │◀──────Receipt─────────│            │
 │              │                       │            │
 │              │──POST────▶│           │            │
 │              │ /buy {tx} │──Verify──▶│            │
 │              │           │◀──────────│            │
 │              │           │─Update────────────────▶│
 │              │           │   NFT                  │
 │              │◀─Success──│                        │
 │◀───NFT──────│           │                        │
```

## Considerações Futuras

- [ ] Layer 2 (Polygon, Arbitrum) para reduzir gas
- [ ] GraphQL API para queries complexas
- [ ] WebSocket para updates real-time
- [ ] Redis para caching distribuído
- [ ] Microservices para módulos específicos
- [ ] Event sourcing para histórico completo
