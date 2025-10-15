# Railway Deploy Guide - Smart Document Analyzer

## Pré-requisitos

1. **Railway CLI instalado:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Conta Railway criada:**
   - Acesse [railway.app](https://railway.app)
   - Crie uma conta ou faça login

## Deploy via CLI

### 1. Login no Railway
```bash
railway login
```

### 2. Inicializar projeto
```bash
railway init
```

### 3. Configurar variáveis de ambiente
No dashboard do Railway, configure as seguintes variáveis:

```env
# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here

# Groq API (opcional)
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3-8b-8192

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# CORS
ALLOWED_ORIGINS=*
```

### 4. Adicionar banco de dados PostgreSQL
No dashboard do Railway:
1. Clique em "New Service"
2. Selecione "Database" > "PostgreSQL"
3. Railway criará automaticamente a variável `DATABASE_URL`

### 5. Deploy
```bash
railway up
```

### 6. Abrir projeto
```bash
railway open
```

## Scripts Disponíveis

```bash
# Deploy completo
npm run railway:deploy

# Apenas inicializar
npm run railway:init

# Apenas deploy
npm run railway:up

# Abrir dashboard
npm run railway:open
```

## Configuração do Banco de Dados

Após o deploy, execute as migrações:

```bash
# Conectar ao projeto
railway connect

# Executar migrações
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate
```

## Monitoramento

- **Logs**: Acesse o dashboard do Railway
- **Health Check**: `https://seu-app.railway.app/health`
- **API Docs**: `https://seu-app.railway.app/api/docs`

## Troubleshooting

### Erro de Build
Se o build falhar, verifique:
1. Se todas as dependências estão no `package.json`
2. Se o Prisma está configurado corretamente
3. Se as variáveis de ambiente estão definidas

### Erro de Banco de Dados
1. Verifique se o PostgreSQL foi adicionado como serviço
2. Confirme se a `DATABASE_URL` está configurada
3. Execute as migrações manualmente

### Erro de CORS
Configure a variável `ALLOWED_ORIGINS` com os domínios permitidos.

## Domínio Customizado

Para usar um domínio customizado:
1. No dashboard do Railway, vá para "Settings"
2. Adicione seu domínio em "Custom Domains"
3. Configure os registros DNS conforme instruído

## Escalabilidade

O Railway automaticamente:
- Escala horizontalmente baseado na demanda
- Gerencia o balanceamento de carga
- Monitora a saúde da aplicação

## Custos

- **Hobby Plan**: $5/mês (suficiente para desenvolvimento)
- **Pro Plan**: $20/mês (recomendado para produção)
- **Enterprise**: Contato direto

## Suporte

- **Documentação**: [docs.railway.app](https://docs.railway.app)
- **Discord**: [Railway Discord](https://discord.gg/railway)
- **GitHub**: [Railway GitHub](https://github.com/railwayapp)
