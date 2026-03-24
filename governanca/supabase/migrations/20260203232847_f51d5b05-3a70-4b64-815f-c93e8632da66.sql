-- Adicionar campo de auditoria na tabela atas
ALTER TABLE public.atas
ADD COLUMN link_auditoria text DEFAULT NULL;

COMMENT ON COLUMN public.atas.link_auditoria IS 'Link da transcrição bruta forense no Google Drive (pasta 06_Auditoria)';

-- Adicionar campo de arquivo processado na tabela processamentos_gravacao
ALTER TABLE public.processamentos_gravacao
ADD COLUMN link_arquivo_processado text DEFAULT NULL;

COMMENT ON COLUMN public.processamentos_gravacao.link_arquivo_processado IS 'Link do arquivo após ser movido para 07_Arquivos_Processados';