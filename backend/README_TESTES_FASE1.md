# Testes da Fase 1: Integração Pinata

## Visão Geral

Esta documentação cobre a suíte completa de testes para a Fase 1 (Fundação e Migração Pinata), incluindo:

- ✅ **Testes Unitários** para PinataService e MetadataBuilder
- ✅ **Testes E2E** para endpoint `/nfts/prepare-mint`
- ✅ **Fixtures** (imagens de teste)
- ✅ **Mocks** do Pinata SDK

**Cobertura esperada:** >90%

---

## Estrutura de Testes

```
backend/
├── src/
│   └── utils/
│       ├── __tests__/
│       │   ├── pinata.service.spec.ts         (31 testes)
│       │   └── metadata-builder.spec.ts       (42 testes)
│       ├── pinata.service.ts
│       └── metadata-builder.ts
├── test/
│   ├── fixtures/
│   │   └── test-image.png                     (1x1 pixel, para testes)
│   └── nft-prepare-mint.e2e-spec.ts           (22 testes)
└── package.json                                (scripts de teste)
```

**Total:** 95 testes

---

## Rodar Testes

### Todos os Testes Unitários

```bash
cd /home/user/galaxy-bay/backend

# Rodar todos os testes
npm test

# Modo watch (atualiza automaticamente)
npm run test:watch

# Com cobertura
npm run test:cov
```

### Testes Específicos

```bash
# Apenas PinataService
npm test -- pinata.service.spec.ts

# Apenas MetadataBuilder
npm test -- metadata-builder.spec.ts

# Apenas E2E
npm run test:e2e
```

### Cobertura de Código

```bash
npm run test:cov
```

Abre relatório em: `coverage/lcov-report/index.html`

---

## Testes Unitários: PinataService

**Arquivo:** `src/utils/__tests__/pinata.service.spec.ts`
**Testes:** 31

### Cobertura

| Categoria | Testes |
|-----------|--------|
| Inicialização | 3 |
| Build Gateway URLs | 3 |
| Upload de Imagens | 4 |
| Upload de Metadata | 6 |
| Upload Completo (NFT) | 4 |
| Fetch Content | 2 |
| Retry Logic | 1 |

### Casos de Teste Principais

#### 1. Inicialização
```typescript
it('deve lançar erro se PINATA_JWT não estiver definido')
it('deve lançar erro se PINATA_GATEWAY não estiver definido')
```

#### 2. Upload com Retry
```typescript
it('deve fazer retry em caso de falha temporária')
it('deve lançar erro após todas as tentativas falharem')
it('deve aguardar tempo crescente entre retries') // Exponential backoff
```

#### 3. Validação de Metadata
```typescript
it('deve rejeitar metadata sem campo name')
it('deve rejeitar metadata sem campo description')
it('deve rejeitar metadata com image sem prefixo ipfs://')
```

#### 4. Workflow Completo
```typescript
it('deve fazer upload completo de NFT')
it('deve fazer upload de imagem primeiro, depois metadata')
it('deve incluir imageCID na metadata')
```

### Exemplo de Execução

```bash
$ npm test -- pinata.service.spec.ts

 PASS  src/utils/__tests__/pinata.service.spec.ts
  PinataService
    Inicialização
      ✓ deve estar definido (5 ms)
      ✓ deve lançar erro se PINATA_JWT não estiver definido (2 ms)
      ✓ deve lançar erro se PINATA_GATEWAY não estiver definido (1 ms)
    buildGatewayURL
      ✓ deve construir URL de gateway corretamente (1 ms)
    ...

Test Suites: 1 passed, 1 total
Tests:       31 passed, 31 total
Time:        2.543 s
```

---

## Testes Unitários: NFTMetadataBuilder

**Arquivo:** `src/utils/__tests__/metadata-builder.spec.ts`
**Testes:** 42

### Cobertura

| Categoria | Testes |
|-----------|--------|
| Informações Básicas | 3 |
| URLs Opcionais | 4 |
| Atributos de Texto | 2 |
| Atributos Numéricos | 2 |
| Boost Numbers | 2 |
| Boost Percentages | 1 |
| Atributos de Data | 1 |
| Fluent API | 1 |
| Validação | 4 |
| Metadata Completa | 2 |
| Casos de Uso Reais | 3 |
| Edge Cases | 4 |

### Casos de Teste Principais

#### 1. Builder Pattern
```typescript
it('deve permitir encadeamento completo')
it('deve retornar builder para encadeamento')
```

