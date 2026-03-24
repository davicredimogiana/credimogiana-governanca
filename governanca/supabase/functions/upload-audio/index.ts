import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const N8N_WEBHOOK_URL = 'https://webhook.impactautomacoesai.com.br/webhook/ega-trigger';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Recebendo requisição de upload de áudio...');
    
    const payload = await req.json();
    
    console.log('Payload recebido:', {
      nome_reuniao: payload.nome_reuniao,
      tipo_reuniao: payload.tipo_reuniao,
      participantes: payload.participantes,
      data_reuniao: payload.data_reuniao,
      file_size: payload.file_base64?.length || 0
    });

    // Validação básica
    if (!payload.file_base64) {
      console.error('Erro: arquivo não fornecido');
      return new Response(
        JSON.stringify({ error: 'Arquivo não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mapear payload para formato esperado pelo N8N
    const n8nPayload = {
      audio_file: payload.file_base64,           // N8N espera 'audio_file', não 'file_base64'
      client_id: payload.client_id || 'credimogiana',
      nome_reuniao: payload.nome_reuniao,
      data_reuniao: payload.data_reuniao || new Date().toISOString().split('T')[0],
      participantes: payload.participantes || [],
      tipo_reuniao: payload.tipo_reuniao || 'Geral'
    };

    console.log('Enviando para N8N webhook com payload mapeado:', {
      client_id: n8nPayload.client_id,
      nome_reuniao: n8nPayload.nome_reuniao,
      data_reuniao: n8nPayload.data_reuniao,
      participantes: n8nPayload.participantes,
      tipo_reuniao: n8nPayload.tipo_reuniao,
      audio_file_size: n8nPayload.audio_file?.length || 0
    });

    // Forward para o webhook N8N
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    });

    console.log('Resposta do N8N - Status:', response.status);

    const contentType = response.headers.get('content-type') || '';
    const bodyText = await response.text();

    if (!response.ok) {
      console.error('Erro do N8N:', bodyText);
      return new Response(
        JSON.stringify({
          error: 'Erro ao processar no servidor externo',
          upstream_status: response.status,
          upstream_content_type: contentType,
          details: bodyText,
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let parsed: unknown = bodyText;
    if (contentType.includes('application/json')) {
      try {
        parsed = JSON.parse(bodyText);
      } catch {
        // mantém como texto
      }
    }

    console.log('Sucesso! Resposta do N8N (preview):', typeof parsed === 'string' ? parsed.slice(0, 200) : parsed);

    return new Response(
      JSON.stringify({ success: true, upstream_status: response.status, data: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    console.error('Erro na Edge Function upload-audio:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
