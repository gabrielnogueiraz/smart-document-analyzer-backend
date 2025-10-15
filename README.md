# 🧠 Smart Document Analyzer

> **Backend para análise inteligente de documentos acadêmicos usando IA**

Um sistema robusto e escalável desenvolvido com **NestJS + TypeScript + Prisma + PostgreSQL** que permite upload de documentos PDF, extração de texto e análise inteligente usando a **Groq Cloud API (Llama 3)**.

## 🚀 Características

- ✅ **Autenticação JWT** com refresh tokens
- ✅ **Upload de PDFs** com extração automática de texto
- ✅ **Análise com IA** usando Groq Cloud API (Llama 3)
- ✅ **Arquitetura modular** e escalável
- ✅ **Segurança robusta** com rate limiting e validações
- ✅ **Documentação Swagger** completa
- ✅ **Testes unitários e e2e** com alta cobertura
- ✅ **Logging estruturado** com Winston
- ✅ **Validação de dados** com class-validator

## 🏗️ Arquitetura

```
src/
├── common/                 # Utilitários compartilhados
│   ├── decorators/         # Decorators customizados
│   ├── filters/           # Filtros de exceção globais
│   ├── guards/            # Guards de autenticação
│   ├── interceptors/       # Interceptors de logging
│   ├── middleware/        # Middleware de segurança
│   └── validators/        # Validators customizados
├── modules/               # Módulos de funcionalidades
│   ├── auth/             # Autenticação e autorização
│   ├── users/            # Gerenciamento de usuários
│   ├── documents/        # Upload e gestão de documentos
│   └── analysis/         # Análise com IA
├── prisma/               # Configuração do banco de dados
└── main.ts              # Ponto de entrada da aplicação
```

## 🛠️ Stack Tecnológica

- **Framework**: NestJS 10.x
- **Linguagem**: TypeScript 5.x
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma 5.x
- **Autenticação**: JWT + Passport
- **Validação**: class-validator + class-transformer
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest
- **Logging**: Winston
- **IA**: Groq Cloud API (Llama 3)

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 13+
- npm ou yarn

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <repository-url>
cd smart-document-analyzer
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

```bash
# Crie um banco PostgreSQL
createdb smart_analyzer

# Configure a string de conexão no .env
DATABASE_URL="postgresql://user:password@localhost:5432/smart_analyzer"
```

### 4. Configure as variáveis de ambiente

```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smart_analyzer"

# JWT Configuration
JWT_SECRET="sua-chave-secreta-super-segura"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="sua-chave-refresh-secreta"
JWT_REFRESH_EXPIRES_IN="7d"

# Application
PORT=3333
NODE_ENV="development"

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES="application/pdf"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Groq API (User provided)
GROQ_API_URL="https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL="llama-3-8b-8192"
```

### 5. Execute as migrações do banco

```bash
# Gerar o cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# (Opcional) Visualizar dados no Prisma Studio
npm run prisma:studio
```

### 6. Inicie a aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📚 Documentação da API

Após iniciar a aplicação, acesse:

- **Swagger UI**: http://localhost:3333/api/docs
- **Health Check**: http://localhost:3333/health

## 🔐 Autenticação

O sistema usa **JWT (JSON Web Tokens)** com refresh tokens:

### Registro de Usuário
```bash
POST /auth/register
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "João Silva" // opcional
}
```

### Login
```bash
POST /auth/login
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

### Uso dos Tokens
```bash
# Incluir o token no header Authorization
Authorization: Bearer <access_token>
```

## 📄 Upload de Documentos

### Upload de PDF
```bash
POST /documents/upload
Content-Type: multipart/form-data

# Form data:
file: <arquivo.pdf>
title: "Título do Documento" // opcional
```

### Listar Documentos
```bash
GET /documents
Authorization: Bearer <token>
```

### Obter Texto Extraído
```bash
GET /documents/{id}/text
Authorization: Bearer <token>
```

## 🤖 Análise com IA

### Criar Análise
```bash
POST /analysis
Authorization: Bearer <token>
{
  "documentId": "uuid-do-documento",
  "groqApiKey": "sua-chave-groq",
  "customPrompt": "Analise focando em aspectos de segurança" // opcional
}
```

### Resposta da Análise
```json
{
  "id": "uuid-da-analise",
  "summary": "Resumo acadêmico do documento...",
  "topics": ["machine learning", "healthcare", "algorithms"],
  "insights": "Este documento foca principalmente em...",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes com coverage
npm run test:cov

# Testes e2e
npm run test:e2e

# Testes em modo watch
npm run test:watch
```

## 🔒 Segurança

- **Rate Limiting**: 100 requests/15min por IP
- **Validação de Arquivos**: Apenas PDFs, máximo 10MB
- **Sanitização**: Limpeza automática de dados de entrada
- **Headers de Segurança**: Helmet.js configurado
- **CORS**: Configurado para desenvolvimento e produção

## 📊 Monitoramento

### Logs Estruturados
```typescript
// Exemplo de log
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Documento uploadado com sucesso",
  "userId": "user-123",
  "documentId": "doc-456"
}
```

### Health Checks
```bash
GET /health
# Retorna status da aplicação e banco de dados
```

## 🚀 Deploy

### Docker (Recomendado)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3333
CMD ["npm", "run", "start:prod"]
```

### Variáveis de Ambiente para Produção

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@db:5432/smart_analyzer
JWT_SECRET=chave-super-secreta-producao
JWT_REFRESH_SECRET=chave-refresh-producao
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Documentação**: http://localhost:3333/api/docs
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: suporte@exemplo.com

## 🏆 Créditos

Desenvolvido com ❤️ pela equipe de engenharia da IBM, seguindo as melhores práticas de desenvolvimento enterprise.

---

**Smart Document Analyzer** - Transformando documentos em insights inteligentes 🧠✨
