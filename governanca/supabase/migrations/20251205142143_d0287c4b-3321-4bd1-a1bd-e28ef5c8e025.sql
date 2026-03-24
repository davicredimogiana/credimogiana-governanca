-- Criar tabela de pautas
CREATE TABLE public.pautas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  contexto TEXT,
  observacoes TEXT,
  reuniao_id UUID REFERENCES public.reunioes(id) ON DELETE SET NULL,
  responsavel_id UUID REFERENCES public.membros(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'pendente', 'em_discussao', 'aprovada', 'rejeitada')),
  tempo_previsto INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de objetivos da pauta
CREATE TABLE public.pauta_objetivos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pauta_id UUID NOT NULL REFERENCES public.pautas(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de dados apresentados na pauta
CREATE TABLE public.pauta_dados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pauta_id UUID NOT NULL REFERENCES public.pautas(id) ON DELETE CASCADE,
  secao_titulo TEXT NOT NULL,
  label TEXT NOT NULL,
  valor TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de discussões da pauta
CREATE TABLE public.pauta_discussoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pauta_id UUID NOT NULL REFERENCES public.pautas(id) ON DELETE CASCADE,
  topico TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de pontos de discussão
CREATE TABLE public.pauta_discussao_pontos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discussao_id UUID NOT NULL REFERENCES public.pauta_discussoes(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de deliberações da pauta
CREATE TABLE public.pauta_deliberacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pauta_id UUID NOT NULL REFERENCES public.pautas(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de encaminhamentos da pauta
CREATE TABLE public.pauta_encaminhamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pauta_id UUID NOT NULL REFERENCES public.pautas(id) ON DELETE CASCADE,
  acao TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  prazo TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.pautas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pauta_objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pauta_dados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pauta_discussoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pauta_discussao_pontos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pauta_deliberacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pauta_encaminhamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pautas
CREATE POLICY "Permitir leitura de pautas" ON public.pautas FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de pautas" ON public.pautas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de pautas" ON public.pautas FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de pautas" ON public.pautas FOR DELETE USING (true);

-- Políticas RLS para objetivos
CREATE POLICY "Permitir leitura de objetivos" ON public.pauta_objetivos FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de objetivos" ON public.pauta_objetivos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de objetivos" ON public.pauta_objetivos FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de objetivos" ON public.pauta_objetivos FOR DELETE USING (true);

-- Políticas RLS para dados
CREATE POLICY "Permitir leitura de dados" ON public.pauta_dados FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de dados" ON public.pauta_dados FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de dados" ON public.pauta_dados FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de dados" ON public.pauta_dados FOR DELETE USING (true);

-- Políticas RLS para discussões
CREATE POLICY "Permitir leitura de discussões" ON public.pauta_discussoes FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de discussões" ON public.pauta_discussoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de discussões" ON public.pauta_discussoes FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de discussões" ON public.pauta_discussoes FOR DELETE USING (true);

-- Políticas RLS para pontos de discussão
CREATE POLICY "Permitir leitura de pontos" ON public.pauta_discussao_pontos FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de pontos" ON public.pauta_discussao_pontos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de pontos" ON public.pauta_discussao_pontos FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de pontos" ON public.pauta_discussao_pontos FOR DELETE USING (true);

-- Políticas RLS para deliberações
CREATE POLICY "Permitir leitura de deliberações" ON public.pauta_deliberacoes FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de deliberações" ON public.pauta_deliberacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de deliberações" ON public.pauta_deliberacoes FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de deliberações" ON public.pauta_deliberacoes FOR DELETE USING (true);

-- Políticas RLS para encaminhamentos
CREATE POLICY "Permitir leitura de encaminhamentos" ON public.pauta_encaminhamentos FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de encaminhamentos" ON public.pauta_encaminhamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de encaminhamentos" ON public.pauta_encaminhamentos FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de encaminhamentos" ON public.pauta_encaminhamentos FOR DELETE USING (true);

-- Trigger para updated_at nas pautas
CREATE TRIGGER update_pautas_updated_at
  BEFORE UPDATE ON public.pautas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();