# Setup Pinata para Galaxy Bay NFT Platform

## Visão Geral

Este documento fornece instruções passo a passo para configurar o Pinata como provedor de storage IPFS para a plataforma Galaxy Bay.

**Por quê Pinata?**
- NFT.Storage foi descontinuado em junho/2024
- Gateway dedicado oferece performance 10x superior
- Retry logic automático com exponential backoff
- Otimização de imagens on-the-fly
- 99.9% uptime SLA

---

## 1. Criar Conta Pinata

### 1.1 Registro

1. Acesse https://app.pinata.cloud/
2. Clique em "Sign Up"
3. Preencha:
   - Email
   - Senha forte
   - Nome da organização (ex: "Galaxy Bay")
4. Verifique seu email

### 1.2 Planos Disponíveis (Novembro 2024)

| Plano | Storage | Bandwidth | Requests | Preço |
|-------|---------|-----------|----------|-------|
| **Free** | 1 GB | 100 GB/mês | 10K/mês | $0 |
| **Picnic** | 1 TB | 500 GB/mês | 1M/mês | $20/mês |
| **Fiesta** | 5 TB | 2.5 TB/mês | 5M/mês | $100/mês |

**Recomendação:**
- **Desenvolvimento/Testes:** Free Plan (suficiente para começar)
- **Produção Inicial:** Picnic Plan ($20/mês)
- **Produção em Escala:** Fiesta Plan ($100/mês)

---

## 2. Obter Credenciais

### 2.1 Gerar API Key (JWT)

1. Login no dashboard Pinata
2. Navegue para **Developers** → **API Keys**
3. Clique em **"New Key"**
4. Configure permissões:
   - ✅ `pinFileToIPFS` (Upload de arquivos)
   - ✅ `pinJSONToIPFS` (Upload de JSON/metadata)
   - ✅ `pinList` (Listar pins)
   - ❌ `unpin` (Não necessário para produção)
   - ❌ `userPinPolicy` (Não necessário)
5. Nomeie a key: **"Galaxy Bay Production"**
6. Clique em **"Generate Key"**
7. **IMPORTANTE:** Copie o JWT **imediatamente**
   - Formato: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Você não poderá ver novamente!**
   - Guarde em um password manager (1Password, LastPass, etc)

### 2.2 Obter Gateway Dedicado

1. No dashboard Pinata, navegue para **Gateways**
2. Você verá um gateway dedicado já criado automaticamente
3. Copie o domínio:
   - Formato: `seu-usuario-xyz.mypinata.cloud`
   - Exemplo: `galaxy-bay-abc123.mypinata.cloud`

**Vantagens do Gateway Dedicado:**
- ✅ 10x mais rápido que gateways públicos
- ✅ CDN global
- ✅ Apenas serve seus CIDs (segurança)
- ✅ Custom domain (opcional, configurável depois)

---

## 3. Configurar Backend

### 3.1 Adicionar Variáveis de Ambiente

Edite o arquivo `/home/user/galaxy-bay/backend/.env`:

```env
# ==================================================
# IPFS / PINATA STORAGE
# ==================================================
PINATA_JWT="SEU_JWT_AQUI"
PINATA_GATEWAY="seu-gateway.mypinata.cloud"
```

**⚠️ ATENÇÃO:**
- Substitua `SEU_JWT_AQUI` pelo JWT copiado no passo 2.1
- Substitua `seu-gateway.mypinata.cloud` pelo gateway do passo 2.2
- **NUNCA** commite este arquivo! (já está em `.gitignore`)

### 3.2 Verificar Instalação

As dependências já foram instaladas. Verifique:

```bash
cd /home/user/galaxy-bay/backend
npm list pinata
# Deve mostrar: pinata@2.5.1 (ou superior)
```

Se não estiver instalado:

```bash
npm install pinata
```

---

## 4. Testar Integração

### 4.1 Iniciar Servidor Backend

```bash
cd /home/user/galaxy-bay/backend
npm run start:dev
```

Você deve ver no log:

```
[PinataService] PinataService inicializado com gateway dedicado
```

**Se ver erro:**
```
Error: PINATA_JWT não encontrado em variáveis de ambiente
```

→ Verifique se o `.env` está configurado corretamente.

### 4.2 Testar Upload (via Swagger)

1. Acesse http://localhost:3000/api-docs
2. Faça login para obter JWT:
   - POST `/auth/login`
   - Copie o `access_token`
3. Clique em **"Authorize"** e cole o token
4. Teste o endpoint:
   - POST `/nfts/prepare-mint`
   - Upload uma imagem teste
   - Preencha `name` e `description`
   - Envie

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

### 4.3 Validar Upload no Pinata

