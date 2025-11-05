# Galaxy Bay

Plataforma NFT para criadores digitais com páginas personalizadas, sistema de mint integrado a IPFS, e marketplace descentralizado.

## Funcionalidades Principais

O projeto implementa um sistema completo de gerenciamento de NFTs:

- Páginas personalizadas para cada criador (slug único, customização visual)
- Mint de NFTs com upload automático de metadata para IPFS via NFT.Storage
- Marketplace com sistema de listing/compra on-chain
- Ofertas peer-to-peer em NFTs
- Dashboard com analytics de vendas e visualizações
- Autenticação via assinatura Web3 (MetaMask)

A plataforma roda atualmente na Sepolia testnet. A stack foi escolhida para garantir performance em queries de database (Prisma com indexes otimizados), bundle size reduzido no frontend (code splitting + lazy loading), e segurança adequada (Helmet, CSP, input sanitization, rate limiting).

## Estrutura

```
galaxy-bay/
├── backend/          # NestJS API + PostgreSQL
├── frontend/         # Next.js 14 App
├── contracts/        # Solidity contracts
├── docs/            # Documentação
└── storage/         # Uploads (não versionado)
```

## Stack

**Backend**: NestJS, Prisma, PostgreSQL, Ethers.js, JWT, Sharp, Helmet

**Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, React Query, Ethers.js, Zod

**Blockchain**: Solidity, Hardhat, Sepolia testnet

**Storage**: PostgreSQL (dados estruturados), IPFS/NFT.Storage (metadata e imagens), Local/S3 (uploads temporários)

## Setup Local

Requisitos: Node.js 18+, PostgreSQL 14+, NFT.Storage API key, Alchemy/Infura RPC endpoint.

```bash
# Clone
git clone https://github.com/seu-usuario/galaxy-bay.git
cd galaxy-bay

# Backend
cd backend
npm install
cp .env.example .env  # Configure DATABASE_URL, JWT_SECRET, etc
npx prisma migrate dev
npm run start:dev     # Roda em localhost:3000

# Frontend (nova janela)
cd frontend
npm install
cp .env.example .env.local  # Configure NEXT_PUBLIC_API_URL, contract addresses
npm run dev           # Roda em localhost:3001

# Contracts (se necessário deploy)
cd contracts
npm install
cp .env.example .env  # Configure PRIVATE_KEY
npx hardhat run scripts/deploy.js --network sepolia
```

Ver `docs/QUICK_START.md` para instruções detalhadas.

## Documentação

- [API Reference](./docs/API.md) - Endpoints REST completos
- [Architecture](./docs/ARCHITECTURE.md) - Decisões técnicas e fluxos
- [Deployment](./docs/DEPLOYMENT.md) - Processo de deploy para produção
- [Contributing](./CONTRIBUTING.md) - Guia para contribuidores

## Segurança

O projeto implementa múltiplas camadas de segurança: input sanitization em todos os endpoints (previne XSS/injection), rate limiting (100 req/min por IP), CORS restrito ao domínio do frontend, CSP headers via Helmet, e JWT com expiração configurável. Contratos foram testados extensivamente mas ainda não passaram por auditoria formal.

## Testes

```bash
cd backend && npm test        # Unit tests
cd backend && npm run test:e2e # E2E tests
cd contracts && npx hardhat test # Contract tests
```

## Status

Projeto em fase de desenvolvimento ativo. Fases concluídas: contratos base (ERC721 + Marketplace), integração blockchain no backend, features de mint/listing no frontend, sistema de ofertas, e hardening de segurança. Próximos passos incluem testes mais abrangentes e deploy em staging.

## License

MIT License - ver [LICENSE](./LICENSE)

## Contribuições

Aceito pull requests. Leia [CONTRIBUTING.md](./CONTRIBUTING.md) para entender o workflow e padrões de código.
