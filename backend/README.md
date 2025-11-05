# Galaxy Bay - Backend

Backend da plataforma Galaxy Bay, construído com NestJS, Prisma e PostgreSQL.

## Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

## Configuração do Ambiente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure as variáveis necessárias:

```env
DATABASE_URL="postgresql://db_admin:galaxy_bay_2025@localhost:5432/galaxy_bay"
JWT_SECRET="seu-segredo-jwt-aqui"
NFT_STORAGE_KEY="sua-chave-nft-storage-aqui"
```

> **Importante**: Altere `JWT_SECRET` para um valor seguro em produção. Para gerar um secret seguro, você pode usar:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3. Subir o banco de dados com Docker

```bash
docker-compose up -d
```

Este comando irá:
- Baixar a imagem do PostgreSQL 16 Alpine
- Criar e iniciar o container `galaxy-bay-postgres`
- Expor a porta 5432 no localhost
- Criar um volume persistente para os dados

Para verificar se o banco está rodando:

```bash
docker-compose ps
```

### 4. Executar as migrations do Prisma

```bash
npx prisma migrate dev
```

Ou se as migrations já existirem:

```bash
npx prisma migrate deploy
```

### 5. (Opcional) Visualizar o banco de dados com Prisma Studio

```bash
npx prisma studio
```

Acesse `http://localhost:5555` no navegador.

## Executar o Projeto

### Modo de desenvolvimento

```bash
npm run start:dev
```

O servidor estará disponível em `http://localhost:3001`

### Modo de produção

```bash
npm run build
npm run start:prod
```

## Comandos Úteis do Docker

### Ver logs do banco de dados
```bash
docker-compose logs -f postgres
```

### Parar o banco de dados
```bash
docker-compose down
```

### Parar e remover volumes (apaga todos os dados)
```bash
docker-compose down -v
```

### Reiniciar o banco de dados
```bash
docker-compose restart
```

### Acessar o terminal do PostgreSQL
```bash
docker-compose exec postgres psql -U db_admin -d galaxy_bay
```

## Estrutura do Projeto

```
backend/
├── prisma/
│   ├── migrations/        # Histórico de migrations do banco
│   └── schema.prisma      # Schema do banco de dados
├── src/
│   ├── auth/              # Módulo de autenticação Web3
│   ├── user/              # Módulo de usuários
│   ├── pages/             # Módulo de páginas de criadores
│   ├── app.module.ts      # Módulo principal
│   └── main.ts            # Entry point
├── docker-compose.yml     # Configuração do Docker
├── .env.example           # Exemplo de variáveis de ambiente
└── README.md              # Este arquivo
```

## Documentação da API

A documentação Swagger está disponível em `http://localhost:3001/api` quando o servidor está rodando.

## Troubleshooting

### Porta 5432 já está em uso

Se você já tem PostgreSQL instalado localmente, pode alterar a porta no `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Altera para 5433 no host
```

E então atualize o `DATABASE_URL` no `.env`:

```env
DATABASE_URL="postgresql://db_admin:galaxy_bay_2025@localhost:5433/galaxy_bay"
```

### Erro de conexão com o banco

Verifique se o container está rodando:

```bash
docker-compose ps
```

Verifique a saúde do container:

```bash
docker-compose exec postgres pg_isready -U db_admin -d galaxy_bay
```

### Resetar o banco de dados

```bash
docker-compose down -v
docker-compose up -d
npx prisma migrate deploy
```

## Tecnologias Utilizadas

- **NestJS** - Framework backend
- **Prisma** - ORM
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **ethers.js** - Integração Web3

## Recursos do NestJS

Para mais informações sobre o NestJS:

- Documentação oficial: [https://docs.nestjs.com](https://docs.nestjs.com)
- Discord: [https://discord.gg/G7Qnnhy](https://discord.gg/G7Qnnhy)
- Twitter: [@nestframework](https://twitter.com/nestframework)

## Licença

Este projeto é [MIT licensed](LICENSE).
