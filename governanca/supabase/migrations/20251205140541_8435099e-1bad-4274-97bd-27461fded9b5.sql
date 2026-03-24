-- Adicionar 'superintendencia' ao check constraint de membros
ALTER TABLE membros DROP CONSTRAINT IF EXISTS membros_tipo_check;
ALTER TABLE membros ADD CONSTRAINT membros_tipo_check 
  CHECK (tipo = ANY (ARRAY['diretoria'::text, 'gestor'::text, 'lider'::text, 'cooperado'::text, 'superintendencia'::text]));

-- Adicionar coluna de tags nas tarefas delegadas
ALTER TABLE tarefas_delegadas ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';