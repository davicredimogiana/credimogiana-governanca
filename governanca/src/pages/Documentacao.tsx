import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  FileDown,
  Server,
  Database,
  Globe,
  Code,
  Webhook,
  Cloud,
  Users,
  Calendar,
  FileText,
  CheckSquare,
  ScrollText,
  Settings,
  Mail,
  LayoutDashboard,
  ArrowRight,
  Folder,
  Zap,
} from "lucide-react";
import { exportarDocumentacao, exportarSetupPDF } from "@/utils/pdfDocumentacao";
import { toast } from "sonner";

const Documentacao = () => {
  const handleExportPDF = () => {
    try {
      exportarDocumentacao();
      toast.success("Documentação exportada com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar documentação");
      console.error(error);
    }
  };

  const handleExportSetup = () => {
    try {
      exportarSetupPDF();
      toast.success("Guia de Implantação gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar Guia de Implantação");
      console.error(error);
    }
  };

  return (
    <MainLayout titulo="Documentação" subtitulo="Documentação técnica completa do sistema">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Documentação do Sistema
            </h1>
            <p className="text-muted-foreground mt-1">
              Documentação técnica completa do Governança Mogiana
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleExportPDF} className="gap-2">
              <FileDown className="w-4 h-4" />
              Exportar PDF
            </Button>
            <Button onClick={handleExportSetup} variant="outline" className="gap-2">
              <FileDown className="w-4 h-4" />
              Guia de Implantação (PDF)
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Accordion type="multiple" className="space-y-4" defaultValue={["visao-geral"]}>
          {/* 1. Visão Geral */}
          <AccordionItem value="visao-geral" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold">1. Visão Geral do Projeto</h2>
                  <p className="text-sm text-muted-foreground font-normal">
                    Objetivo, tecnologias e público-alvo
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Informações Gerais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nome:</span>
                        <span className="font-medium">Governança Mogiana</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Organização:</span>
                        <span className="font-medium">Credimogiana</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="font-medium">Cooperativa de Crédito</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Versão:</span>
                        <Badge variant="secondary">1.0.0</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Objetivo</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Sistema de gestão de reuniões corporativas com transcrição automática
                      via IA, geração de atas inteligentes, e acompanhamento de tarefas
                      delegadas. Projetado para otimizar a governança corporativa da
                      cooperativa.
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Tecnologias Utilizadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-accent/50">
                        <h4 className="font-medium mb-2">Frontend</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>React + Vite</li>
                          <li>TypeScript</li>
                          <li>Tailwind CSS</li>
                          <li>shadcn/ui</li>
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg bg-accent/50">
                        <h4 className="font-medium mb-2">Backend</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>Lovable Cloud</li>
                          <li>PostgreSQL</li>
                          <li>Edge Functions</li>
                          <li>Realtime</li>
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg bg-accent/50">
                        <h4 className="font-medium mb-2">Automação</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>N8N Workflows</li>
                          <li>Webhooks</li>
                          <li>APIs REST</li>
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg bg-accent/50">
                        <h4 className="font-medium mb-2">IA</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>OpenAI Whisper</li>
                          <li>GPT (Análise)</li>
                          <li>Extração de dados</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Arquitetura */}
          <AccordionItem value="arquitetura" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Server className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold">2. Arquitetura do Sistema</h2>
                  <p className="text-sm text-muted-foreground font-normal">
                    Diagrama de fluxo e componentes
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Fluxo de Processamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm overflow-x-auto">
                    <pre className="whitespace-pre text-muted-foreground">{`
┌─────────────────┐
│    USUÁRIO      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────────────────────────┐
│   FRONTEND      │     │          FLUXO DE GRAVAÇÃO           │
│   (React)       │     ├──────────────────────────────────────┤
├─────────────────┤     │                                      │
│ • Upload Audio  │────▶│  1. Edge Function: upload-drive      │
│ • Assinaturas   │     │           │                          │
│ • Status Real   │     │           ▼                          │
│   Time          │     │  2. N8N: Google Monitor Drive        │
└─────────────────┘     │     ├── Salva no Drive               │
         ▲              │     ├── Transcreve (Whisper)         │
         │              │     └── Analisa (GPT)                │
         │              │           │                          │
         │              │           ▼                          │
         │              │  3. Edge Function: ega-webhook       │
         │              │     └── Salva ata no banco           │
         │              │           │                          │
         │              │           ▼                          │
         │              │  4. Edge Function: status-update     │
         │◀─────────────│     └── Atualiza progresso          │
         │              └──────────────────────────────────────┘
         │
┌────────┴────────┐
│   BANCO DADOS   │
│   (16 tabelas)  │
└─────────────────┘
                    `}</pre>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Módulos */}
          <AccordionItem value="modulos" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <LayoutDashboard className="w-5 h-5 text-info" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold">3. Módulos e Funcionalidades</h2>
                  <p className="text-sm text-muted-foreground font-normal">
                    Descrição detalhada de cada área do sistema
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    icon: LayoutDashboard,
                    title: "Painel Geral",
                    path: "/",
                    description: "Visão executiva com métricas principais, estatísticas de reuniões, tarefas pendentes e próximos compromissos.",
                  },
                  {
                    icon: Calendar,
                    title: "Reuniões",
                    path: "/reunioes",
                    description: "Gerenciamento completo de reuniões com visualização em calendário ou lista, upload de gravações e assinaturas digitais.",
                  },
                  {
                    icon: FileText,
                    title: "Pautas",
                    path: "/pautas",
                    description: "Gestão de agendas com objetivos, contexto, dados apresentados, discussões, deliberações e encaminhamentos.",
                  },
                  {
                    icon: ScrollText,
                    title: "Atas",
                    path: "/atas",
                    description: "Recepção e visualização de atas geradas por IA, com decisões, ações, riscos e oportunidades identificadas.",
                  },
                  {
                    icon: CheckSquare,
                    title: "Acompanhamento",
                    path: "/acompanhamento",
                    description: "Checklist de tarefas delegadas com filtros, atualização de status e tags coloridas por categoria.",
                  },
                  {
                    icon: Users,
                    title: "Membros",
                    path: "/membros",
                    description: "Gestão de cooperados e funcionários com tipos: Diretoria, Gestores, Líderes e Cooperados.",
                  },
                  {
                    icon: Mail,
                    title: "Destinatários",
                    path: "/destinatarios",
                    description: "Configuração de quem recebe e-mails de atas, pautas e lembretes por tipo de reunião.",
                  },
                  {
                    icon: Settings,
                    title: "Configurações",
                    path: "/configuracoes",
                    description: "Parâmetros do sistema como notificações, e-mail remetente e URL do webhook N8N.",
                  },
                ].map((modulo) => (
                  <Card key={modulo.path} className="hover-lift">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                          <modulo.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{modulo.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {modulo.path}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {modulo.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Banco de Dados */}
          <AccordionItem value="banco-dados" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Database className="w-5 h-5 text-warning" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold">4. Banco de Dados</h2>
                  <p className="text-sm text-muted-foreground font-normal">
                    Estrutura das 16 tabelas do sistema
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { nome: "membros", descricao: "Cooperados, gestores, diretores, líderes" },
                  { nome: "reunioes", descricao: "Reuniões agendadas e concluídas" },
                  { nome: "pautas", descricao: "Agendas vinculadas a reuniões" },
                  { nome: "pauta_objetivos", descricao: "Objetivos de cada pauta" },
                  { nome: "pauta_dados", descricao: "Dados apresentados por seção" },
                  { nome: "pauta_discussoes", descricao: "Tópicos de discussão" },
                  { nome: "pauta_discussao_pontos", descricao: "Pontos de cada discussão" },
                  { nome: "pauta_deliberacoes", descricao: "Decisões tomadas" },
                  { nome: "pauta_encaminhamentos", descricao: "Ações a serem realizadas" },
                  { nome: "tarefas_delegadas", descricao: "Checklist de acompanhamento" },
                  { nome: "atas", descricao: "Atas geradas por IA" },
                  { nome: "decisoes_ia", descricao: "Decisões extraídas pela IA" },
                  { nome: "acoes_ia", descricao: "Ações extraídas pela IA" },
                  { nome: "riscos_ia", descricao: "Riscos identificados pela IA" },
                  { nome: "oportunidades_ia", descricao: "Oportunidades identificadas" },
                  { nome: "processamentos_gravacao", descricao: "Status de upload/processamento" },
                ].map((tabela) => (
                  <div
                    key={tabela.nome}
                    className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <code className="text-sm font-medium text-primary">{tabela.nome}</code>
                    <p className="text-xs text-muted-foreground mt-1">{tabela.descricao}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 5. Integrações N8N */}
          <AccordionItem value="integracoes" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Zap className="w-5 h-5 text-destructive" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold">5. Integrações com Automação (N8N)</h2>
                  <p className="text-sm text-muted-foreground font-normal">
                    Fluxos de automação e payloads
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="space-y-6">
                {/* Google Monitor Drive */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Badge>Fluxo 1</Badge>
                      <CardTitle className="text-base">Google Monitor Drive</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Webhook:</span>
                      <code className="px-2 py-1 bg-muted rounded text-xs">
                        webhook.impactautomacoesai.com.br/webhook/google-monitor-drive
                      </code>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Payload enviado:</p>
                      <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "audio_file": "base64...",
  "client_id": "credimogiana",
  "processamento_id": "uuid",
  "reuniao_id": "uuid",
  "nome_reuniao": "Reunião Diretoria",
  "data_reuniao": "2025-01-20",
  "tipo_reuniao": "diretoria",
  "participantes": ["Nome 1", "Nome 2"],
  "assinaturas": [
    { "nome": "...", "imagem": "base64...", "hora": "14:35" }
  ],
  "folder_id": "198TmXUi5GWEr4roSjjm9Ir28irWKd8Dp",
  "callback_url": "https://.../functions/v1/status-update"
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                {/* EGA Webhook */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Badge>Fluxo 2</Badge>
                      <CardTitle className="text-base">EGA Webhook (Recebe Atas)</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Endpoint:</span>
                      <code className="px-2 py-1 bg-muted rounded text-xs">
                        /functions/v1/ega-webhook
                      </code>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Payload esperado do N8N:</p>
                      <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "titulo": "Reunião Diretoria",
  "data": "2025-01-20",
  "ata_markdown": "# Ata da Reunião...",
  "resumo": "Resumo executivo...",
  "decisoes": [
    { "descricao": "...", "responsavel": "...", "prazo": "..." }
  ],
  "acoes": [...],
  "riscos": [...],
  "oportunidades": [...],
  "link_drive": "https://drive.google.com/..."
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Update */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Badge>Fluxo 3</Badge>
                      <CardTitle className="text-base">Status Update (Callback)</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Endpoint:</span>
                      <code className="px-2 py-1 bg-muted rounded text-xs">
                        /functions/v1/status-update
                      </code>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Payload de callback:</p>
                      <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "processamento_id": "uuid",
  "status": "transcrevendo | analisando | concluido | erro",
  "etapa_atual": "Transcricao em andamento...",
  "progresso": 50,
  "link_drive": "https://drive.google.com/..."
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 6. Armazenamento */}
          <AccordionItem value="armazenamento" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Cloud className="w-5 h-5 text-success" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold">6. Armazenamento em Nuvem</h2>
                  <p className="text-sm text-muted-foreground font-normal">
                    Google Drive / OneDrive - Pastas e estrutura
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      Google Drive
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">ID da Pasta:</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        198TmXUi5GWEr4roSjjm9Ir28irWKd8Dp
                      </code>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Estrutura:</p>
                      <pre className="text-xs bg-muted p-3 rounded-lg">
{`📂 01_Gravacoes/      ← Entrada temporária
📂 03_Atas/           ← PDFs das atas geradas
📂 06_Auditoria/      ← Transcrições brutas (forense)
📂 07_Arquivos_Processados/ ← Gravações finalizadas`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Cloud className="w-4 h-4" />
                      Compatibilidade OneDrive
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      O sistema pode ser adaptado para OneDrive alterando:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Credenciais de autenticação no N8N</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>IDs de pasta para formato SharePoint/OneDrive</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Nodes de upload no fluxo N8N</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 7. Edge Functions */}
          <AccordionItem value="edge-functions" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Code className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold">7. Backend Functions</h2>
                  <p className="text-sm text-muted-foreground font-normal">
                    Edge Functions do sistema
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="space-y-4">
                {[
                  {
                    nome: "upload-drive",
                    arquivo: "supabase/functions/upload-drive/index.ts",
                    objetivo: "Receber gravação do frontend e enviar para N8N",
                    fluxo: [
                      "Valida payload",
                      "Cria registro em processamentos_gravacao",
                      "Envia para webhook N8N",
                      "Atualiza status para 'enviado'",
                    ],
                  },
                  {
                    nome: "status-update",
                    arquivo: "supabase/functions/status-update/index.ts",
                    objetivo: "Receber callbacks do N8N para atualizar progresso",
                    fluxo: [
                      "Valida processamento_id",
                      "Atualiza status, etapa_atual, progresso",
                      "Salva link_drive quando disponível",
                      "Salva link_arquivo_processado (07_Arquivos)",
                    ],
                  },
                  {
                    nome: "ega-webhook",
                    arquivo: "supabase/functions/ega-webhook/index.ts",
                    objetivo: "Receber ata processada pelo N8N e salvar no banco",
                    fluxo: [
                      "Valida payload da ata",
                      "Insere em tabela atas",
                      "Insere decisões, ações, riscos, oportunidades",
                      "Salva link_auditoria (06_Auditoria)",
                      "Vincula à reunião quando possível",
                    ],
                  },
                ].map((func) => (
                  <Card key={func.nome}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-mono">{func.nome}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {func.arquivo}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{func.objetivo}</p>
                      <div className="flex flex-wrap gap-2">
                        {func.fluxo.map((step, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {i + 1}. {step}
                            </Badge>
                            {i < func.fluxo.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 8. Endpoints */}
          <AccordionItem value="endpoints" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Webhook className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold">8. Endpoints e Webhooks</h2>
                  <p className="text-sm text-muted-foreground font-normal">
                    Lista de URLs e métodos
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Endpoint</th>
                          <th className="text-left py-3 px-4 font-medium">Método</th>
                          <th className="text-left py-3 px-4 font-medium">Origem</th>
                          <th className="text-left py-3 px-4 font-medium">Destino</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4">
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              /functions/v1/upload-drive
                            </code>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-success text-success-foreground">POST</Badge>
                          </td>
                          <td className="py-3 px-4">Frontend</td>
                          <td className="py-3 px-4">N8N</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              /functions/v1/status-update
                            </code>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-success text-success-foreground">POST</Badge>
                          </td>
                          <td className="py-3 px-4">N8N</td>
                          <td className="py-3 px-4">Banco</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              /functions/v1/ega-webhook
                            </code>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-success text-success-foreground">POST</Badge>
                          </td>
                          <td className="py-3 px-4">N8N</td>
                          <td className="py-3 px-4">Banco</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4">
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              webhook.impactautomacoesai.com.br/webhook/google-monitor-drive
                            </code>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-success text-success-foreground">POST</Badge>
                          </td>
                          <td className="py-3 px-4">Edge Function</td>
                          <td className="py-3 px-4">N8N</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </MainLayout>
  );
};

export default Documentacao;
