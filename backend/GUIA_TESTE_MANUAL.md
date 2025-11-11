# Guia de Teste Manual - Endpoint /nfts/prepare-mint

## Pré-requisitos

### 1. Configurar Credenciais Pinata

Edite `/home/user/galaxy-bay/backend/.env`:

```env
PINATA_JWT="SEU_JWT_REAL_AQUI"
PINATA_GATEWAY="seu-gateway-real.mypinata.cloud"
```

**Como obter:**
1. Acesse https://app.pinata.cloud/
2. Crie conta (free tier: 1GB storage)
3. Dashboard → API Keys → "New Key"
4. Copie o JWT
5. Dashboard → Gateways → Copie o domínio

### 2. Iniciar Backend

```bash
cd /home/user/galaxy-bay/backend

# Instalar dependências (se ainda não fez)
npm install

# Iniciar PostgreSQL (se não estiver rodando)
docker-compose up -d

# Rodar migrations
npx prisma migrate dev

# Iniciar servidor em modo development
npm run start:dev
```

Aguarde ver no console:

```
[PinataService] PinataService inicializado com gateway dedicado
[NestApplication] Nest application successfully started
```

---

## Teste via Swagger UI

### Passo 1: Acessar Swagger

Abra no navegador:

```
http://localhost:3000/api-docs
```

### Passo 2: Fazer Login (obter JWT)

1. Localize o endpoint `POST /auth/login`
2. Clique em "Try it out"
3. Preencha (ajustar conforme sua implementação):

```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "..."
}
```

4. Execute
5. **Copie o `access_token`** da resposta

### Passo 3: Autorizar no Swagger

1. Clique no botão **"Authorize"** (🔓 cadeado no topo)
2. Cole o `access_token` no campo "Value"
3. Formato: apenas o token, SEM "Bearer "
4. Clique em "Authorize"
5. Feche o modal

### Passo 4: Testar Upload de NFT

1. Localize `POST /nfts/prepare-mint`
2. Clique em "Try it out"
3. Preencha:

**image** (arquivo):
- Clique em "Choose File"
- Selecione uma imagem JPEG/PNG/WebP (max 50MB)
- Recomendado: imagem de teste pequena (~1-5MB)

**name** (string):
```
Sunset at Galaxy Bay #1
```

**description** (string):
```
A stunning photograph captured at golden hour on the beach
```

**attributes** (string, opcional):
```json
[
  {"trait_type": "Artist", "value": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"},
  {"trait_type": "Location", "value": "Galaxy Bay"},
  {"trait_type": "Camera", "value": "Canon EOS R5"}
]
```

4. Clique em "Execute"
5. Aguarde (pode demorar 5-10 segundos)

### Passo 5: Validar Resposta

**Status esperado:** `201 Created`

**Resposta esperada:**

```json
{
  "success": true,
  "data": {
    "imageCID": "QmVLwvmGehsrNEvhcCnnsw5RQNseohgEkFNN1848zNzdng",
    "metadataCID": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    "tokenURI": "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    "imageUrl": "https://seu-gateway.mypinata.cloud/ipfs/QmVLwvmGehsrNEvhcCnnsw5RQNseohgEkFNN1848zNzdng",
    "metadataUrl": "https://seu-gateway.mypinata.cloud/ipfs/bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
  },
  "message": "NFT preparado com sucesso. Use tokenURI no mint on-chain."
}
```

### Passo 6: Validar no Pinata

1. Acesse https://app.pinata.cloud/
2. Vá para **Files** → **Pin Explorer**
3. Você deve ver 2 novos pins:
   - Imagem JPEG otimizada
   - Metadata JSON

### Passo 7: Validar Gateway

Copie `imageUrl` da resposta e abra no navegador:

```
https://seu-gateway.mypinata.cloud/ipfs/QmVLwvmGehsrNEvhcCnnsw5RQNseohgEkFNN1848zNzdng
```

Você deve ver a imagem otimizada carregada.

---

## Teste via cURL

### Preparação

```bash
# 1. Fazer login e obter token
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "signature": "..."
  }' | jq -r '.access_token')

echo "Token: $TOKEN"
```

### Upload de NFT

```bash
curl -X POST http://localhost:3000/nfts/prepare-mint \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/your/image.jpg" \
  -F "name=Test NFT via cURL" \
  -F "description=Testing upload via command line" \
  -F 'attributes=[{"trait_type":"Method","value":"cURL"}]'
```

### Upload com jq para formatar resposta

```bash
curl -X POST http://localhost:3000/nfts/prepare-mint \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/your/image.jpg" \
  -F "name=Test NFT" \
  -F "description=Testing" | jq '.'
```

---

## Teste via Postman

### 1. Importar Collection

Crie uma nova request:

**Método:** POST
**URL:** `http://localhost:3000/nfts/prepare-mint`

### 2. Configurar Headers

```
Authorization: Bearer SEU_ACCESS_TOKEN_AQUI
```

