-- Tabela de Atas (resultado final do N8N)
CREATE TABLE atas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reuniao_id UUID REFERENCES reunioes(id),
  n8n_reuniao_id TEXT,
  conteudo_markdown TEXT NOT NULL,
  link_drive TEXT,
  resumo_executivo TEXT,
  tom_geral TEXT,
  urgencia TEXT,
  total_decisoes INTEGER DEFAULT 0,
  total_acoes INTEGER DEFAULT 0,
  total_riscos INTEGER DEFAULT 0,
  total_oportunidades INTEGER DEFAULT 0,
  status TEXT DEFAULT 'recebida',
  recebida_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Decisões da IA
CREATE TABLE decisoes_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ata_id UUID REFERENCES atas(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  responsavel TEXT,
  prazo TEXT,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Ações da IA
CREATE TABLE acoes_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ata_id UUID REFERENCES atas(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  responsavel TEXT,
  prazo TEXT,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Riscos
CREATE TABLE riscos_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ata_id UUID REFERENCES atas(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  severidade TEXT,
  mencoes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Oportunidades
CREATE TABLE oportunidades_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ata_id UUID REFERENCES atas(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  potencial TEXT,
  mencoes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE atas ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisoes_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE acoes_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE riscos_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidades_ia ENABLE ROW LEVEL SECURITY;

-- Policies for atas (public access for this integration)
CREATE POLICY "Permitir leitura de atas" ON atas FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de atas" ON atas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de atas" ON atas FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de atas" ON atas FOR DELETE USING (true);

-- Policies for decisoes_ia
CREATE POLICY "Permitir leitura de decisoes" ON decisoes_ia FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de decisoes" ON decisoes_ia FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de decisoes" ON decisoes_ia FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de decisoes" ON decisoes_ia FOR DELETE USING (true);

-- Policies for acoes_ia
CREATE POLICY "Permitir leitura de acoes" ON acoes_ia FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de acoes" ON acoes_ia FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de acoes" ON acoes_ia FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de acoes" ON acoes_ia FOR DELETE USING (true);

-- Policies for riscos_ia
CREATE POLICY "Permitir leitura de riscos" ON riscos_ia FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de riscos" ON riscos_ia FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de riscos" ON riscos_ia FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de riscos" ON riscos_ia FOR DELETE USING (true);

-- Policies for oportunidades_ia
CREATE POLICY "Permitir leitura de oportunidades" ON oportunidades_ia FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de oportunidades" ON oportunidades_ia FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de oportunidades" ON oportunidades_ia FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de oportunidades" ON oportunidades_ia FOR DELETE USING (true);

-- Trigger for updated_at on atas
CREATE TRIGGER update_atas_updated_at
  BEFORE UPDATE ON atas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();