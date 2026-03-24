
-- ============================================================
-- MIGRATION CONSOLIDADA - Schema Completo Governança Mogiana
-- Referência única de toda a estrutura do banco de dados
-- Idempotente: seguro para executar em banco novo ou existente
-- ============================================================

-- 1. FUNÇÃO AUXILIAR
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. TABELAS (todas com IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS public.membros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL, email TEXT NOT NULL, cargo TEXT NOT NULL, tipo TEXT NOT NULL,
  foto TEXT, ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reunioes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL, descricao TEXT, data DATE NOT NULL, horario TIME NOT NULL,
  duracao INTEGER NOT NULL DEFAULT 60, local TEXT, plataforma TEXT,
  status TEXT NOT NULL DEFAULT 'agendada', tipo TEXT NOT NULL,
  criado_por UUID REFERENCES public.membros(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tarefas_delegadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reuniao_id UUID REFERENCES public.reunioes(id),
  responsavel_id UUID NOT NULL REFERENCES public.membros(id),
  descricao TEXT NOT NULL, prazo DATE NOT NULL, status TEXT NOT NULL DEFAULT 'pendente',
  observacoes TEXT, concluida_em TIMESTAMPTZ,
  atualizado_por UUID REFERENCES public.membros(id), tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pautas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reuniao_id UUID REFERENCES public.reunioes(id),
  responsavel_id UUID REFERENCES public.membros(id),
  titulo TEXT NOT NULL, subtitulo TEXT, contexto TEXT, observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho', tempo_previsto INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pauta_objetivos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pauta_id UUID NOT NULL REFERENCES public.pautas(id) ON DELETE CASCADE,
  texto TEXT NOT NULL, ordem INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pauta_dados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pauta_id UUID NOT NULL REFERENCES public.pautas(id) ON DELETE CASCADE,
  secao_titulo TEXT NOT NULL, label TEXT NOT NULL, valor TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pauta_discussoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pauta_id UUID NOT NULL REFERENCES public.pautas(id) ON DELETE CASCADE,
  topico TEXT NOT NULL, ordem INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pauta_discussao_pontos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discussao_id UUID NOT NULL REFERENCES public.pauta_discussoes(id) ON DELETE CASCADE,
  texto TEXT NOT NULL, ordem INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pauta_deliberacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pauta_id UUID NOT NULL REFERENCES public.pautas(id) ON DELETE CASCADE,
  texto TEXT NOT NULL, ordem INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pauta_encaminhamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pauta_id UUID NOT NULL REFERENCES public.pautas(id) ON DELETE CASCADE,
  acao TEXT NOT NULL, responsavel TEXT NOT NULL, prazo TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pauta_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pauta_id UUID NOT NULL REFERENCES public.pautas(id) ON DELETE CASCADE,
  responsavel_id UUID REFERENCES public.membros(id),
  tema TEXT NOT NULL, ordem INTEGER DEFAULT 0, hora_inicio TIME, hora_fim TIME,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.atas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reuniao_id UUID REFERENCES public.reunioes(id), n8n_reuniao_id TEXT,
  conteudo_markdown TEXT NOT NULL, link_drive TEXT, link_auditoria TEXT,
  resumo_executivo TEXT, tom_geral TEXT, urgencia TEXT,
  total_decisoes INTEGER DEFAULT 0, total_acoes INTEGER DEFAULT 0,
  total_riscos INTEGER DEFAULT 0, total_oportunidades INTEGER DEFAULT 0,
  status TEXT DEFAULT 'recebida', recebida_em TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.decisoes_ia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ata_id UUID REFERENCES public.atas(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL, responsavel TEXT, prazo TEXT,
  status TEXT DEFAULT 'pendente', created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.acoes_ia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ata_id UUID REFERENCES public.atas(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL, responsavel TEXT, prazo TEXT,
  status TEXT DEFAULT 'pendente', created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.riscos_ia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ata_id UUID REFERENCES public.atas(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL, severidade TEXT, mencoes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.oportunidades_ia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ata_id UUID REFERENCES public.atas(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL, potencial TEXT, mencoes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.processamentos_gravacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reuniao_id UUID REFERENCES public.reunioes(id), pauta_id UUID REFERENCES public.pautas(id),
  nome_arquivo TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'enviando', etapa_atual TEXT,
  progresso INTEGER DEFAULT 0, link_drive TEXT, link_arquivo_processado TEXT,
  erro_mensagem TEXT, participantes TEXT[] DEFAULT '{}', tarefas_marcadas UUID[] DEFAULT '{}',
  assinaturas JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.destinatarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL, email TEXT NOT NULL, cargo TEXT,
  grupo TEXT DEFAULT 'geral', membro_id UUID REFERENCES public.membros(id),
  ativo BOOLEAN DEFAULT true, origem TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT NOT NULL, valor JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.envios_email (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ata_id UUID REFERENCES public.atas(id),
  destinatario_nome TEXT NOT NULL, destinatario_email TEXT NOT NULL, destinatario_cargo TEXT,
  enviado_em TIMESTAMPTZ DEFAULT now(), lido BOOLEAN DEFAULT false, lido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS (idempotente - ENABLE é seguro se já habilitado)
ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reunioes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas_delegadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pautas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pauta_objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pauta_dados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pauta_discussoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pauta_discussao_pontos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pauta_deliberacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pauta_encaminhamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pauta_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisoes_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riscos_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oportunidades_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processamentos_gravacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinatarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envios_email ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES (idempotente)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='membros' AND policyname='Permitir leitura de membros') THEN CREATE POLICY "Permitir leitura de membros" ON public.membros FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='membros' AND policyname='Permitir inserção de membros') THEN CREATE POLICY "Permitir inserção de membros" ON public.membros FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='membros' AND policyname='Permitir atualização de membros') THEN CREATE POLICY "Permitir atualização de membros" ON public.membros FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='membros' AND policyname='Permitir exclusão de membros') THEN CREATE POLICY "Permitir exclusão de membros" ON public.membros FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reunioes' AND policyname='Permitir leitura de reuniões') THEN CREATE POLICY "Permitir leitura de reuniões" ON public.reunioes FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reunioes' AND policyname='Permitir inserção de reuniões') THEN CREATE POLICY "Permitir inserção de reuniões" ON public.reunioes FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reunioes' AND policyname='Permitir atualização de reuniões') THEN CREATE POLICY "Permitir atualização de reuniões" ON public.reunioes FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reunioes' AND policyname='Permitir exclusão de reuniões') THEN CREATE POLICY "Permitir exclusão de reuniões" ON public.reunioes FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tarefas_delegadas' AND policyname='Permitir leitura de tarefas') THEN CREATE POLICY "Permitir leitura de tarefas" ON public.tarefas_delegadas FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tarefas_delegadas' AND policyname='Permitir inserção de tarefas') THEN CREATE POLICY "Permitir inserção de tarefas" ON public.tarefas_delegadas FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tarefas_delegadas' AND policyname='Permitir atualização de tarefas') THEN CREATE POLICY "Permitir atualização de tarefas" ON public.tarefas_delegadas FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tarefas_delegadas' AND policyname='Permitir exclusão de tarefas') THEN CREATE POLICY "Permitir exclusão de tarefas" ON public.tarefas_delegadas FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pautas' AND policyname='Permitir leitura de pautas') THEN CREATE POLICY "Permitir leitura de pautas" ON public.pautas FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pautas' AND policyname='Permitir inserção de pautas') THEN CREATE POLICY "Permitir inserção de pautas" ON public.pautas FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pautas' AND policyname='Permitir atualização de pautas') THEN CREATE POLICY "Permitir atualização de pautas" ON public.pautas FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pautas' AND policyname='Permitir exclusão de pautas') THEN CREATE POLICY "Permitir exclusão de pautas" ON public.pautas FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_objetivos' AND policyname='Permitir leitura de objetivos') THEN CREATE POLICY "Permitir leitura de objetivos" ON public.pauta_objetivos FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_objetivos' AND policyname='Permitir inserção de objetivos') THEN CREATE POLICY "Permitir inserção de objetivos" ON public.pauta_objetivos FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_objetivos' AND policyname='Permitir atualização de objetivos') THEN CREATE POLICY "Permitir atualização de objetivos" ON public.pauta_objetivos FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_objetivos' AND policyname='Permitir exclusão de objetivos') THEN CREATE POLICY "Permitir exclusão de objetivos" ON public.pauta_objetivos FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_dados' AND policyname='Permitir leitura de dados') THEN CREATE POLICY "Permitir leitura de dados" ON public.pauta_dados FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_dados' AND policyname='Permitir inserção de dados') THEN CREATE POLICY "Permitir inserção de dados" ON public.pauta_dados FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_dados' AND policyname='Permitir atualização de dados') THEN CREATE POLICY "Permitir atualização de dados" ON public.pauta_dados FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_dados' AND policyname='Permitir exclusão de dados') THEN CREATE POLICY "Permitir exclusão de dados" ON public.pauta_dados FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_discussoes' AND policyname='Permitir leitura de discussões') THEN CREATE POLICY "Permitir leitura de discussões" ON public.pauta_discussoes FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_discussoes' AND policyname='Permitir inserção de discussões') THEN CREATE POLICY "Permitir inserção de discussões" ON public.pauta_discussoes FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_discussoes' AND policyname='Permitir atualização de discussões') THEN CREATE POLICY "Permitir atualização de discussões" ON public.pauta_discussoes FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_discussoes' AND policyname='Permitir exclusão de discussões') THEN CREATE POLICY "Permitir exclusão de discussões" ON public.pauta_discussoes FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_discussao_pontos' AND policyname='Permitir leitura de pontos') THEN CREATE POLICY "Permitir leitura de pontos" ON public.pauta_discussao_pontos FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_discussao_pontos' AND policyname='Permitir inserção de pontos') THEN CREATE POLICY "Permitir inserção de pontos" ON public.pauta_discussao_pontos FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_discussao_pontos' AND policyname='Permitir atualização de pontos') THEN CREATE POLICY "Permitir atualização de pontos" ON public.pauta_discussao_pontos FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_discussao_pontos' AND policyname='Permitir exclusão de pontos') THEN CREATE POLICY "Permitir exclusão de pontos" ON public.pauta_discussao_pontos FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_deliberacoes' AND policyname='Permitir leitura de deliberações') THEN CREATE POLICY "Permitir leitura de deliberações" ON public.pauta_deliberacoes FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_deliberacoes' AND policyname='Permitir inserção de deliberações') THEN CREATE POLICY "Permitir inserção de deliberações" ON public.pauta_deliberacoes FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_deliberacoes' AND policyname='Permitir atualização de deliberações') THEN CREATE POLICY "Permitir atualização de deliberações" ON public.pauta_deliberacoes FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_deliberacoes' AND policyname='Permitir exclusão de deliberações') THEN CREATE POLICY "Permitir exclusão de deliberações" ON public.pauta_deliberacoes FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_encaminhamentos' AND policyname='Permitir leitura de encaminhamentos') THEN CREATE POLICY "Permitir leitura de encaminhamentos" ON public.pauta_encaminhamentos FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_encaminhamentos' AND policyname='Permitir inserção de encaminhamentos') THEN CREATE POLICY "Permitir inserção de encaminhamentos" ON public.pauta_encaminhamentos FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_encaminhamentos' AND policyname='Permitir atualização de encaminhamentos') THEN CREATE POLICY "Permitir atualização de encaminhamentos" ON public.pauta_encaminhamentos FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_encaminhamentos' AND policyname='Permitir exclusão de encaminhamentos') THEN CREATE POLICY "Permitir exclusão de encaminhamentos" ON public.pauta_encaminhamentos FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_itens' AND policyname='Permitir leitura de pauta_itens') THEN CREATE POLICY "Permitir leitura de pauta_itens" ON public.pauta_itens FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_itens' AND policyname='Permitir inserção de pauta_itens') THEN CREATE POLICY "Permitir inserção de pauta_itens" ON public.pauta_itens FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_itens' AND policyname='Permitir atualização de pauta_itens') THEN CREATE POLICY "Permitir atualização de pauta_itens" ON public.pauta_itens FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pauta_itens' AND policyname='Permitir exclusão de pauta_itens') THEN CREATE POLICY "Permitir exclusão de pauta_itens" ON public.pauta_itens FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='atas' AND policyname='Permitir leitura de atas') THEN CREATE POLICY "Permitir leitura de atas" ON public.atas FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='atas' AND policyname='Permitir inserção de atas') THEN CREATE POLICY "Permitir inserção de atas" ON public.atas FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='atas' AND policyname='Permitir atualização de atas') THEN CREATE POLICY "Permitir atualização de atas" ON public.atas FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='atas' AND policyname='Permitir exclusão de atas') THEN CREATE POLICY "Permitir exclusão de atas" ON public.atas FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='decisoes_ia' AND policyname='Permitir leitura de decisoes') THEN CREATE POLICY "Permitir leitura de decisoes" ON public.decisoes_ia FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='decisoes_ia' AND policyname='Permitir inserção de decisoes') THEN CREATE POLICY "Permitir inserção de decisoes" ON public.decisoes_ia FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='decisoes_ia' AND policyname='Permitir atualização de decisoes') THEN CREATE POLICY "Permitir atualização de decisoes" ON public.decisoes_ia FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='decisoes_ia' AND policyname='Permitir exclusão de decisoes') THEN CREATE POLICY "Permitir exclusão de decisoes" ON public.decisoes_ia FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='acoes_ia' AND policyname='Permitir leitura de acoes') THEN CREATE POLICY "Permitir leitura de acoes" ON public.acoes_ia FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='acoes_ia' AND policyname='Permitir inserção de acoes') THEN CREATE POLICY "Permitir inserção de acoes" ON public.acoes_ia FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='acoes_ia' AND policyname='Permitir atualização de acoes') THEN CREATE POLICY "Permitir atualização de acoes" ON public.acoes_ia FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='acoes_ia' AND policyname='Permitir exclusão de acoes') THEN CREATE POLICY "Permitir exclusão de acoes" ON public.acoes_ia FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='riscos_ia' AND policyname='Permitir leitura de riscos') THEN CREATE POLICY "Permitir leitura de riscos" ON public.riscos_ia FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='riscos_ia' AND policyname='Permitir inserção de riscos') THEN CREATE POLICY "Permitir inserção de riscos" ON public.riscos_ia FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='riscos_ia' AND policyname='Permitir atualização de riscos') THEN CREATE POLICY "Permitir atualização de riscos" ON public.riscos_ia FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='riscos_ia' AND policyname='Permitir exclusão de riscos') THEN CREATE POLICY "Permitir exclusão de riscos" ON public.riscos_ia FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='oportunidades_ia' AND policyname='Permitir leitura de oportunidades') THEN CREATE POLICY "Permitir leitura de oportunidades" ON public.oportunidades_ia FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='oportunidades_ia' AND policyname='Permitir inserção de oportunidades') THEN CREATE POLICY "Permitir inserção de oportunidades" ON public.oportunidades_ia FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='oportunidades_ia' AND policyname='Permitir atualização de oportunidades') THEN CREATE POLICY "Permitir atualização de oportunidades" ON public.oportunidades_ia FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='oportunidades_ia' AND policyname='Permitir exclusão de oportunidades') THEN CREATE POLICY "Permitir exclusão de oportunidades" ON public.oportunidades_ia FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='processamentos_gravacao' AND policyname='Permitir leitura de processamentos') THEN CREATE POLICY "Permitir leitura de processamentos" ON public.processamentos_gravacao FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='processamentos_gravacao' AND policyname='Permitir inserção de processamentos') THEN CREATE POLICY "Permitir inserção de processamentos" ON public.processamentos_gravacao FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='processamentos_gravacao' AND policyname='Permitir atualização de processamentos') THEN CREATE POLICY "Permitir atualização de processamentos" ON public.processamentos_gravacao FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='processamentos_gravacao' AND policyname='Permitir exclusão de processamentos') THEN CREATE POLICY "Permitir exclusão de processamentos" ON public.processamentos_gravacao FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='destinatarios' AND policyname='Permitir leitura de destinatarios') THEN CREATE POLICY "Permitir leitura de destinatarios" ON public.destinatarios FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='destinatarios' AND policyname='Permitir inserção de destinatarios') THEN CREATE POLICY "Permitir inserção de destinatarios" ON public.destinatarios FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='destinatarios' AND policyname='Permitir atualização de destinatarios') THEN CREATE POLICY "Permitir atualização de destinatarios" ON public.destinatarios FOR UPDATE USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='destinatarios' AND policyname='Permitir exclusão de destinatarios') THEN CREATE POLICY "Permitir exclusão de destinatarios" ON public.destinatarios FOR DELETE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='configuracoes' AND policyname='Permitir leitura de configuracoes') THEN CREATE POLICY "Permitir leitura de configuracoes" ON public.configuracoes FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='configuracoes' AND policyname='Permitir inserção de configuracoes') THEN CREATE POLICY "Permitir inserção de configuracoes" ON public.configuracoes FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='configuracoes' AND policyname='Permitir atualização de configuracoes') THEN CREATE POLICY "Permitir atualização de configuracoes" ON public.configuracoes FOR UPDATE USING (true); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='envios_email' AND policyname='Permitir leitura de envios') THEN CREATE POLICY "Permitir leitura de envios" ON public.envios_email FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='envios_email' AND policyname='Permitir inserção de envios') THEN CREATE POLICY "Permitir inserção de envios" ON public.envios_email FOR INSERT WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='envios_email' AND policyname='Permitir atualização de envios') THEN CREATE POLICY "Permitir atualização de envios" ON public.envios_email FOR UPDATE USING (true); END IF;
END $$;

