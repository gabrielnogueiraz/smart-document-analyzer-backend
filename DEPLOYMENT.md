# 🚀 Guia de Deploy - Smart Document Analyzer

## 📋 Pré-requisitos para Produção

- Node.js 18+
- PostgreSQL 13+
- Nginx (opcional, para proxy reverso)
- SSL Certificate (para HTTPS)

## 🐳 Deploy com Docker

### 1. Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3333
CMD ["npm", "run", "start:prod"]
```

### 2. Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3333:3333"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/smart_analyzer
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=smart_analyzer
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### 3. Nginx Configuration

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3333;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        client_max_body_size 10M;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## ☁️ Deploy em Cloud Providers

### AWS (Elastic Beanstalk)

1. **Prepare a aplicação**:
```bash
npm run build
zip -r app.zip dist/ package.json package-lock.json
```

2. **Configure EB CLI**:
```bash
eb init
eb create production
eb deploy
```

### Google Cloud Platform

1. **App Engine**:
```yaml
# app.yaml
runtime: nodejs18
env: standard

automatic_scaling:
  min_instances: 1
  max_instances: 10

env_variables:
  NODE_ENV: production
  DATABASE_URL: "postgresql://user:password@/smart_analyzer?host=/cloudsql/project:region:instance"
```

### Heroku

1. **Procfile**:
```
web: npm run start:prod
```

2. **Deploy**:
```bash
git push heroku main
```

## 🔧 Configurações de Produção

### Variáveis de Ambiente

```env
# Produção
NODE_ENV=production
PORT=3333

# Database
DATABASE_URL=postgresql://user:password@host:5432/smart_analyzer

# JWT (GERE CHAVES SEGURAS!)
JWT_SECRET=chave-super-secreta-256-bits
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=chave-refresh-super-secreta
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf

# Groq API
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3-8b-8192
```

### Scripts de Deploy

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Iniciando deploy..."

# Build da aplicação
npm run build

# Executar migrações
npm run prisma:migrate

# Reiniciar serviços
docker-compose down
docker-compose up -d

echo "✅ Deploy concluído!"
```

## 📊 Monitoramento

### Health Checks

```bash
# Verificar status da aplicação
curl http://localhost:3333/health

# Verificar logs
docker-compose logs -f app
```

### Métricas Recomendadas

- **CPU Usage**: < 70%
- **Memory Usage**: < 80%
- **Response Time**: < 500ms
- **Error Rate**: < 1%

## 🔒 Segurança em Produção

1. **Use HTTPS** sempre
2. **Configure CORS** adequadamente
3. **Rate Limiting** ativo
4. **Logs** estruturados
5. **Backup** do banco de dados
6. **Monitoramento** de segurança

## 🆘 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**:
   - Verifique DATABASE_URL
   - Confirme se PostgreSQL está rodando

2. **Erro de JWT**:
   - Verifique JWT_SECRET
   - Confirme se tokens não expiraram

3. **Upload de arquivos falha**:
   - Verifique MAX_FILE_SIZE
   - Confirme permissões de diretório

### Logs Úteis

```bash
# Logs da aplicação
docker-compose logs app

# Logs do banco
docker-compose logs db

# Logs do Nginx
docker-compose logs nginx
```

## 📈 Escalabilidade

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  app:
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
```

### Load Balancer

```nginx
upstream app {
    server app1:3333;
    server app2:3333;
    server app3:3333;
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
```

---

**Deploy seguro e escalável** 🚀✨
