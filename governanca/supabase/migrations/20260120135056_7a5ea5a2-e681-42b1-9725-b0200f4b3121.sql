-- Tabela para rastrear processamentos de gravações
CREATE TABLE public.processamentos_gravacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reuniao_id UUID REFERENCES public.reunioes(id) ON DELETE SET NULL,
  nome_arquivo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enviando',
  etapa_atual TEXT,
  progresso INTEGER DEFAULT 0,
  link_drive TEXT,
  erro_mensagem TEXT,
  assinaturas JSONB DEFAULT '[]'::jsonb,
  participantes TEXT[] DEFAULT '{}'::text[],
  pauta_id UUID REFERENCES public.pautas(id) ON DELETE SET NULL,
  tarefas_marcadas UUID[] DEFAULT '{}'::uuid[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.processamentos_gravacao ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir leitura de processamentos"
ON public.processamentos_gravacao FOR SELECT
USING (true);

CREATE POLICY "Permitir inserção de processamentos"
ON public.processamentos_gravacao FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização de processamentos"
ON public.processamentos_gravacao FOR UPDATE
USING (true);

CREATE POLICY "Permitir exclusão de processamentos"
ON public.processamentos_gravacao FOR DELETE
USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_processamentos_gravacao_updated_at
BEFORE UPDATE ON public.processamentos_gravacao
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime para atualizações em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.processamentos_gravacao;

-- Comentários
COMMENT ON TABLE public.processamentos_gravacao IS 'Rastreia o status de processamento de gravações de reuniões';
COMMENT ON COLUMN public.processamentos_gravacao.status IS 'Status: enviando, enviado_drive, transcrevendo, gerando_ata, concluido, erro';
COMMENT ON COLUMN public.processamentos_gravacao.assinaturas IS 'Array de objetos com nome, imagem base64 e hora da assinatura';