-- 5. TRIGGERS (idempotente)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_membros_updated_at') THEN CREATE TRIGGER update_membros_updated_at BEFORE UPDATE ON public.membros FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reunioes_updated_at') THEN CREATE TRIGGER update_reunioes_updated_at BEFORE UPDATE ON public.reunioes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tarefas_delegadas_updated_at') THEN CREATE TRIGGER update_tarefas_delegadas_updated_at BEFORE UPDATE ON public.tarefas_delegadas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pautas_updated_at') THEN CREATE TRIGGER update_pautas_updated_at BEFORE UPDATE ON public.pautas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_atas_updated_at') THEN CREATE TRIGGER update_atas_updated_at BEFORE UPDATE ON public.atas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_processamentos_gravacao_updated_at') THEN CREATE TRIGGER update_processamentos_gravacao_updated_at BEFORE UPDATE ON public.processamentos_gravacao FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_destinatarios_updated_at') THEN CREATE TRIGGER update_destinatarios_updated_at BEFORE UPDATE ON public.destinatarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_configuracoes_updated_at') THEN CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON public.configuracoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF;
END $$;

-- 6. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_destinatarios_email ON public.destinatarios(email);
CREATE INDEX IF NOT EXISTS idx_destinatarios_grupo ON public.destinatarios(grupo);
CREATE INDEX IF NOT EXISTS idx_destinatarios_ativo ON public.destinatarios(ativo);
CREATE INDEX IF NOT EXISTS idx_envios_email_ata_id ON public.envios_email(ata_id);
CREATE INDEX IF NOT EXISTS idx_envios_email_destinatario ON public.envios_email(destinatario_email);
CREATE INDEX IF NOT EXISTS idx_envios_email_enviado_em ON public.envios_email(enviado_em);
CREATE INDEX IF NOT EXISTS idx_pauta_itens_pauta_id ON public.pauta_itens(pauta_id);
CREATE INDEX IF NOT EXISTS idx_pauta_itens_ordem ON public.pauta_itens(ordem);

-- 7. REALTIME (idempotente - verificar antes de adicionar)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'processamentos_gravacao'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.processamentos_gravacao;
  END IF;
END $$;

-- 8. DADOS INICIAIS
INSERT INTO public.configuracoes (chave, valor)
SELECT 'envio_automatico_atas', '{"ativo": false}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.configuracoes WHERE chave = 'envio_automatico_atas');

INSERT INTO public.configuracoes (chave, valor)
SELECT 'envio_automatico_pautas', '{"ativo": false}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.configuracoes WHERE chave = 'envio_automatico_pautas');