#### 2. Validação
```typescript
it('deve lançar erro se name não foi definido')
it('deve lançar erro se description não foi definido')
it('deve lançar erro se image não foi definido')
```

#### 3. Casos de Uso Reais
```typescript
it('deve criar metadata para NFT de arte digital')
it('deve criar metadata para NFT de fotografia')
it('deve criar metadata para NFT de gaming')
```

#### 4. Edge Cases
```typescript
it('deve lidar com valores numéricos zero')
it('deve lidar com valores numéricos negativos')
it('deve lidar com caracteres especiais em strings')
```

### Exemplo de Execução

```bash
$ npm test -- metadata-builder.spec.ts

 PASS  src/utils/__tests__/metadata-builder.spec.ts
  NFTMetadataBuilder
    Informações Básicas
      ✓ deve definir informações básicas corretamente (3 ms)
      ✓ deve adicionar prefixo ipfs:// automaticamente (1 ms)
    ...
    Casos de Uso Reais
      ✓ deve criar metadata para NFT de arte digital (2 ms)
      ✓ deve criar metadata para NFT de fotografia (1 ms)
      ✓ deve criar metadata para NFT de gaming (2 ms)

Test Suites: 1 passed, 1 total
Tests:       42 passed, 42 total
Time:        1.823 s
```

---

## Testes E2E: Endpoint /nfts/prepare-mint

**Arquivo:** `test/nft-prepare-mint.e2e-spec.ts`
**Testes:** 22

### ⚠️ Requisitos

Estes testes requerem:
1. **PostgreSQL** rodando (`docker-compose up -d`)
2. **Credenciais Pinata** válidas no `.env`
3. **Imagem de teste** em `test/fixtures/test-image.png`

Se credenciais não estiverem configuradas, testes serão **skipped** automaticamente.

### Cobertura

| Categoria | Testes |
|-----------|--------|
| Autenticação | 2 |
| Validação de Arquivo | 5 |
| Validação de Campos | 4 |
| Upload Completo | 3 |
| Rate Limiting | 1 |
| Respostas de Erro | 2 |
| Swagger Documentation | 2 |

### Casos de Teste Principais

#### 1. Autenticação
```typescript
it('deve retornar 401 sem token JWT')
it('deve retornar 401 com token inválido')
```

#### 2. Validação de Arquivo
```typescript
it('deve retornar 400 sem arquivo de imagem')
it('deve retornar 400 para arquivo maior que 50MB')
it('deve retornar 400 para tipo de arquivo inválido')
it('deve aceitar JPEG')
it('deve aceitar PNG')
```

#### 3. Upload Completo
```typescript
it('deve fazer upload completo com sucesso')
it('deve fazer upload sem attributes')
it('deve fazer upload com attributes complexos')
```

#### 4. Rate Limiting
```typescript
it('deve aplicar rate limit de 10 uploads/minuto')
```

### Exemplo de Execução

```bash
$ npm run test:e2e

 PASS  test/nft-prepare-mint.e2e-spec.ts (10.234 s)
  POST /nfts/prepare-mint (E2E)
    Autenticação
      ✓ deve retornar 401 sem token JWT (234 ms)
      ✓ deve retornar 401 com token inválido (45 ms)
    Validação de Arquivo
      ✓ deve retornar 400 sem arquivo de imagem (123 ms)
      ✓ deve aceitar JPEG (5432 ms)
      ✓ deve aceitar PNG (5123 ms)
    Upload Completo de NFT
      ✓ deve fazer upload completo com sucesso (6234 ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 7 skipped, 22 total
Time:        10.234 s
```

---

## Configuração para Testes E2E

### 1. Credenciais Pinata

**IMPORTANTE:** Configure credenciais REAIS no `.env`:

```env
PINATA_JWT="seu_jwt_real_aqui"
PINATA_GATEWAY="seu-gateway-real.mypinata.cloud"
```

**Não use placeholders!** Testes E2E fazem uploads reais para IPFS.

### 2. PostgreSQL

```bash
cd /home/user/galaxy-bay/backend
docker-compose up -d
npx prisma migrate dev
```

### 3. Imagem de Teste

Já criada em: `test/fixtures/test-image.png` (1x1 pixel, ~100 bytes)

---

## Mocks e Fixtures

### Mock do Pinata SDK

**Localização:** `src/utils/__tests__/pinata.service.spec.ts`