1. Acesse dashboard Pinata
2. Navegue para **Files** → **Pin Explorer**
3. Você deve ver 2 novos pins:
   - Imagem (JPEG otimizado)
   - Metadata (JSON)

### 4.4 Validar Gateway

Abra no navegador:

```
https://seu-gateway.mypinata.cloud/ipfs/QmVLwvmGehsrNEvhcCnnsw5RQNseohgEkFNN1848zNzdng
```

Você deve ver a imagem carregada.

---

## 5. Features Implementadas

### 5.1 PinataService

**Localização:** `/backend/src/utils/pinata.service.ts`

**Funcionalidades:**
- ✅ Upload de imagens com otimização automática (Sharp)
- ✅ Upload de metadata OpenSea-compatible
- ✅ Retry logic com exponential backoff (3 tentativas)
- ✅ Validação de metadata antes do upload
- ✅ Geração de URLs de gateway dedicado
- ✅ Otimização de imagens on-the-fly (query params)

**Métodos principais:**

```typescript
// Upload completo (imagem + metadata)
await pinataService.uploadCompleteNFT(
  imageBuffer,
  'My NFT Name',
  'Description',
  [{ trait_type: 'Artist', value: '0x123...' }]
);

// Upload apenas imagem
await pinataService.uploadImageToIPFS(buffer, 'image.jpg');

// Upload apenas metadata
await pinataService.uploadMetadataToIPFS(metadata);

// Construir URL otimizada
pinataService.buildOptimizedImageURL(cid, 300, 300, 80);
// → https://gateway.../ipfs/Qm...?img-width=300&img-height=300&img-quality=80
```

### 5.2 NFTMetadataBuilder

**Localização:** `/backend/src/utils/metadata-builder.ts`

**Exemplo de uso:**

```typescript
import { NFTMetadataBuilder } from 'src/utils/metadata-builder';

const metadata = new NFTMetadataBuilder()
  .setBasicInfo('My NFT', 'Description', imageCID)
  .setExternalURL('https://galaxybay.io/nft/1')
  .setBackgroundColor('#1a1a2e')
  .addTextAttribute('Artist', '0x123...')
  .addNumericAttribute('Generation', 1)
  .addBoostNumber('Power', 85, 100)
  .addDateAttribute('Created', Math.floor(Date.now() / 1000))
  .build();
```

### 5.3 Endpoint de Upload

**Endpoint:** `POST /nfts/prepare-mint`

**Autenticação:** JWT obrigatório

**Rate Limiting:** 10 uploads/minuto por usuário

**Validações:**
- Tamanho máximo: 50MB
- Formatos aceitos: JPEG, PNG, WebP
- Campos obrigatórios: `image`, `name`, `description`

**Request (multipart/form-data):**

```
image: [file]
name: "Sunset at Galaxy Bay"
description: "A stunning photograph"
attributes: '[{"trait_type":"Location","value":"Galaxy Bay"}]'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "imageCID": "Qm...",
    "metadataCID": "bafy...",
    "tokenURI": "ipfs://bafy...",
    "imageUrl": "https://...",
    "metadataUrl": "https://..."
  }
}
```

---

## 6. Otimização de Imagens

### 6.1 Processo Automático

Todas as imagens são otimizadas automaticamente:

1. **Resize:** Max 2000x2000 (proporcional)
2. **Conversão:** JPEG quality 85%
3. **Economia:** Típica de 60-80% do tamanho original

**Logs de exemplo:**

```
[PinataService] Otimizando imagem my-nft.jpg: max 2000x2000, quality 85%
[PinataService] Imagem otimizada: 5120KB → 980KB (81% economia)
[PinataService] Imagem enviada para IPFS: my-nft.jpg → CID=Qm... (1003520 bytes)
```

### 6.2 Otimização On-the-Fly

Use query params para obter versões otimizadas sem re-upload:

```typescript
// Thumbnail 300x300
const thumbnail = pinataService.buildOptimizedImageURL(cid, 300, 300, 80);

// Preview 800x800
const preview = pinataService.buildOptimizedImageURL(cid, 800, 800, 85);

// Full size
const fullSize = pinataService.buildGatewayURL(cid);
```

---

## 7. Tratamento de Erros

### 7.1 Retry Logic

Falhas de rede IPFS são comuns mas transitórias. O PinataService implementa retry automático:

**Estratégia:**
- Tentativa 1: Imediata
- Tentativa 2: Após 1s
- Tentativa 3: Após 2s
- Tentativa 4: Após 4s

**Logs de exemplo:**

```
[PinataService] Upload de imagem my-nft.jpg falhou (tentativa 1/3): Network error
[PinataService] Aguardando 1000ms antes de retry...
[PinataService] Imagem enviada para IPFS: my-nft.jpg → CID=Qm...
```

