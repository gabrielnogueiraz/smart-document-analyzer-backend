# IBM Smart Document Analyzer - Production Deployment Guide

## 🚀 Deployment Overview

Este documento descreve o processo de deploy em produção do IBM Smart Document Analyzer, seguindo os padrões e melhores práticas da IBM.

## 📋 Pré-requisitos

- Node.js 18+ 
- Docker e Docker Compose
- PostgreSQL 15+
- Redis 7+
- Variáveis de ambiente configuradas

## 🔧 Configuração de Produção

### 1. Variáveis de Ambiente

Crie um arquivo `.env` baseado no `env.production`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smart_analyzer"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-here"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-key-here"

# Application
NODE_ENV="production"
PORT=3333

# Security
ALLOWED_ORIGINS="https://yourdomain.com,https://api.yourdomain.com"
```

### 2. Deploy com Docker

```bash
# Build da imagem
npm run docker:build

# Deploy em produção
npm run docker:compose:prod
```

### 3. Deploy Manual

```bash
# Instalar dependências
npm ci --only=production

# Build da aplicação
npm run build

# Executar migrações
npm run prisma:migrate:deploy

# Iniciar aplicação
npm run start:prod
```

## 🔒 Segurança

### Configurações Implementadas

- ✅ Helmet para headers de segurança
- ✅ CORS configurado para produção
- ✅ Rate limiting implementado
- ✅ Validação de entrada com class-validator
- ✅ Usuário não-root no container
- ✅ Health checks configurados
- ✅ Logs estruturados com Winston

### Checklist de Segurança

- [ ] Configurar HTTPS/TLS
- [ ] Configurar firewall
- [ ] Configurar backup do banco de dados
- [ ] Configurar monitoramento
- [ ] Configurar logs centralizados

## 📊 Monitoramento

### Health Checks

- **Endpoint**: `GET /health`
- **Database**: Verificação de conectividade
- **Response**: Status 200 (healthy) ou 503 (unhealthy)

### Logs

- **Formato**: JSON estruturado
- **Níveis**: error, warn, info, debug
- **Rotação**: Configurada automaticamente

## 🐳 Docker

### Imagem de Produção

```dockerfile
# Multi-stage build otimizado
# Usuário não-root
# Health checks configurados
# Dependências de produção apenas
```

### Docker Compose

```yaml
# Serviços: app, db, redis
# Health checks configurados
# Volumes persistentes
# Restart policies
```

## 📈 Performance

### Otimizações Implementadas

- ✅ Compressão gzip
- ✅ Cache de dependências
- ✅ Multi-stage Docker build
- ✅ Prisma connection pooling
- ✅ Rate limiting

## 🔄 CI/CD

### Scripts Disponíveis

```bash
npm run build          # Build da aplicação
npm run test           # Testes unitários
npm run test:e2e       # Testes end-to-end
npm run lint:check     # Verificação de código
npm run security:audit # Auditoria de segurança
npm run deploy         # Deploy automatizado
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verificar DATABASE_URL
   - Verificar se PostgreSQL está rodando

2. **Erro de JWT**
   - Verificar JWT_SECRET
   - Verificar expiração dos tokens

3. **Erro de CORS**
   - Verificar ALLOWED_ORIGINS
   - Verificar configuração do frontend

### Logs de Debug

```bash
# Habilitar logs detalhados
NODE_ENV=development npm run start:dev
```

## 📞 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento da IBM.

---

**IBM Engineering Team**  
*Smart Document Analyzer v1.0.0*
