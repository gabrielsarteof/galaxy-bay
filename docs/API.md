# 📡 API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.galaxy-bay.com/api
```

## Autenticação

A API usa JWT (JSON Web Tokens) com autenticação baseada em assinatura Web3.

### Flow de Autenticação

1. **Obter Nonce**
```http
POST /auth/nonce
Content-Type: application/json

{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}

Response:
{
  "nonce": "unique-random-nonce-string"
}
```

2. **Verificar Assinatura**
```http
POST /auth/verify
Content-Type: application/json

{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x..."
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "address": "0x...",
    "username": "creator123",
    "avatarUrl": "https://..."
  }
}
```

3. **Usar Token**
```http
GET /user/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Endpoints

### 🏥 Health & Monitoring

#### GET /health
Health check do sistema

```http
GET /health

Response: 200 OK
{
  "status": "ok",
  "timestamp": "2025-01-05T12:00:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "connected",
    "responseTime": 5
  },
  "blockchain": {
    "status": "connected",
    "blockNumber": 12345678
  }
}
```

#### GET /metrics
Métricas de performance

```http
GET /metrics

Response: 200 OK
{
  "uptime": 3600,
  "memory": {
    "rss": 123456789,
    "heapTotal": 98765432,
    "heapUsed": 87654321
  },
  "timestamp": "2025-01-05T12:00:00.000Z"
}
```

### 👤 Users

#### GET /user/me
Obter usuário atual

```http
GET /user/me
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "uuid",
  "address": "0x...",
  "username": "creator123",
  "avatarUrl": "https://...",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "page": {
    "id": "uuid",
    "name": "Creator Page",
    "slug": "creator123"
  }
}
```

#### PATCH /user/me
Atualizar perfil

```http
PATCH /user/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "new-username"
}

Response: 200 OK
{
  "id": "uuid",
  "address": "0x...",
  "username": "new-username",
  ...
}
```

### 📄 Pages

#### POST /pages
Criar página de criador

```http
POST /pages
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Creator Page",
  "slug": "my-page",
  "tagline": "Digital art creator",
  "description": "I create amazing NFTs",
  "status": "published",
  "category": "art",
  "tags": ["digital", "art", "nft"]
}

Response: 201 Created
{
  "id": "uuid",
  "name": "My Creator Page",
  "slug": "my-page",
  ...
}
```

#### GET /pages/:slug
Obter página por slug

```http
GET /pages/my-page

Response: 200 OK
{
  "id": "uuid",
  "name": "My Creator Page",
  "slug": "my-page",
  "tagline": "Digital art creator",
  "description": "I create amazing NFTs",
  "avatarUrl": "https://...",
  "bannerUrl": "https://...",
  "status": "published",
  "viewCount": 1234,
  "salesCount": 56,
  ...
}
```

#### PATCH /pages/:id
Atualizar página

```http
PATCH /pages/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "tagline": "Updated tagline",
  "description": "Updated description"
}

Response: 200 OK
{
  "id": "uuid",
  ...
}
```

#### POST /pages/:id/upload
Upload de avatar/banner

```http
POST /pages/{id}/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
  avatar: File
  banner: File

Response: 200 OK
{
  "avatarUrl": "https://...",
  "bannerUrl": "https://..."
}
```

#### GET /pages/:slug/stats
Estatísticas da página

```http
GET /pages/my-page/stats

Response: 200 OK
{
  "totalNfts": 100,
  "totalSold": 45,
  "totalHolders": 30,
  "totalVolume": 12.5,
  "floorPrice": 0.1,
  "featuredNfts": [...]
}
```

### 🎨 NFTs

#### POST /nft/generate-metadata
Gerar metadata e upload para IPFS

```http
POST /nft/generate-metadata
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Amazing NFT #1",
  "description": "This is an amazing NFT",
  "image": "ipfs://...",
  "attributes": [
    { "trait_type": "Background", "value": "Blue" },
    { "trait_type": "Eyes", "value": "Laser" }
  ]
}

Response: 200 OK
{
  "metadataUrl": "ipfs://Qm..."
}
```

#### POST /nft/register
Registrar NFT após mint

```http
POST /nft/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "tokenId": 123,
  "name": "Amazing NFT #1",
  "description": "This is an amazing NFT",
  "imageUrl": "ipfs://...",
  "metadataUrl": "ipfs://...",
  "pageId": "uuid",
  "collectionId": "uuid",
  "transactionHash": "0x...",
  "blockHash": "0x..."
}

Response: 201 Created
{
  "id": "uuid",
  "tokenId": "123",
  "name": "Amazing NFT #1",
  "status": "minted",
  ...
}
```

#### GET /nft/:id
Obter NFT por ID

