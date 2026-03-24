# Governança Mogiana — Sistema de Gestão de Reuniões

Sistema completo para gestão de reuniões corporativas com geração de atas, pautas, acompanhamento de tarefas e envio de documentos por e-mail.

---

## Arquitetura

```
governanca/          → Frontend React + TypeScript + Vite + Tailwind CSS
governanca-backend/  → Backend API REST em .NET 10 (Clean Architecture)
docker-compose.yml   → Orquestração de todos os serviços
```

### Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | .NET 10, ASP.NET Core, Dapper, Npgsql |
| Banco de Dados | PostgreSQL 16 |
| Containerização | Docker + Docker Compose |

---

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/) instalados no servidor.

---

## Deploy em Produção (Servidor com Docker)

### 1. Preparar os arquivos

Copie os diretórios `governanca/`, `governanca-backend/`, o `docker-compose.yml` e o arquivo `BackupGovernanca.sql` para o servidor.

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

Edite o arquivo `.env` com suas configurações:

```env
POSTGRES_PASSWORD=sua_senha_segura_aqui
VITE_API_URL=https://api.seudominio.com.br
```

> **Importante:** `VITE_API_URL` deve ser a URL **pública** do backend, acessível pelo navegador do usuário final.

### 3. Inicializar o banco de dados

Na primeira execução, restaure o backup do banco de dados:

```bash
# Suba apenas o banco de dados primeiro
docker compose up -d postgres

# Aguarde o banco estar pronto
docker compose exec postgres pg_isready -U postgres -d governanca

# Restaure o backup
docker compose exec -T postgres psql -U postgres -d governanca < BackupGovernanca.sql
```

### 4. Subir todos os serviços

```bash
docker compose up -d --build
```

### 5. Verificar os serviços

```bash
docker compose ps
docker compose logs -f backend
```

Os serviços estarão disponíveis em:

| Serviço | URL |
|---|---|
| Frontend | http://seu-servidor (porta 80) |
| Backend API | http://seu-servidor:5000 |
| Banco de Dados | localhost:5432 (interno) |

---

## Desenvolvimento Local

### Backend (.NET)

```bash
cd governanca-backend

# Configure a connection string no appsettings.Development.json
# "DefaultConnection": "Host=localhost;Port=5432;Database=governanca;Username=postgres;Password=postgres"

dotnet run --project Governanca.API
# API disponível em: http://localhost:5000
```

### Frontend (React)

```bash
cd governanca

# Configure o .env
echo "VITE_API_URL=http://localhost:5000" > .env

npm install --legacy-peer-deps
npm run dev
# Frontend disponível em: http://localhost:8080
```

---

## Endpoints da API

### Reuniões
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/reunioes` | Listar todas as reuniões |
| GET | `/api/reunioes/{id}` | Obter reunião por ID |
| POST | `/api/reunioes` | Criar reunião |
| PUT | `/api/reunioes/{id}` | Atualizar reunião |
| DELETE | `/api/reunioes/{id}` | Excluir reunião |

### Pautas
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/pautas` | Listar pautas |
| GET | `/api/pautas/{id}` | Obter pauta completa (com sub-recursos) |
| POST | `/api/pautas` | Criar pauta |
| PUT | `/api/pautas/{id}` | Atualizar pauta |
| DELETE | `/api/pautas/{id}` | Excluir pauta |
| PATCH | `/api/pautas/{id}/status` | Atualizar status |
| POST | `/api/pautas/{id}/enviar` | Enviar pauta por e-mail |
| POST | `/api/pautas/{id}/objetivos` | Adicionar objetivo |
| POST | `/api/pautas/{id}/dados` | Adicionar dado |
| POST | `/api/pautas/{id}/discussoes` | Adicionar discussão |
| POST | `/api/pautas/{id}/deliberacoes` | Adicionar deliberação |
| POST | `/api/pautas/{id}/encaminhamentos` | Adicionar encaminhamento |
| POST | `/api/pautas/{id}/itens` | Adicionar item de pauta |

### Atas
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/atas` | Listar atas |
| GET | `/api/atas/{id}` | Obter ata por ID |
| DELETE | `/api/atas/{id}` | Excluir ata |
| POST | `/api/atas/{id}/enviar` | Enviar ata por e-mail |

### Membros
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/membros` | Listar membros |
| POST | `/api/membros` | Criar membro |
| PUT | `/api/membros/{id}` | Atualizar membro |
| DELETE | `/api/membros/{id}` | Excluir membro |

### Tarefas
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/tarefas` | Listar tarefas |
| POST | `/api/tarefas` | Criar tarefa |
| PUT | `/api/tarefas/{id}` | Atualizar tarefa |
| PATCH | `/api/tarefas/{id}/status` | Atualizar status |
| DELETE | `/api/tarefas/{id}` | Excluir tarefa |

### Destinatários
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/destinatarios` | Listar destinatários |
| POST | `/api/destinatarios` | Criar destinatário |
| PUT | `/api/destinatarios/{id}` | Atualizar destinatário |
| DELETE | `/api/destinatarios/{id}` | Excluir destinatário |

### Dashboard
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/dashboard` | Obter estatísticas gerais |

### Configurações
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/configuracoes` | Obter configurações do sistema |
| PUT | `/api/configuracoes` | Atualizar configurações |

---

## Integração com N8N (Automações)

O sistema foi projetado para integrar com N8N para automações de e-mail e processamento de gravações. Os endpoints de envio (`/enviar`) retornam `{ success: true }` e podem ser conectados a webhooks N8N para:

- Envio de pautas por e-mail antes das reuniões
- Envio de atas após as reuniões
- Processamento de gravações de áudio/vídeo para geração de atas via IA

Configure os webhooks N8N nas **Configurações** do sistema.

---

## Variáveis de Ambiente

### Backend (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=postgres;Port=5432;Database=governanca;Username=postgres;Password=senha"
  }
}
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:5000
```
