# Documentação da API - Smart Document Analyzer

## Base URL

```
http://localhost:3333
```

## Autenticação

Todos os endpoints (exceto `/auth/*`) requerem autenticação via JWT Bearer Token.

```bash
Authorization: Bearer <access_token>
```

## Endpoints de Autenticação

### POST /auth/register

Registra um novo usuário no sistema.

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "João Silva" // opcional
}
```

**Response (201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx123456789",
    "email": "usuario@exemplo.com",
    "name": "João Silva",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST /auth/login

Autentica um usuário existente.

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx123456789",
    "email": "usuario@exemplo.com",
    "name": "João Silva",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST /auth/refresh

Renova o token de acesso usando o refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Endpoints de Usuários

### GET /users/profile

Obtém o perfil do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "clx123456789",
  "email": "usuario@exemplo.com",
  "name": "João Silva",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### PUT /users/profile

Atualiza o perfil do usuário.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "João Silva Atualizado" // opcional
}
```

**Response (200):**
```json
{
  "id": "clx123456789",
  "email": "usuario@exemplo.com",
  "name": "João Silva Atualizado",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### DELETE /users/profile

Deleta a conta do usuário e todos os dados associados.

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No Content

### GET /users/stats

Obtém estatísticas do usuário.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "documents": 5,
  "analyses": 12
}
```

## Endpoints de Documentos

### POST /documents/upload

Faz upload de um documento PDF.

**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: arquivo PDF (obrigatório)
- `title`: título do documento (opcional)

**Response (201):**
```json
{
  "id": "clx123456789",
  "title": "Machine Learning in Healthcare",
  "filename": "ml-healthcare.pdf",
  "fileSize": 1048576,
  "mimeType": "application/pdf",
  "extractedText": "Este documento discute...",
  "userId": "clx123456789",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### GET /documents

Lista todos os documentos do usuário.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "clx123456789",
    "title": "Machine Learning in Healthcare",
    "filename": "ml-healthcare.pdf",
    "fileSize": 1048576,
    "mimeType": "application/pdf",
    "extractedText": "Este documento discute...",
    "userId": "clx123456789",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### GET /documents/{id}

Obtém um documento específico.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "clx123456789",
  "title": "Machine Learning in Healthcare",
  "filename": "ml-healthcare.pdf",
  "fileSize": 1048576,
  "mimeType": "application/pdf",
  "extractedText": "Este documento discute...",
  "userId": "clx123456789",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### GET /documents/{id}/text

Obtém apenas o texto extraído do documento.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "text": "Este documento discute aplicações de machine learning..."
}
```

### GET /documents/{id}/stats

Obtém estatísticas do documento.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "document": {
    "id": "clx123456789",
    "title": "Machine Learning in Healthcare",
    "filename": "ml-healthcare.pdf",
    "fileSize": 1048576,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "textLength": 5000,
  "analysisCount": 3,
  "lastAnalysis": "2024-01-15T11:00:00.000Z"
}
```

### DELETE /documents/{id}

Deleta um documento e todas as análises associadas.

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No Content

## Endpoints de Análise

### POST /analysis

Cria uma nova análise de documento usando IA.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "documentId": "clx123456789",
  "groqApiKey": "gsk_1234567890abcdef...",
  "customPrompt": "Analise focando em aspectos de segurança" // opcional
}
```

**Response (201):**
```json
{
  "id": "clx123456789",
  "documentId": "clx123456789",
  "userId": "clx123456789",
  "summary": "Este documento apresenta uma análise abrangente sobre machine learning aplicado à área da saúde...",
  "topics": ["machine learning", "healthcare", "algorithms", "data analysis"],
  "insights": "Este documento foca principalmente em aplicações práticas de ML em ambientes hospitalares...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### GET /analysis

Lista todas as análises do usuário.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "clx123456789",
    "documentId": "clx123456789",
    "userId": "clx123456789",
    "summary": "Este documento apresenta...",
    "topics": ["machine learning", "healthcare"],
    "insights": "Este documento foca...",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### GET /analysis/document/{documentId}

Lista todas as análises de um documento específico.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "clx123456789",
    "documentId": "clx123456789",
    "userId": "clx123456789",
    "summary": "Este documento apresenta...",
    "topics": ["machine learning", "healthcare"],
    "insights": "Este documento foca...",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### GET /analysis/{id}

Obtém uma análise específica.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "clx123456789",
  "documentId": "clx123456789",
  "userId": "clx123456789",
  "summary": "Este documento apresenta...",
  "topics": ["machine learning", "healthcare"],
  "insights": "Este documento foca...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### GET /analysis/stats/overview

Obtém estatísticas das análises do usuário.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "totalAnalyses": 15,
  "recentAnalyses": 3,
  "mostFrequentTopics": [
    { "topic": "machine learning", "count": 8 },
    { "topic": "healthcare", "count": 5 },
    { "topic": "algorithms", "count": 3 }
  ]
}
```

### DELETE /analysis/{id}

Deleta uma análise específica.

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No Content

## Códigos de Erro

### 400 - Bad Request
```json
{
  "statusCode": 400,
  "message": "Dados de entrada inválidos",
  "error": "Bad Request"
}
```

### 401 - Unauthorized
```json
{
  "statusCode": 401,
  "message": "Não autorizado",
  "error": "Unauthorized"
}
```

### 404 - Not Found
```json
{
  "statusCode": 404,
  "message": "Recurso não encontrado",
  "error": "Not Found"
}
```

### 409 - Conflict
```json
{
  "statusCode": 409,
  "message": "Usuário já existe com este email",
  "error": "Conflict"
}
```

### 413 - Payload Too Large
```json
{
  "statusCode": 413,
  "message": "Tamanho da requisição excede o limite permitido (10MB)",
  "error": "Payload Too Large"
}
```

### 429 - Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Muitas requisições. Tente novamente em alguns minutos.",
  "error": "Too Many Requests"
}
```

### 500 - Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Erro interno do servidor",
  "error": "Internal Server Error"
}
```

## Exemplos de Uso

### Fluxo Completo

1. **Registrar usuário:**
```bash
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

2. **Fazer login:**
```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

3. **Upload de documento:**
```bash
curl -X POST http://localhost:3333/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf" \
  -F "title=My Document"
```

4. **Criar análise:**
```bash
curl -X POST http://localhost:3333/analysis \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"documentId":"<document-id>","groqApiKey":"<groq-api-key>"}'
```

API completa e documentada
