import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URL do webhook N8N para obter URL de upload do Google Drive
const N8N_GET_UPLOAD_URL = "https://webhook.impactautomacoesai.com.br/webhook/get-drive-upload-url";

// ID da pasta no Google Drive (01_Gravações)
const GOOGLE_DRIVE_FOLDER_ID = "198TmXUi5GWEr4roSjjm9Ir28irWKd8Dp";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    console.log('=== GET UPLOAD URL - Início ===');
    console.log('Payload recebido:', {
      reuniao_id: payload.reuniao_id,
      nome_reuniao: payload.nome_reuniao,
      data_reuniao: payload.data_reuniao,
      tipo_reuniao: payload.tipo_reuniao,
      nome_arquivo: payload.nome_arquivo,
      tamanho_arquivo: payload.tamanho_arquivo,
      mime_type: payload.mime_type,
      num_participantes: payload.participantes?.length || 0,
      num_assinaturas: payload.assinaturas?.length || 0,
      pauta_id: payload.pauta_id,
    });

    // Validações
    if (!payload.nome_arquivo) {
      console.error('Erro: Nome do arquivo não fornecido');
      return new Response(
        JSON.stringify({ success: false, error: 'Nome do arquivo é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Criar registro de processamento
    console.log('Criando registro de processamento...');
    const { data: processamento, error: insertError } = await supabase
      .from('processamentos_gravacao')
      .insert({
        reuniao_id: payload.reuniao_id || null,
        nome_arquivo: payload.nome_arquivo,
        status: 'solicitando_url',
        etapa_atual: 'Solicitando URL de upload...',
        progresso: 5,
        assinaturas: payload.assinaturas || [],
        participantes: payload.participantes || [],
        pauta_id: payload.pauta_id || null,
        tarefas_marcadas: payload.tarefas_marcadas || [],
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao criar processamento:', insertError);
      throw new Error(`Erro ao criar registro: ${insertError.message}`);
    }

    console.log('Processamento criado:', processamento.id);

    // Buscar itens da pauta para Concierge Lógico
    let pautaContexto: Array<{
      tema: string;
      responsavel_nome: string;
      responsavel_cargo: string;
      hora_inicio: string | null;
      hora_fim: string | null;
    }> = [];

    if (payload.pauta_id) {
      console.log('Buscando itens da pauta para Concierge...', payload.pauta_id);
      const { data: itens, error: itensError } = await supabase
        .from('pauta_itens')
        .select(`
          tema,
          hora_inicio,
          hora_fim,
          responsavel:membros(nome, cargo)
        `)
        .eq('pauta_id', payload.pauta_id)
        .order('ordem');

      if (itensError) {
        console.error('Erro ao buscar itens da pauta:', itensError);
      } else if (itens && itens.length > 0) {
        pautaContexto = itens.map((item: any) => ({
          tema: item.tema,
          responsavel_nome: item.responsavel?.nome || 'Não definido',
          responsavel_cargo: item.responsavel?.cargo || 'Não definido',
          hora_inicio: item.hora_inicio ? item.hora_inicio.substring(0, 5) : null,
          hora_fim: item.hora_fim ? item.hora_fim.substring(0, 5) : null,
        }));
        console.log('Pauta contexto montado:', pautaContexto.length, 'itens');
      }
    }

    // Armazenar metadados no processamento para uso posterior
    await supabase
      .from('processamentos_gravacao')
      .update({
        // Salvando metadados para uso no notify-complete
        // Usaremos um campo JSONB existente ou criaremos lógica para recuperar
      })
      .eq('id', processamento.id);

    // Chamar N8N para obter URL de upload
    console.log('Chamando N8N para obter URL de upload...');
    const n8nPayload = {
      folder_id: GOOGLE_DRIVE_FOLDER_ID,
      nome_arquivo: payload.nome_arquivo,
      mime_type: payload.mime_type || 'audio/mpeg',
      tamanho_arquivo: payload.tamanho_arquivo,
      processamento_id: processamento.id,
      // Metadados para o N8N poder armazenar
      metadados: {
        client_id: 'credimogiana',
        reuniao_id: payload.reuniao_id,
        nome_reuniao: payload.nome_reuniao || 'Reunião sem título',
        data_reuniao: payload.data_reuniao || new Date().toISOString().split('T')[0],
        tipo_reuniao: payload.tipo_reuniao || 'Geral',
        participantes: payload.participantes || [],
        assinaturas: payload.assinaturas || [],
        pauta_id: payload.pauta_id,
        pauta_contexto: pautaContexto,
        tarefas_discutidas: payload.tarefas_marcadas || [],
        callback_url: `${supabaseUrl}/functions/v1/status-update`,
      },
    };

    console.log('Payload para N8N:', {
      folder_id: n8nPayload.folder_id,
      nome_arquivo: n8nPayload.nome_arquivo,
      mime_type: n8nPayload.mime_type,
      processamento_id: n8nPayload.processamento_id,
    });

    const response = await fetch(N8N_GET_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    });

    console.log('Resposta do N8N - Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro do N8N:', errorText);

      // Atualizar status para erro
      await supabase
        .from('processamentos_gravacao')
        .update({
          status: 'erro',
          etapa_atual: 'Falha ao obter URL de upload',
          erro_mensagem: `Erro N8N: ${response.status} - ${errorText}`,
        })
        .eq('id', processamento.id);

      throw new Error(`Erro ao obter URL do N8N: ${response.status}`);
    }

    const n8nResponse = await response.json();
    console.log('Resposta do N8N:', n8nResponse);

    // Atualizar status
    await supabase
      .from('processamentos_gravacao')
      .update({
        status: 'url_obtida',
        etapa_atual: 'URL de upload obtida. Aguardando envio do arquivo...',
        progresso: 10,
      })
      .eq('id', processamento.id);

    console.log('=== GET UPLOAD URL - Sucesso ===');

    return new Response(
      JSON.stringify({
        success: true,
        processamento_id: processamento.id,
        upload_url: n8nResponse.upload_url,
        file_id: n8nResponse.file_id || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno ao solicitar URL';
    console.error('=== GET UPLOAD URL - Erro ===', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
