-- Tabela de membros
CREATE TABLE public.membros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cargo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('diretoria', 'gestor', 'lider', 'cooperado')),
  foto TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de reuniões
CREATE TABLE public.reunioes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  duracao INTEGER NOT NULL DEFAULT 60,
  local TEXT,
  plataforma TEXT,
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
  tipo TEXT NOT NULL CHECK (tipo IN ('diretoria', 'gestores', 'lideres', 'geral')),
  criado_por UUID REFERENCES public.membros(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de tarefas delegadas
CREATE TABLE public.tarefas_delegadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reuniao_id UUID REFERENCES public.reunioes(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  responsavel_id UUID NOT NULL REFERENCES public.membros(id),
  prazo DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'nao_realizada')),
  observacoes TEXT,
  concluida_em TIMESTAMP WITH TIME ZONE,
  atualizado_por UUID REFERENCES public.membros(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reunioes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas_delegadas ENABLE ROW LEVEL SECURITY;

-- Políticas para leitura pública (sistema interno da cooperativa)
CREATE POLICY "Permitir leitura de membros" ON public.membros FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de reuniões" ON public.reunioes FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de tarefas" ON public.tarefas_delegadas FOR SELECT USING (true);

-- Políticas para escrita (inserção, atualização, exclusão)
CREATE POLICY "Permitir inserção de membros" ON public.membros FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de membros" ON public.membros FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de membros" ON public.membros FOR DELETE USING (true);

CREATE POLICY "Permitir inserção de reuniões" ON public.reunioes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de reuniões" ON public.reunioes FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de reuniões" ON public.reunioes FOR DELETE USING (true);

CREATE POLICY "Permitir inserção de tarefas" ON public.tarefas_delegadas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de tarefas" ON public.tarefas_delegadas FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de tarefas" ON public.tarefas_delegadas FOR DELETE USING (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_membros_updated_at
  BEFORE UPDATE ON public.membros
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reunioes_updated_at
  BEFORE UPDATE ON public.reunioes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tarefas_updated_at
  BEFORE UPDATE ON public.tarefas_delegadas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();