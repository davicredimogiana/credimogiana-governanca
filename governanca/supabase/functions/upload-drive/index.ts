import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URL do webhook N8N para processamento de atas (EGA Trigger)
const N8N_WEBHOOK_URL = "https://webhook.impactautomacoesai.com.br/webhook/ega-trigger";

// ID da pasta no Google Drive
const GOOGLE_DRIVE_FOLDER_ID = "198TmXUi5GWEr4roSjjm9Ir28irWKd8Dp";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    console.log('=== UPLOAD DRIVE - Início ===');
    console.log('Action:', payload.action || 'legacy');

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ========================================
    // MODO 1: NOTIFICAR CONCLUSÃO DO UPLOAD
    // ========================================
    if (payload.action === 'notify-complete') {
      console.log('Modo: notify-complete');
      console.log('Payload:', {
        processamento_id: payload.processamento_id,
        file_id: payload.file_id,
        link_drive: payload.link_drive,
      });

      if (!payload.processamento_id) {
        return new Response(
          JSON.stringify({ success: false, error: 'processamento_id é obrigatório' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Buscar dados do processamento
      const { data: processamento, error: fetchError } = await supabase
        .from('processamentos_gravacao')
        .select('*')
        .eq('id', payload.processamento_id)
        .single();

      if (fetchError || !processamento) {
        console.error('Erro ao buscar processamento:', fetchError);
        return new Response(
          JSON.stringify({ success: false, error: 'Processamento não encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Buscar itens da pauta para Concierge Lógico
      let pautaContexto: Array<{
        tema: string;
        responsavel_nome: string;
        responsavel_cargo: string;
        hora_inicio: string | null;
        hora_fim: string | null;
      }> = [];

      if (processamento.pauta_id) {
        console.log('Buscando itens da pauta...', processamento.pauta_id);
        const { data: itens, error: itensError } = await supabase
          .from('pauta_itens')
          .select(`
            tema,
            hora_inicio,
            hora_fim,
            responsavel:membros(nome, cargo)
          `)
          .eq('pauta_id', processamento.pauta_id)
          .order('ordem');

        if (!itensError && itens && itens.length > 0) {
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

      // Buscar dados da reunião
      let nomeReuniao = 'Reunião sem título';
      let dataReuniao = new Date().toISOString().split('T')[0];
      let tipoReuniao = 'Geral';

      if (processamento.reuniao_id) {
        const { data: reuniao } = await supabase
          .from('reunioes')
          .select('titulo, data, tipo')
          .eq('id', processamento.reuniao_id)
          .single();

        if (reuniao) {
          nomeReuniao = reuniao.titulo;
          dataReuniao = reuniao.data;
          tipoReuniao = reuniao.tipo;
        }
      }

      // Atualizar status para "enviado"
      await supabase
        .from('processamentos_gravacao')
        .update({
          status: 'enviado_drive',
          etapa_atual: 'Arquivo enviado, iniciando processamento...',
          progresso: 30,
          link_drive: payload.link_drive || null,
        })
        .eq('id', payload.processamento_id);

      // Montar payload para N8N (sem arquivo binário!)
      const n8nPayload = {
        client_id: 'credimogiana',
        processamento_id: processamento.id,
        file_id: payload.file_id,
        link_drive: payload.link_drive,
        reuniao_id: processamento.reuniao_id,
        nome_reuniao: nomeReuniao,
        data_reuniao: dataReuniao,
        tipo_reuniao: tipoReuniao,
        participantes: processamento.participantes || [],
        assinaturas: processamento.assinaturas || [],
        tarefas_discutidas: processamento.tarefas_marcadas || [],
        pauta_id: processamento.pauta_id,
        pauta_contexto: pautaContexto,
        folder_id: GOOGLE_DRIVE_FOLDER_ID,
        callback_url: `${supabaseUrl}/functions/v1/status-update`,
        // SEM audio_file - arquivo já está no Drive!
      };

      console.log('Enviando notificação para N8N:', {
        processamento_id: n8nPayload.processamento_id,
        file_id: n8nPayload.file_id,
        nome_reuniao: n8nPayload.nome_reuniao,
      });

      // Enviar para N8N
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nPayload),
      });

      console.log('Resposta do N8N - Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro do N8N:', errorText);

        await supabase
          .from('processamentos_gravacao')
          .update({
            status: 'erro',
            etapa_atual: 'Falha ao notificar processamento',
            erro_mensagem: `Erro N8N: ${response.status}`,
          })
          .eq('id', payload.processamento_id);

        throw new Error(`Erro ao notificar N8N: ${response.status}`);
      }

      console.log('=== UPLOAD DRIVE (notify-complete) - Sucesso ===');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Processamento iniciado com sucesso',
          processamento_id: processamento.id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================
    // MODO 2: LEGACY - Upload com arquivo Base64
    // (mantido para compatibilidade, mas com aviso)
    // ========================================
    console.log('Modo: legacy (com arquivo base64)');
    console.log('AVISO: Este modo está deprecated. Use get-upload-url + notify-complete.');

    console.log('Payload recebido:', {
      reuniao_id: payload.reuniao_id,
      nome_reuniao: payload.nome_reuniao,
      data_reuniao: payload.data_reuniao,
      tipo_reuniao: payload.tipo_reuniao,
      participantes: payload.participantes,
      num_assinaturas: payload.assinaturas?.length || 0,
      num_tarefas_marcadas: payload.tarefas_marcadas?.length || 0,
      pauta_id: payload.pauta_id,
      file_size: payload.audio_file?.length || 0,
    });

    // Validações
    if (!payload.audio_file) {
      console.error('Erro: Arquivo de áudio não fornecido');
      return new Response(
        JSON.stringify({ success: false, error: 'Arquivo de áudio é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar tamanho (alertar se muito grande)
    const fileSizeBytes = payload.audio_file.length * 0.75; // Base64 é ~33% maior
    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    console.log(`Tamanho estimado do arquivo: ${fileSizeMB.toFixed(2)} MB`);

    if (fileSizeMB > 15) {
      console.warn('AVISO: Arquivo muito grande para modo legacy. Use upload direto.');
    }

    // Criar registro de processamento
    console.log('Criando registro de processamento...');
    const { data: processamento, error: insertError } = await supabase
      .from('processamentos_gravacao')
      .insert({
        reuniao_id: payload.reuniao_id || null,
        nome_arquivo: payload.nome_arquivo || 'gravacao.mp3',
        status: 'enviando',
        etapa_atual: 'Enviando para Google Drive...',
        progresso: 10,
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

    // Montar payload para N8N
    const n8nPayload = {
      audio_file: payload.audio_file,
      client_id: 'credimogiana',
      processamento_id: processamento.id,
      reuniao_id: payload.reuniao_id,
      nome_reuniao: payload.nome_reuniao || 'Reunião sem título',
      data_reuniao: payload.data_reuniao || new Date().toISOString().split('T')[0],
      tipo_reuniao: payload.tipo_reuniao || 'Geral',
      participantes: payload.participantes || [],
      assinaturas: payload.assinaturas || [],
      tarefas_discutidas: payload.tarefas_marcadas || [],
      pauta_id: payload.pauta_id,
      pauta_contexto: pautaContexto,
      folder_id: GOOGLE_DRIVE_FOLDER_ID,
      callback_url: `${supabaseUrl}/functions/v1/status-update`,
    };

    console.log('Enviando para N8N webhook:', {
      processamento_id: n8nPayload.processamento_id,
      nome_reuniao: n8nPayload.nome_reuniao,
      data_reuniao: n8nPayload.data_reuniao,
      callback_url: n8nPayload.callback_url,
      audio_file_size: n8nPayload.audio_file?.length || 0,
    });

    // Enviar para N8N
    const response = await fetch(N8N_WEBHOOK_URL, {
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
          etapa_atual: 'Falha ao enviar para processamento',
          erro_mensagem: `Erro N8N: ${response.status} - ${errorText}`,
        })
        .eq('id', processamento.id);

      throw new Error(`Erro ao enviar para N8N: ${response.status}`);
    }

    // Atualizar status para enviado
    await supabase
      .from('processamentos_gravacao')
      .update({
        status: 'enviado_drive',
        etapa_atual: 'Arquivo enviado, aguardando processamento...',
        progresso: 25,
      })
      .eq('id', processamento.id);

    const responseData = await response.text();
    console.log('Resposta do N8N:', responseData);
    console.log('=== UPLOAD DRIVE - Sucesso ===');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Gravação enviada com sucesso',
        processamento_id: processamento.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno ao processar gravação';
    console.error('=== UPLOAD DRIVE - Erro ===', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
