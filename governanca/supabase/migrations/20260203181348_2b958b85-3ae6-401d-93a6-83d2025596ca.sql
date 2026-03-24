-- Criar tabela de destinatarios para gestão flexível de e-mails
CREATE TABLE public.destinatarios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  cargo text,
  email text NOT NULL,
  grupo text DEFAULT 'geral',
  ativo boolean DEFAULT true,
  origem text DEFAULT 'manual',
  membro_id uuid REFERENCES public.membros(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índice para busca por email
CREATE INDEX idx_destinatarios_email ON public.destinatarios(email);

-- Trigger para updated_at
CREATE TRIGGER set_updated_at_destinatarios
  BEFORE UPDATE ON public.destinatarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.destinatarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir leitura de destinatarios" 
  ON public.destinatarios FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de destinatarios" 
  ON public.destinatarios FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de destinatarios" 
  ON public.destinatarios FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão de destinatarios" 
  ON public.destinatarios FOR DELETE USING (true);

-- Criar tabela de configurações
CREATE TABLE public.configuracoes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chave text UNIQUE NOT NULL,
  valor jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger para updated_at
CREATE TRIGGER set_updated_at_configuracoes
  BEFORE UPDATE ON public.configuracoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir leitura de configuracoes" 
  ON public.configuracoes FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de configuracoes" 
  ON public.configuracoes FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de configuracoes" 
  ON public.configuracoes FOR UPDATE USING (true);

-- Inserir configurações padrão
INSERT INTO public.configuracoes (chave, valor) VALUES 
  ('envio_automatico_atas', '{"ativo": false}'),
  ('envio_automatico_pautas', '{"ativo": false}');