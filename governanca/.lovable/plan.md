
# Plano: Criar SETUP.md para o Time de TI da CrediMogiana

## O que será entregue

Dois entregáveis:

1. **Arquivo `SETUP.md`** na raiz do projeto — guia completo, passo a passo, sem nenhuma credencial real, para o time de TI conseguir fazer o remix e implantar do zero o Frontend + Banco de Dados.

2. **Botão "Baixar Guia de Implantação (PDF)"** na página `/documentacao` — gera um PDF do SETUP.md diretamente pelo browser, usando a mesma biblioteca jsPDF já instalada no projeto, com o mesmo visual profissional da documentação técnica e data fixa 10/02/2026.

---

## Estrutura do SETUP.md (conteúdo completo e sanitizado)

O documento será dividido em 8 seções claras:

### Seção 1 — Pré-requisitos
O que o time precisa ter antes de começar:
- Conta em lovable.dev
- Acesso ao repositório do projeto (link de remix)
- Acesso ao N8N (fluxos já configurados)
- Conta Google (para o Drive)
- Conta de e-mail com SMTP (para envio de atas)

### Seção 2 — Passo 1: Fazer o Remix do Projeto no Lovable
- Acessar o link de remix fornecido
- Criar novo projeto a partir do remix
- O Lovable Cloud (banco + backend) é criado automaticamente

### Seção 3 — Passo 2: Configurar o Banco de Dados
Instruções para executar o script SQL de migração consolidado que cria as 20 tabelas e 78 políticas RLS:
- Onde encontrar o arquivo (`supabase/migrations/20260206133532_*.sql`)
- Como rodar via painel do Lovable Cloud (SQL Editor)
- O script é idempotente — seguro para rodar mais de uma vez

### Seção 4 — Passo 3: Coletar as Credenciais do Novo Projeto
Após o remix, o Lovable gera novas credenciais automaticamente. O time precisa copiar:
- `SUPABASE_URL` do novo projeto
- `SUPABASE_ANON_KEY` do novo projeto
- `SUPABASE_SERVICE_ROLE_KEY` (para as Edge Functions)

### Seção 5 — Passo 4: Configurar as Variáveis de Ambiente nas Edge Functions
Listar os secrets que precisam ser configurados no painel do Lovable Cloud:
- `LOVABLE_API_KEY` (gerado pelo Lovable)
- `RESEND_API_KEY` ou dados SMTP para envio de e-mails
- URL do N8N (webhook de disparo)

### Seção 6 — Passo 5: Atualizar as URLs no N8N
Com as novas URLs do projeto, o time precisa atualizar nos fluxos N8N:
- **ega-webhook**: `https://[novo-projeto].supabase.co/functions/v1/ega-webhook`
- **status-update**: `https://[novo-projeto].supabase.co/functions/v1/status-update`
- **upload-drive**: `https://[novo-projeto].supabase.co/functions/v1/upload-drive`

### Seção 7 — Passo 6: Configurações Iniciais pelo Sistema
O que configurar dentro da própria interface do Governança Mogiana após o deploy:
- Acessar `/configuracoes` e inserir:
  - E-mail remetente (SMTP)
  - URL do webhook N8N de disparo
  - Ativar/desativar envio automático de atas
- Acessar `/membros` e cadastrar os primeiros membros
- Acessar `/destinatarios` e configurar os e-mails

### Seção 8 — Verificação Final (Checklist)
Lista de verificação para confirmar que tudo funcionou:
- [ ] Projeto carrega no browser
- [ ] Banco de dados tem as 20 tabelas
- [ ] É possível criar uma reunião em `/reunioes`
- [ ] Upload de gravação inicia sem erro
- [ ] N8N recebe o webhook e processa
- [ ] Ata aparece em `/atas` após processamento
- [ ] E-mail de ata é enviado com sucesso

---

## Botão na Página /documentacao

Será adicionado um segundo botão ao lado do "Exportar PDF" já existente:

**"Baixar Guia de Implantação (PDF)"**

Este botão chama uma nova função `exportarSetupPDF()` em `src/utils/pdfDocumentacao.ts` que gera um PDF profissional do guia de implantação com:
- Mesma identidade visual (cabeçalho verde, rodapé com paginação dinâmica)
- Data fixa: 10/02/2026
- Nome do arquivo: `Guia_Implantacao_Governanca_Mogiana_2026-02-10.pdf`
- Conteúdo sanitizado (sem nenhuma credencial real)

---

## Arquivos a Modificar/Criar

| Arquivo | Ação |
|---------|------|
| `SETUP.md` | Criar — guia de implantação completo para o time de TI |
| `src/utils/pdfDocumentacao.ts` | Adicionar função `exportarSetupPDF()` no final do arquivo |
| `src/pages/Documentacao.tsx` | Adicionar botão "Baixar Guia de Implantação (PDF)" |

---

## Resultado Esperado

- Time de TI da CrediMogiana recebe o `SETUP.md` no repositório e consegue implantar o sistema do zero, sem precisar de acesso às credenciais originais
- O botão na página `/documentacao` gera um PDF profissional do mesmo guia, pronto para imprimir ou compartilhar
- Nenhuma URL real, token, API key ou ID sensível está no documento