```http
GET /nft/{id}

Response: 200 OK
{
  "id": "uuid",
  "tokenId": "123",
  "name": "Amazing NFT #1",
  "description": "...",
  "imageUrl": "ipfs://...",
  "metadataUrl": "ipfs://...",
  "price": "0.1",
  "status": "listed",
  "owner": {
    "id": "uuid",
    "username": "creator123",
    "address": "0x..."
  },
  "page": {
    "id": "uuid",
    "name": "Creator Page",
    "slug": "creator"
  },
  "collection": {
    "id": "uuid",
    "name": "Collection 1"
  },
  ...
}
```

#### GET /nft/page/:pageId
Listar NFTs de uma página

```http
GET /nft/page/{pageId}?status=listed&limit=20&offset=0

Query params:
  status: "minted" | "listed" | "sold"
  collectionId: string
  sortBy: "newest" | "oldest" | "price_low" | "price_high"
  limit: number (default: 20)
  offset: number (default: 0)

Response: 200 OK
[
  {
    "id": "uuid",
    "tokenId": "123",
    "name": "NFT #1",
    ...
  },
  ...
]
```

#### PATCH /nft/:id
Atualizar NFT (apenas owner)

```http
PATCH /nft/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "price": 0.2,
  "status": "listed"
}

Response: 200 OK
{
  "id": "uuid",
  ...
}
```

### 🏪 Marketplace

#### POST /marketplace/list
Listar NFT para venda

```http
POST /marketplace/list
Authorization: Bearer {token}
Content-Type: application/json

{
  "nftId": "uuid",
  "price": 0.1,
  "transactionHash": "0x..."
}

Response: 200 OK
{
  "id": "uuid",
  "status": "listed",
  "price": "0.1",
  "listedAt": "2025-01-05T12:00:00.000Z"
}
```

#### POST /marketplace/buy
Comprar NFT

```http
POST /marketplace/buy
Authorization: Bearer {token}
Content-Type: application/json

{
  "nftId": "uuid",
  "transactionHash": "0x..."
}

Response: 200 OK
{
  "id": "uuid",
  "status": "sold",
  "ownerId": "new-owner-uuid",
  ...
}
```

#### POST /marketplace/cancel
Cancelar listing

```http
POST /marketplace/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "nftId": "uuid",
  "transactionHash": "0x..."
}

Response: 200 OK
{
  "id": "uuid",
  "status": "minted",
  "price": null,
  ...
}
```

#### GET /marketplace/listings
Listar NFTs no marketplace

```http
GET /marketplace/listings?minPrice=0.1&maxPrice=1.0&limit=20&offset=0

Query params:
  pageId: string
  minPrice: number
  maxPrice: number
  limit: number (default: 20)
  offset: number (default: 0)

Response: 200 OK
{
  "nfts": [
    {
      "id": "uuid",
      "tokenId": "123",
      "name": "NFT #1",
      "price": "0.5",
      "owner": {...},
      "page": {...}
    },
    ...
  ],
  "total": 100
}
```

### 💼 Offers

#### POST /offers
Criar oferta

```http
POST /offers
Authorization: Bearer {token}
Content-Type: application/json

{
  "nftId": "uuid",
  "amount": 0.05,
  "expiration": "2025-01-10T00:00:00.000Z"
}

Response: 201 Created
{
  "id": "uuid",
  "nftId": "uuid",
  "bidderAddress": "0x...",
  "amount": "0.05",
  "expiration": "2025-01-10T00:00:00.000Z",
  "status": "active"
}
```

#### GET /offers/nft/:nftId
Listar ofertas de um NFT

```http
GET /offers/nft/{nftId}

Response: 200 OK
[
  {
    "id": "uuid",
    "bidderAddress": "0x...",
    "amount": "0.05",
    "expiration": "...",
    "status": "active"
  },
  ...
]
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Rate Limiting

- **Default**: 100 requisições por minuto por IP
- **Headers**:
  - `X-RateLimit-Limit`: Limite máximo
  - `X-RateLimit-Remaining`: Requisições restantes
  - `X-RateLimit-Reset`: Timestamp do reset

## Pagination

Endpoints que retornam listas suportam paginação:

```http
GET /endpoint?limit=20&offset=40

Response:
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "offset": 40,
    "total": 100,
    "hasMore": true
  }
}
```

## Swagger UI

Documentação interativa disponível em:
```
http://localhost:3000/api-docs
```

## Exemplos de Uso

### JavaScript/TypeScript

```typescript
const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('access_token');

// GET
const response = await fetch(`${API_URL}/user/me`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const user = await response.json();

// POST
const response = await fetch(`${API_URL}/nft/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    tokenId: 123,
    name: 'My NFT',
    ...
  })
});
```

### cURL

```bash
# GET com autenticação
curl -H "Authorization: Bearer ${TOKEN}" \
  http://localhost:3000/api/user/me

# POST com JSON
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"name":"My NFT","tokenId":123}' \
  http://localhost:3000/api/nft/register
```
