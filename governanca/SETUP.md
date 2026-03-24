# Guia de Implantação — Governança Mogiana
### Sistema de Gestão de Reuniões — CrediMogiana

> **Versão:** 1.0.0 | **Data:** 10/02/2026  
> **Destinatário:** Time de TI da CrediMogiana  
> **Pré-condição:** Os fluxos N8N já estão configurados e funcionando na instância existente.

---

## Pré-requisitos

Antes de iniciar, certifique-se de ter:

| Item | Descrição |
|------|-----------|
| ✅ Conta no Lovable | Acesse [lovable.dev](https://lovable.dev) e crie uma conta gratuita |
| ✅ Link de Remix | Fornecido pelo responsável pelo projeto original |
| ✅ Acesso ao N8N | Instância N8N da CrediMogiana com os fluxos já importados |
| ✅ Conta Google | Para autorização do Google Drive (onde as gravações são salvas) |
| ✅ Conta de e-mail SMTP | Para envio das atas por e-mail (ex: Resend, Gmail, Outlook) |

---

## Passo 1 — Fazer o Remix do Projeto no Lovable

1. Acesse o link de remix fornecido pelo responsável do projeto.
2. Clique em **"Remix this project"**.
3. O Lovable cria automaticamente:
   - Um novo projeto de frontend (React + Vite + TypeScript)
   - Um banco de dados PostgreSQL isolado (**Lovable Cloud**)
   - 8 Edge Functions de backend (Deno)
4. Aguarde a inicialização completa (cerca de 1-2 minutos).
5. Anote a **URL do projeto** gerada (ex: `https://seu-projeto.lovable.app`).

> ⚠️ **Importante:** Cada remix gera um banco de dados novo e vazio. As credenciais do projeto original **não são copiadas** — você vai configurar as suas próprias nas etapas seguintes.

---

## Passo 2 — Configurar o Banco de Dados

Após o remix, o banco está vazio. É necessário executar o script de migração para criar as 20 tabelas e as 78 políticas de segurança (RLS).

### Onde está o script?

O arquivo de migração consolidado está em:

```
supabase/migrations/20260206133532_consolidated_migration.sql
```

### Como executar:

1. No painel do Lovable, clique em **"View Backend"** (ícone de banco de dados).
2. Navegue até **"SQL Editor"**.
3. Abra o arquivo `supabase/migrations/20260206133532_consolidated_migration.sql` do projeto.
4. Copie todo o conteúdo e cole no SQL Editor.
5. Clique em **"Run"**.
6. Verifique que a mensagem de sucesso aparece sem erros.

> ✅ O script é **idempotente** — pode ser executado mais de uma vez com segurança.

### Tabelas criadas (20 total):

| Tabela | Função |
|--------|--------|
| `membros` | Cooperados, gestores, diretores, líderes |
| `reunioes` | Reuniões agendadas e concluídas |
| `pautas` | Agendas vinculadas a reuniões |
| `pauta_objetivos` | Objetivos de cada pauta |
| `pauta_dados` | Dados apresentados por seção |
| `pauta_discussoes` | Tópicos de discussão |
| `pauta_discussao_pontos` | Pontos de cada discussão |
| `pauta_deliberacoes` | Decisões tomadas |
| `pauta_encaminhamentos` | Ações a realizar |
| `pauta_itens` | Itens de pauta com horários |
| `tarefas_delegadas` | Checklist de acompanhamento |
| `atas` | Atas geradas pela IA |
| `decisoes_ia` | Decisões extraídas pela IA |
| `acoes_ia` | Ações extraídas pela IA |
| `riscos_ia` | Riscos identificados |
| `oportunidades_ia` | Oportunidades identificadas |
| `processamentos_gravacao` | Status de upload/processamento |
| `destinatarios` | E-mails destinatários das atas |
| `envios_email` | Histórico de envios |
| `configuracoes` | Configurações do sistema |

---

## Passo 3 — Coletar as Credenciais do Novo Projeto

Após o remix e a execução do banco, o Lovable Cloud gera automaticamente as credenciais do seu novo projeto. Você precisará copiá-las para configurar as Edge Functions.

### Onde encontrar:

1. No painel do Lovable, clique em **"View Backend"**.
2. Navegue até **"Project Settings"** > **"API"**.
3. Copie os seguintes valores:

| Variável | Onde encontrar |
|----------|---------------|
| `SUPABASE_URL` | Project URL (ex: `https://xxxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | anon / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (⚠️ mantenha em segredo) |

> ⚠️ A `SERVICE_ROLE_KEY` tem acesso total ao banco. Nunca a exponha publicamente.

---

## Passo 4 — Configurar os Secrets das Edge Functions

Os secrets são variáveis de ambiente seguras usadas pelas Edge Functions. Configure-os no painel do Lovable Cloud.

### Como configurar:

1. No painel do Lovable, acesse **"Settings"** > **"Secrets"** (ou **"Environment Variables"**).
2. Adicione os seguintes secrets:

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `RESEND_API_KEY` | Chave da API do Resend para envio de e-mails | `re_xxxxxxxxxxxxx` |
| `N8N_WEBHOOK_URL` | URL do webhook N8N para disparo de processamento | `https://n8n.suainstancia.com/webhook/xxx` |
| `GOOGLE_DRIVE_FOLDER_ID` | ID da pasta no Google Drive onde as gravações serão salvas | `1BxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxA` |

> 💡 O `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já são preenchidos automaticamente pelo Lovable Cloud — não é necessário adicioná-los manualmente.

### Edge Functions do sistema (8 funções):

| Função | Responsabilidade |
|--------|-----------------|
| `upload-audio` | Inicia upload de gravação por chunks |
| `upload-chunk` | Recebe cada chunk do arquivo de áudio |
| `get-upload-url` | Gera URL assinada para upload direto |
| `upload-drive` | Envia arquivo finalizado para o Google Drive |
| `ega-webhook` | Recebe a ata processada do N8N e salva no banco |
| `status-update` | Atualiza o progresso do processamento em tempo real |
| `send-email-ata` | Envia a ata por e-mail para os destinatários |
| `send-email-pauta` | Envia a pauta por e-mail antes da reunião |

---

## Passo 5 — Atualizar as URLs no N8N

Com o novo projeto criado, as URLs das Edge Functions mudaram. É necessário atualizar os fluxos N8N existentes.

### URLs que precisam ser atualizadas:

Substitua `[SEU-PROJETO-ID]` pelo ID do seu novo projeto Lovable Cloud (visível na URL do backend, ex: `abcdefghijklm`).

| Fluxo N8N | URL antiga | Nova URL |
|-----------|-----------|----------|
| Recepção da ata | `https://[projeto-antigo].supabase.co/functions/v1/ega-webhook` | `https://[SEU-PROJETO-ID].supabase.co/functions/v1/ega-webhook` |
| Atualização de status | `https://[projeto-antigo].supabase.co/functions/v1/status-update` | `https://[SEU-PROJETO-ID].supabase.co/functions/v1/status-update` |
| Upload para Drive | `https://[projeto-antigo].supabase.co/functions/v1/upload-drive` | `https://[SEU-PROJETO-ID].supabase.co/functions/v1/upload-drive` |

### Como atualizar no N8N:

1. Acesse a interface do N8N (`https://n8n.suainstancia.com`).
2. Abra o fluxo **"EGA - Governança Mogiana"** (ou nome equivalente).
3. Localize os nós do tipo **"HTTP Request"** que apontam para as URLs acima.
4. Substitua as URLs pelos novos endpoints.
5. Ative o fluxo e faça um teste com uma gravação curta.

> ✅ Os fluxos N8N em si **não precisam ser reimportados** — apenas as URLs dos endpoints precisam ser atualizadas.

---

## Passo 6 — Configurações Iniciais pelo Sistema

Após o deploy, faça as configurações iniciais dentro da própria interface do **Governança Mogiana**.

### 6.1 — Configurações do Sistema (`/configuracoes`)

1. Acesse a URL do projeto no browser.
2. Navegue até **Configurações** no menu lateral.
3. Configure:
   - **E-mail remetente:** O endereço que aparecerá como remetente das atas (ex: `governanca@credimogiana.com.br`)
   - **URL do Webhook N8N:** A URL para disparo do processamento de gravações
   - **Envio automático de atas:** Ativar ou desativar o envio automático após processamento

### 6.2 — Cadastro de Membros (`/membros`)

1. Navegue até **Membros** no menu lateral.
2. Cadastre os membros da cooperativa com nome, cargo, e-mail e tipo:
   - **Diretoria:** Diretores e presidente
   - **Gestores:** Gerentes de área
   - **Líderes:** Coordenadores de equipe
   - **Cooperados:** Membros da cooperativa

### 6.3 — Configuração de Destinatários (`/destinatarios`)

1. Navegue até **Destinatários** no menu lateral.
2. Configure os e-mails que receberão as atas de cada tipo de reunião.
3. Opções de importação:
   - Adicionar manualmente
   - Importar via CSV
   - Importar a partir dos membros cadastrados

---

## Passo 7 — Criar a Primeira Reunião (Teste)

Para validar que tudo está funcionando:

1. Acesse **Reuniões** no menu lateral.
2. Clique em **"Nova Reunião"**.
3. Preencha os dados e salve.
4. Na reunião criada, clique em **"Upload de Gravação"**.
5. Faça upload de um arquivo de áudio de teste (MP3 ou WAV, máximo 500MB).
6. Acompanhe o status em tempo real na tela.
7. Após o processamento, a ata deve aparecer em **Atas**.

---

## Verificação Final — Checklist

Marque cada item após confirmar que está funcionando:

- [ ] **Projeto carrega** — A URL do projeto abre no browser sem erros
- [ ] **Banco de dados** — As 20 tabelas foram criadas com sucesso
- [ ] **Criar reunião** — É possível criar uma reunião em `/reunioes`
- [ ] **Upload funciona** — Upload de gravação inicia sem erro de autorização
- [ ] **N8N recebe webhook** — O N8N recebe o evento e inicia o processamento
- [ ] **Ata gerada** — A ata aparece em `/atas` após o processamento
- [ ] **E-mail enviado** — O e-mail da ata chega para os destinatários configurados
- [ ] **Pauta por e-mail** — É possível enviar pauta por e-mail em `/pautas`
- [ ] **Acompanhamento** — As tarefas delegadas aparecem em `/acompanhamento`

---

## Solução de Problemas Comuns

| Problema | Causa Provável | Solução |
|----------|---------------|---------|
| Upload trava em 0% | Secret `GOOGLE_DRIVE_FOLDER_ID` não configurado | Verificar e adicionar o secret no painel |
| Ata não aparece após processamento | URL do `ega-webhook` não atualizada no N8N | Atualizar a URL no fluxo N8N (Passo 5) |
| E-mail não chega | `RESEND_API_KEY` inválida ou domínio não verificado | Verificar a chave no painel do Resend |
| Erro 401 nas Edge Functions | `SERVICE_ROLE_KEY` incorreta | Verificar a chave no painel do Lovable Cloud |
| Tabelas não existem | Migration não foi executada | Executar o script SQL (Passo 2) |
| Status "processando" eternamente | N8N não consegue alcançar o `status-update` | Verificar URL e CORS no N8N |

---

## Contato e Suporte

- **Documentação técnica completa:** Disponível em `/documentacao` dentro do sistema
- **Documentação do Lovable:** [docs.lovable.dev](https://docs.lovable.dev)
- **Documentação do N8N:** [docs.n8n.io](https://docs.n8n.io)
- **Suporte Resend:** [resend.com/docs](https://resend.com/docs)

---

*Governança Mogiana — Sistema de Gestão de Reuniões*  
*CrediMogiana — Cooperativa de Crédito*  
*Versão 1.0.0 — Fevereiro/2026*
