import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    console.log('=== STATUS UPDATE - Recebido ===');
    console.log('Payload:', {
      processamento_id: payload.processamento_id,
      status: payload.status,
      etapa_atual: payload.etapa_atual,
      progresso: payload.progresso,
      link_drive: payload.link_drive,
      link_arquivo_processado: payload.link_arquivo_processado,
      erro_mensagem: payload.erro_mensagem,
    });

    // Validar processamento_id
    if (!payload.processamento_id) {
      console.error('Erro: processamento_id é obrigatório');
      return new Response(
        JSON.stringify({ success: false, error: 'processamento_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Montar objeto de atualização
    const updates: Record<string, unknown> = {};

    if (payload.status) {
      updates.status = payload.status;
    }
    if (payload.etapa_atual) {
      updates.etapa_atual = payload.etapa_atual;
    }
    if (typeof payload.progresso === 'number') {
      updates.progresso = payload.progresso;
    }
    if (payload.link_drive) {
      updates.link_drive = payload.link_drive;
    }
    if (payload.link_arquivo_processado) {
      updates.link_arquivo_processado = payload.link_arquivo_processado;
    }
    if (payload.erro_mensagem) {
      updates.erro_mensagem = payload.erro_mensagem;
    }

    // Se status é concluido, definir progresso 100
    if (payload.status === 'concluido') {
      updates.progresso = 100;
      updates.etapa_atual = 'Processamento concluído com sucesso!';
    }

    // Se status é erro, garantir mensagem
    if (payload.status === 'erro' && !payload.erro_mensagem) {
      updates.erro_mensagem = 'Erro desconhecido durante o processamento';
    }

    console.log('Atualizando processamento:', updates);

    // Atualizar registro
    const { data, error } = await supabase
      .from('processamentos_gravacao')
      .update(updates)
      .eq('id', payload.processamento_id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar:', error);
      throw new Error(`Erro ao atualizar: ${error.message}`);
    }

    console.log('=== STATUS UPDATE - Sucesso ===');
    console.log('Registro atualizado:', data?.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Status atualizado com sucesso',
        processamento: data,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno ao atualizar status';
    console.error('=== STATUS UPDATE - Erro ===', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