### 7.2 Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `PINATA_JWT não encontrado` | .env não configurado | Configure PINATA_JWT no .env |
| `401 Unauthorized` | JWT inválido ou expirado | Gere novo JWT no dashboard Pinata |
| `429 Too Many Requests` | Rate limit excedido | Aguarde 1 minuto ou upgrade de plano |
| `Falha ao comunicar com IPFS após 3 tentativas` | IPFS instável | Tente novamente em alguns minutos |
| `Metadata inválida: campo "image" deve usar ipfs://` | Formato incorreto | Use `ipfs://CID` não `https://...` |

---

## 8. Monitoramento

### 8.1 Dashboard Pinata

Acesse https://app.pinata.cloud/ para monitorar:

- **Files:** Todos os pins (imagens + metadata)
- **Bandwidth:** Consumo de banda mensal
- **Requests:** Número de requests por dia
- **Gateway:** Performance do gateway dedicado

### 8.2 Logs do Backend

O PinataService loga todas as operações:

```typescript
// Sucesso
[PinataService] Iniciando upload completo de NFT: My NFT
[PinataService] Imagem otimizada: 2048KB → 512KB (75% economia)
[PinataService] Imagem enviada para IPFS: My NFT.jpg → CID=Qm... (524288 bytes)
[PinataService] Metadata enviada para IPFS: My NFT → CID=bafy...
[PinataService] Upload completo de NFT finalizado: My NFT → tokenURI=ipfs://bafy...

// Retry
[PinataService] Upload de imagem my-nft.jpg falhou (tentativa 1/3): ECONNRESET
[PinataService] Aguardando 1000ms antes de retry...

// Erro após retries
[PinataService] Upload de imagem my-nft.jpg falhou após 3 tentativas: Network timeout
```

---

## 9. Segurança

### 9.1 Proteção de API Keys

**✅ FAÇA:**
- Armazene JWT em `.env` (nunca commite)
- Use gateway dedicado (apenas seus CIDs)
- Rate limiting no backend (10 uploads/min)
- Validação de tipos de arquivo (JPEG/PNG/WebP)
- Validação de tamanho (max 50MB)

**❌ NÃO FAÇA:**
- Expor JWT no frontend
- Hardcode JWT em código
- Commitar arquivo `.env`
- Permitir uploads ilimitados sem rate limit

### 9.2 Scoped API Keys

Para maior segurança, crie keys com permissões específicas:

**Produção:**
- ✅ `pinFileToIPFS`
- ✅ `pinJSONToIPFS`
- ❌ `unpin` (disabled)

**Desenvolvimento:**
- ✅ Todas permissões (facilita debug)

---

## 10. Custos Estimados

### 10.1 Cenário: 1000 NFTs/mês

**Storage:**
- 1000 imagens × 1MB (após otimização) = 1GB
- 1000 metadata × 10KB = 10MB
- **Total:** ~1.01GB

**Bandwidth:**
- 10K visualizações/mês × 1MB = 10GB

**Requests:**
- 10K visualizações = 10K requests

**Plano Recomendado:** Picnic ($20/mês)
- Inclui 1TB storage (1000x mais que necessário)
- Inclui 500GB bandwidth (50x mais que necessário)
- Inclui 1M requests (100x mais que necessário)

**Custo efetivo:** $20/mês

### 10.2 Escalabilidade

| NFTs/mês | Storage | Bandwidth | Plano | Custo |
|----------|---------|-----------|-------|-------|
| 100 | 100MB | 1GB | Free | $0 |
| 1,000 | 1GB | 10GB | Picnic | $20 |
| 10,000 | 10GB | 100GB | Picnic | $20 |
| 50,000 | 50GB | 500GB | Picnic/Fiesta | $20-100 |

---

## 11. Próximos Passos

Após configurar o Pinata:

1. ✅ **Testar endpoint** `/nfts/prepare-mint` via Swagger
2. ✅ **Validar CIDs** no Pin Explorer do Pinata
3. ✅ **Testar gateway** abrindo URLs no navegador
4. ⏭️ **Integrar frontend** com endpoint de upload
5. ⏭️ **Implementar mint on-chain** usando tokenURI retornado
6. ⏭️ **Deploy em produção** após testes completos

---

## 12. Suporte

**Documentação Pinata:**
- Docs oficiais: https://docs.pinata.cloud/
- SDK TypeScript: https://docs.pinata.cloud/sdks/typescript

**Suporte Galaxy Bay:**
- Issues: Abra issue no GitHub do projeto
- Email: suporte@galaxybay.io

---

**Última atualização:** 2025-11-10
**Versão:** 1.0