### 3. Configurar Body

Selecione **form-data** e adicione:

| KEY | TYPE | VALUE |
|-----|------|-------|
| image | File | (escolha arquivo) |
| name | Text | "Test NFT via Postman" |
| description | Text | "Testing upload" |
| attributes | Text | `[{"trait_type":"Tool","value":"Postman"}]` |

### 4. Enviar Request

Clique em "Send" e valide a resposta.

---

## Validação de Erros

### Teste 1: Sem Autenticação

```bash
curl -X POST http://localhost:3000/nfts/prepare-mint \
  -F "image=@image.jpg"
```

**Esperado:** `401 Unauthorized`

### Teste 2: Sem Imagem

```bash
curl -X POST http://localhost:3000/nfts/prepare-mint \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Test" \
  -F "description=Test"
```

**Esperado:** `400 Bad Request` - "image file is required"

### Teste 3: Arquivo Muito Grande

```bash
# Criar arquivo de 51MB
dd if=/dev/zero of=large.jpg bs=1M count=51

curl -X POST http://localhost:3000/nfts/prepare-mint \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@large.jpg" \
  -F "name=Test" \
  -F "description=Test"
```

**Esperado:** `400 Bad Request` - "File size must be less than 50MB"

### Teste 4: Tipo de Arquivo Inválido

```bash
echo "not an image" > file.txt

curl -X POST http://localhost:3000/nfts/prepare-mint \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@file.txt" \
  -F "name=Test" \
  -F "description=Test"
```

**Esperado:** `400 Bad Request` - "Only JPEG, PNG, and WebP images are allowed"

### Teste 5: Attributes Inválido

```bash
curl -X POST http://localhost:3000/nfts/prepare-mint \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@image.jpg" \
  -F "name=Test" \
  -F "description=Test" \
  -F "attributes=not-valid-json"
```

**Esperado:** `400 Bad Request` - "Invalid attributes JSON"

---

## Monitoramento de Logs

Enquanto testa, observe os logs do backend:

```bash
# Terminal onde o servidor está rodando
npm run start:dev
```

**Logs esperados (sucesso):**

```
[PinataService] Iniciando upload completo de NFT: Test NFT
[PinataService] Otimizando imagem Test NFT.jpg: max 2000x2000, quality 85%
[PinataService] Imagem otimizada: 2048KB → 512KB (75% economia)
[PinataService] Imagem enviada para IPFS: Test NFT.jpg → CID=Qm... (524288 bytes)
[PinataService] Metadata enviada para IPFS: Test NFT → CID=bafy...
[PinataService] Upload completo de NFT finalizado: Test NFT → tokenURI=ipfs://bafy...
[NftService] NFT preparado com sucesso: Test NFT → tokenURI=ipfs://bafy...
```

**Logs esperados (retry):**

```
[PinataService] Upload de imagem test.jpg falhou (tentativa 1/3): Network error
[PinataService] Aguardando 1000ms antes de retry...
[PinataService] Imagem enviada para IPFS: test.jpg → CID=Qm...
```

---

## Troubleshooting

### Erro: "PINATA_JWT não encontrado"

**Causa:** Variável de ambiente não configurada

**Solução:**
1. Edite `/home/user/galaxy-bay/backend/.env`
2. Adicione `PINATA_JWT="seu_jwt_aqui"`
3. Reinicie o servidor

### Erro: "401 Unauthorized"

**Causa:** Token JWT inválido ou expirado

**Solução:**
1. Faça login novamente via `POST /auth/login`
2. Obtenha novo `access_token`
3. Use no header `Authorization: Bearer TOKEN`

### Erro: "Falha ao comunicar com IPFS após 3 tentativas"

**Causa:** Rede IPFS instável ou credenciais Pinata inválidas

**Solução:**
1. Verifique se PINATA_JWT está correto
2. Teste credenciais no dashboard Pinata
3. Aguarde alguns minutos e tente novamente
4. Verifique conexão de internet

### Servidor não inicia

**Causa:** PostgreSQL não está rodando ou porta 3000 ocupada

**Solução:**
```bash
# Verificar PostgreSQL
docker-compose ps

# Iniciar PostgreSQL
docker-compose up -d

# Verificar porta
lsof -i :3000

# Matar processo na porta 3000 (se necessário)
kill -9 $(lsof -t -i:3000)
```

---

## Próximos Passos

Após validar que o endpoint funciona:

1. ✅ Upload de imagem está otimizado
2. ✅ Metadata está OpenSea-compatible
3. ✅ CIDs são válidos e acessíveis
4. ⏭️ Integrar frontend com este endpoint
5. ⏭️ Implementar mint on-chain usando `tokenURI` retornado
6. ⏭️ Registrar NFT no banco após mint bem-sucedido

---

**Documentação criada em:** 2025-11-10
**Endpoint:** `POST /nfts/prepare-mint`
**Versão da API:** v1.0
