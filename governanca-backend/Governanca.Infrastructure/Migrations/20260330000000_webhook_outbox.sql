-- ─── Migração: Tabela de fila de despacho para webhooks N8N (Outbox Pattern) ──
-- Esta tabela substitui a chamada direta (fire-and-forget) ao webhook do N8N.
-- O Worker N8nDispatcherWorker lê esta fila e garante a entrega com retry automático.

CREATE TABLE IF NOT EXISTS public.webhook_outbox (
    id                  UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    processamento_id    UUID        REFERENCES public.processamentos_gravacao(id) ON DELETE SET NULL,
    payload             JSONB       NOT NULL,
    -- 'pendente' | 'processando' | 'concluido' | 'erro'
    status              TEXT        NOT NULL DEFAULT 'pendente',
    tentativas          INTEGER     NOT NULL DEFAULT 0,
    max_tentativas      INTEGER     NOT NULL DEFAULT 5,
    proxima_tentativa   TIMESTAMPTZ NOT NULL DEFAULT now(),
    erro_mensagem       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para o Worker: busca eficiente de mensagens pendentes/com erro prontas para processar
CREATE INDEX IF NOT EXISTS idx_webhook_outbox_status_proxima
    ON public.webhook_outbox (status, proxima_tentativa)
    WHERE status IN ('pendente', 'erro');

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_webhook_outbox_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_webhook_outbox_updated_at
    BEFORE UPDATE ON public.webhook_outbox
    FOR EACH ROW EXECUTE FUNCTION public.update_webhook_outbox_updated_at();

-- RLS: habilitar e permitir acesso total (o controle é feito pela API/Worker)
ALTER TABLE public.webhook_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_outbox_all" ON public.webhook_outbox
    USING (true) WITH CHECK (true);
