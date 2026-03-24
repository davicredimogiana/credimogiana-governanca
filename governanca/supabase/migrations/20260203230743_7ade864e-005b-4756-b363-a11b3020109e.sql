-- Criar tabela pauta_itens para armazenar tópicos estruturados da pauta
CREATE TABLE public.pauta_itens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pauta_id uuid NOT NULL REFERENCES public.pautas(id) ON DELETE CASCADE,
  tema text NOT NULL,
  responsavel_id uuid REFERENCES public.membros(id) ON DELETE SET NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Índice para busca por pauta
CREATE INDEX idx_pauta_itens_pauta_id ON public.pauta_itens(pauta_id);

-- Habilitar RLS
ALTER TABLE public.pauta_itens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (acesso público para CRUD)
CREATE POLICY "Permitir leitura de pauta_itens"
  ON public.pauta_itens
  FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção de pauta_itens"
  ON public.pauta_itens
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de pauta_itens"
  ON public.pauta_itens
  FOR UPDATE
  USING (true);

CREATE POLICY "Permitir exclusão de pauta_itens"
  ON public.pauta_itens
  FOR DELETE
  USING (true);