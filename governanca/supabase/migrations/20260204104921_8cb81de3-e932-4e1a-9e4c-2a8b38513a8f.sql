-- Criar tabela para registrar envios de e-mail de atas
CREATE TABLE public.envios_email (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ata_id UUID REFERENCES atas(id) ON DELETE CASCADE,
  destinatario_nome TEXT NOT NULL,
  destinatario_email TEXT NOT NULL,
  destinatario_cargo TEXT,
  enviado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  lido BOOLEAN DEFAULT false,
  lido_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.envios_email ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (mesmo padrão das outras tabelas)
CREATE POLICY "Permitir leitura de envios" ON public.envios_email FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de envios" ON public.envios_email FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de envios" ON public.envios_email FOR UPDATE USING (true);

-- Índice para otimizar consultas por ata
CREATE INDEX idx_envios_email_ata_id ON public.envios_email(ata_id);
CREATE INDEX idx_envios_email_enviado_em ON public.envios_email(enviado_em DESC);