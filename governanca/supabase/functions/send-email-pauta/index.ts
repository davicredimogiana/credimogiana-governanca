import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// URL do webhook N8N para envio de e-mail
const N8N_WEBHOOK_URL = "https://webhook.impactautomacoesai.com.br/webhook/enviar-pauta-email";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { pauta_id, destinatarios } = payload;

    console.log('=== SEND EMAIL PAUTA - Início ===');
    console.log('Payload recebido:', {
      pauta_id,
      num_destinatarios: destinatarios?.length || 0,
    });

    // Validações
    if (!pauta_id) {
      console.error('Erro: pauta_id não fornecido');
      return new Response(
        JSON.stringify({ success: false, error: 'pauta_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!destinatarios || destinatarios.length === 0) {
      console.error('Erro: destinatários não fornecidos');
      return new Response(
        JSON.stringify({ success: false, error: 'Pelo menos um destinatário é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar pauta principal
    console.log('Buscando pauta...');
    const { data: pauta, error: pautaError } = await supabase
      .from('pautas')
      .select(`
        *,
        reuniao:reunioes(id, titulo, data, horario, tipo, local),
        responsavel:membros(id, nome, email, cargo)
      `)
      .eq('id', pauta_id)
      .single();

    if (pautaError) {
      console.error('Erro ao buscar pauta:', pautaError);
      throw new Error(`Pauta não encontrada: ${pautaError.message}`);
    }

    console.log('Pauta encontrada:', pauta.titulo);

    // Buscar objetivos
    const { data: objetivos } = await supabase
      .from('pauta_objetivos')
      .select('texto, ordem')
      .eq('pauta_id', pauta_id)
      .order('ordem');

    // Buscar dados apresentados
    const { data: dados } = await supabase
      .from('pauta_dados')
      .select('secao_titulo, label, valor, ordem')
      .eq('pauta_id', pauta_id)
      .order('ordem');

    // Buscar discussões
    const { data: discussoes } = await supabase
      .from('pauta_discussoes')
      .select('id, topico, ordem')
      .eq('pauta_id', pauta_id)
      .order('ordem');

    // Buscar pontos de cada discussão
    const discussoesCompletas = await Promise.all(
      (discussoes || []).map(async (disc) => {
        const { data: pontos } = await supabase
          .from('pauta_discussao_pontos')
          .select('texto, ordem')
          .eq('discussao_id', disc.id)
          .order('ordem');
        return {
          topico: disc.topico,
          pontos: (pontos || []).map(p => p.texto)
        };
      })
    );

    // Buscar deliberações
    const { data: deliberacoes } = await supabase
      .from('pauta_deliberacoes')
      .select('texto, ordem')
      .eq('pauta_id', pauta_id)
      .order('ordem');

    // Buscar encaminhamentos
    const { data: encaminhamentos } = await supabase
      .from('pauta_encaminhamentos')
      .select('acao, responsavel, prazo, ordem')
      .eq('pauta_id', pauta_id)
      .order('ordem');

    // Agrupar dados por seção
    const dadosAgrupados = (dados || []).reduce((acc: any[], item) => {
      const secaoExistente = acc.find(s => s.titulo === item.secao_titulo);
      if (secaoExistente) {
        secaoExistente.itens.push({ label: item.label, valor: item.valor });
      } else {
        acc.push({
          titulo: item.secao_titulo,
          itens: [{ label: item.label, valor: item.valor }]
        });
      }
      return acc;
    }, []);

    // Montar payload completo para N8N
    const n8nPayload = {
      client_id: 'credimogiana',
      pauta: {
        id: pauta.id,
        titulo: pauta.titulo,
        subtitulo: pauta.subtitulo,
        contexto: pauta.contexto,
        observacoes: pauta.observacoes,
        status: pauta.status,
        tempo_previsto: pauta.tempo_previsto,
        created_at: pauta.created_at,
      },
      reuniao: pauta.reuniao ? {
        titulo: pauta.reuniao.titulo,
        data: pauta.reuniao.data,
        horario: pauta.reuniao.horario,
        tipo: pauta.reuniao.tipo,
        local: pauta.reuniao.local,
      } : null,
      responsavel: pauta.responsavel ? {
        nome: pauta.responsavel.nome,
        email: pauta.responsavel.email,
        cargo: pauta.responsavel.cargo,
      } : null,
      conteudo: {
        objetivos: (objetivos || []).map(o => o.texto),
        dados_apresentados: dadosAgrupados,
        discussoes: discussoesCompletas,
        deliberacoes: (deliberacoes || []).map(d => d.texto),
        encaminhamentos: (encaminhamentos || []).map(e => ({
          acao: e.acao,
          responsavel: e.responsavel,
          prazo: e.prazo
        }))
      },
      destinatarios: destinatarios.map((d: any) => ({
        nome: d.nome,
        email: d.email,
        cargo: d.cargo
      })),
      enviado_em: new Date().toISOString(),
    };

    console.log('Enviando para N8N webhook:', {
      pauta_titulo: n8nPayload.pauta.titulo,
      num_destinatarios: n8nPayload.destinatarios.length,
      num_objetivos: n8nPayload.conteudo.objetivos.length,
      num_discussoes: n8nPayload.conteudo.discussoes.length,
      num_deliberacoes: n8nPayload.conteudo.deliberacoes.length,
      num_encaminhamentos: n8nPayload.conteudo.encaminhamentos.length,
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
      throw new Error(`Erro ao enviar para N8N: ${response.status} - ${errorText}`);
    }

    const responseData = await response.text();
    console.log('Resposta do N8N:', responseData);
    console.log('=== SEND EMAIL PAUTA - Sucesso ===');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pauta enviada por e-mail com sucesso',
        destinatarios_count: destinatarios.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno ao enviar e-mail';
    console.error('=== SEND EMAIL PAUTA - Erro ===', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
