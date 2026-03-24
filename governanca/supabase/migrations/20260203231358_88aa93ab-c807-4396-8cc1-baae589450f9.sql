-- Adicionar colunas de horário aos itens da pauta
ALTER TABLE public.pauta_itens
ADD COLUMN hora_inicio time DEFAULT NULL,
ADD COLUMN hora_fim time DEFAULT NULL;