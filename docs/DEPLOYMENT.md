# 🚀 Deployment Guide

Guia completo para deploy da plataforma Galaxy Bay em produção.

## 📋 Pré-requisitos

### Infraestrutura
- Servidor Linux (Ubuntu 20.04+ recomendado)
- PostgreSQL 14+
- Node.js 18+
- Nginx (para proxy reverso)
- SSL Certificate (Let's Encrypt recomendado)

### Serviços Externos
- [ ] Conta Alchemy ou Infura (RPC Ethereum)
- [ ] NFT.Storage API key
- [ ] Domínio configurado
- [ ] (Opcional) Conta AWS S3
- [ ] (Opcional) Conta Sentry

### Credenciais
- [ ] Private key para deploy de contratos
- [ ] Database credentials
- [ ] JWT secret (gerado)

## 🏗️ Arquitetura de Deploy

```
                    ┌─────────────────┐
                    │   CloudFlare    │
                    │   (CDN + SSL)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Nginx       │
                    │  (Reverse Proxy)│
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐         ┌─────────▼────────┐
     │   Frontend      │         │    Backend       │
     │   (Next.js)     │         │    (NestJS)      │
     │   Port 3001     │         │    Port 3000     │
     └─────────────────┘         └─────────┬────────┘
                                           │
                                  ┌────────▼────────┐
                                  │   PostgreSQL    │
                                  │   Port 5432     │
                                  └─────────────────┘
```

## 🔧 Setup do Servidor

### 1. Preparar Servidor

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y curl git nginx postgresql postgresql-contrib

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install pnpm (opcional, mais rápido que npm)
npm install -g pnpm
```

### 2. Configurar PostgreSQL

```bash
# Criar usuário e database
sudo -u postgres psql

postgres=# CREATE DATABASE galaxy_bay;
postgres=# CREATE USER galaxy_admin WITH ENCRYPTED PASSWORD 'strong-password-here';
postgres=# GRANT ALL PRIVILEGES ON DATABASE galaxy_bay TO galaxy_admin;
postgres=# \q

# Configurar conexões externas (se necessário)
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Adicionar: host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql
```

### 3. Configurar Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 📦 Deploy do Backend

### 1. Clone e Configure

```bash
# Clone o repositório
cd /var/www
sudo git clone https://github.com/seu-usuario/galaxy-bay.git
sudo chown -R $USER:$USER galaxy-bay
cd galaxy-bay/backend

# Install dependencies
npm install --production

# Configure environment
cp .env.example .env
nano .env
```

### 2. Variáveis de Ambiente (Backend)

```bash
# .env
DATABASE_URL="postgresql://galaxy_admin:password@localhost:5432/galaxy_bay"
JWT_SECRET="generate-strong-secret-here"
JWT_EXPIRES_IN="7d"

PORT=3000
NODE_ENV="production"
FRONTEND_URL="https://galaxy-bay.com"

# Blockchain
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR-KEY"
NFT_CONTRACT_ADDRESS="0x..."
MARKETPLACE_CONTRACT_ADDRESS="0x..."

# Storage
NFT_STORAGE_API_KEY="your-key"
STORAGE_TYPE="local"  # ou "s3"
STORAGE_PATH="/var/www/galaxy-bay/storage"

# Optional: S3
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
# AWS_REGION="us-east-1"
# AWS_S3_BUCKET="galaxy-bay-uploads"
```

### 3. Build e Migrations

```bash
# Build
npm run build

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 4. Setup PM2

```bash
# Criar ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'galaxy-bay-backend',
    script: 'dist/src/main.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M'
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Execute o comando que aparecer
```

## 🎨 Deploy do Frontend

### 1. Configure

```bash
cd /var/www/galaxy-bay/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.production
nano .env.production
```

### 2. Variáveis de Ambiente (Frontend)

```bash
# .env.production
NEXT_PUBLIC_API_URL="https://api.galaxy-bay.com/api"
NEXT_PUBLIC_FRONTEND_URL="https://galaxy-bay.com"

NEXT_PUBLIC_CHAIN_ID="11155111"
NEXT_PUBLIC_CHAIN_NAME="Sepolia"
NEXT_PUBLIC_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR-KEY"
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS="0x..."

NEXT_PUBLIC_ENABLE_ANALYTICS="true"
NEXT_PUBLIC_ENABLE_SENTRY="true"
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
```

### 3. Build

```bash
# Build for production
npm run build

# Setup PM2
pm2 start npm --name "galaxy-bay-frontend" -- start
pm2 save
```

## 🔒 Configurar Nginx

### 1. Backend Proxy

```bash
sudo nano /etc/nginx/sites-available/api.galaxy-bay.com
```

```nginx
server {
    listen 80;
    server_name api.galaxy-bay.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Frontend Proxy

```bash
sudo nano /etc/nginx/sites-available/galaxy-bay.com
```

```nginx
server {
    listen 80;
    server_name galaxy-bay.com www.galaxy-bay.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Ativar Sites

```bash
sudo ln -s /etc/nginx/sites-available/api.galaxy-bay.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/galaxy-bay.com /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

## 🔐 SSL com Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d galaxy-bay.com -d www.galaxy-bay.com
sudo certbot --nginx -d api.galaxy-bay.com

# Auto-renewal (já configurado, testar)
sudo certbot renew --dry-run
```

## 📊 Monitoramento

### 1. PM2 Monitoring

```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# Status
pm2 status
```

### 2. Setup Logrotate

```bash
sudo nano /etc/logrotate.d/galaxy-bay
```

```
/var/www/galaxy-bay/*/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### 3. Database Backups

```bash
# Criar script de backup
sudo nano /usr/local/bin/backup-galaxy-bay.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/galaxy-bay"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U galaxy_admin galaxy_bay | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
```

```bash
chmod +x /usr/local/bin/backup-galaxy-bay.sh

# Add to crontab
crontab -e
# Adicionar: 0 2 * * * /usr/local/bin/backup-galaxy-bay.sh
```

## 🚀 Deploy Updates

```bash
cd /var/www/galaxy-bay

# Pull changes
git pull origin main

# Backend
cd backend
npm install
npm run build
npx prisma migrate deploy
pm2 restart galaxy-bay-backend

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart galaxy-bay-frontend
```

## ✅ Checklist Final

Antes de ir para produção:

- [ ] Todos os .env configurados corretamente
- [ ] Database migrations aplicadas
- [ ] PM2 configurado para restart automático
- [ ] Nginx configurado e testado
- [ ] SSL certificates instalados
- [ ] Backups automatizados configurados
- [ ] Logs rotacionando corretamente
- [ ] Monitoring configurado
- [ ] Health checks funcionando (/health, /metrics)
- [ ] Rate limiting testado
- [ ] CORS configurado para domínio correto
- [ ] Contratos deployados na mainnet (se aplicável)
- [ ] DNS apontando para servidor
- [ ] Firewall configurado

## 🐛 Troubleshooting

### Backend não inicia
```bash
pm2 logs galaxy-bay-backend
# Verificar erros de conexão com DB ou variáveis faltando
```

### Frontend não carrega
```bash
pm2 logs galaxy-bay-frontend
# Verificar build e variáveis de ambiente
```

### Erro 502 Bad Gateway
```bash
# Verificar se aplicações estão rodando
pm2 status

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### Database connection issues
```bash
# Testar conexão
psql -U galaxy_admin -d galaxy_bay -h localhost

# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql
```

## 📚 Recursos Adicionais

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [PostgreSQL Backup](https://www.postgresql.org/docs/current/backup.html)