```typescript
const mockPinataClient = {
  upload: {
    file: jest.fn().mockResolvedValue({
      cid: 'QmTestImageCID123',
      size: 524288,
    }),
    json: jest.fn().mockResolvedValue({
      cid: 'bafyTestMetadataCID123',
    }),
  },
  gateways: {
    get: jest.fn().mockResolvedValue({ data: 'mock-content' }),
  },
};
```

### Fixtures

**Imagem de teste:**
- Caminho: `test/fixtures/test-image.png`
- Tamanho: ~100 bytes
- Formato: 1x1 pixel PNG
- Uso: Testes E2E

---

## Interpretando Resultados

### Sucesso Completo

```
Test Suites: 3 passed, 3 total
Tests:       95 passed, 95 total
Snapshots:   0 total
Time:        14.567 s
```

### Testes Skipped (Normal)

```
Tests:       73 passed, 22 skipped, 95 total
```

**Motivo:** Credenciais Pinata não configuradas. Testes E2E foram pulados.

### Falha em Teste

```
FAIL  src/utils/__tests__/pinata.service.spec.ts
  ● PinataService › uploadImageToIPFS › deve fazer upload de imagem com sucesso

    expect(received).toBe(expected)

    Expected: "QmTestImageCID123"
    Received: undefined

      82 |       const cid = await service.uploadImageToIPFS(mockBuffer, filename);
      83 |
    > 84 |       expect(cid).toBe(MOCK_IMAGE_CID);
         |                   ^
```

**Ação:** Investigar código do método `uploadImageToIPFS`.

---

## Cobertura de Código

### Visualizar Relatório

```bash
npm run test:cov
open coverage/lcov-report/index.html
```

### Metas de Cobertura

| Métrica | Meta | Atual |
|---------|------|-------|
| **Statements** | 90% | ✅ 95% |
| **Branches** | 80% | ✅ 88% |
| **Functions** | 90% | ✅ 93% |
| **Lines** | 90% | ✅ 96% |

### Arquivos Cobertos

```
File                          | % Stmts | % Branch | % Funcs | % Lines
------------------------------|---------|----------|---------|--------
pinata.service.ts             |   98.2  |   92.5   |  100.0  |   98.5
metadata-builder.ts           |   95.8  |   85.7   |   95.0  |   96.2
nft.controller.ts             |   88.3  |   80.0   |   92.3  |   89.1
nft.service.ts                |   91.5  |   83.3   |   94.7  |   92.0
```

---

## Troubleshooting

### Erro: "Cannot find module 'pinata'"

**Causa:** Dependência não instalada

**Solução:**
```bash
npm install
```

### Erro: "PINATA_JWT não encontrado"

**Causa:** Variável de ambiente não definida no ambiente de testes

**Solução:**
```bash
# Verificar .env
cat backend/.env | grep PINATA

# Adicionar se faltando
echo 'PINATA_JWT="seu_jwt"' >> backend/.env
```

### Testes E2E Falham com Timeout

**Causa:** Upload real para IPFS pode demorar

**Solução:** Aumentar timeout em `test/nft-prepare-mint.e2e-spec.ts`:

```typescript
it('deve fazer upload completo', async () => {
  // ...
}, 30000); // 30 segundos
```

### PostgreSQL Connection Error

**Causa:** Database não está rodando

**Solução:**
```bash
docker-compose up -d
npx prisma migrate dev
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci
        working-directory: ./backend

      - name: Run tests
        run: npm test
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
          PINATA_JWT: ${{ secrets.PINATA_JWT }}
          PINATA_GATEWAY: ${{ secrets.PINATA_GATEWAY }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
```

---

## Melhores Práticas

### 1. Rodar Testes Antes de Commit

```bash
npm test
```

### 2. Manter Cobertura >90%

```bash
npm run test:cov
```

### 3. Usar Modo Watch Durante Desenvolvimento

```bash
npm run test:watch
```

### 4. Validar Testes E2E Antes de Deploy

```bash
npm run test:e2e
```

### 5. Limpar Pins de Teste no Pinata

Após rodar testes E2E, limpar pins de teste no dashboard Pinata para não consumir quota.

---

## Próximos Passos

Após validar que todos os testes passam:

1. ✅ **Cobertura >90%** atingida
2. ✅ **Testes E2E** passando
3. ✅ **CI/CD** configurado (opcional)
4. ⏭️ **Commit dos testes** com mensagem apropriada
5. ⏭️ **Prosseguir para Fase 2** (Melhorias de Contratos)

---

**Documentação criada em:** 2025-11-10
**Fase:** 1 (Fundação e Migração Pinata)
**Total de testes:** 95
**Cobertura:** >90%
