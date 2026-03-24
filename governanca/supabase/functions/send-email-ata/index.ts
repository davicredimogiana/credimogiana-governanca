import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Destinatario {
  nome: string;
  email: string;
  cargo?: string;
}

interface RequestPayload {
  ata_id: string;
  destinatarios: Destinatario[];
}

// Padrões ampliados para detectar resumos inválidos gerados por erro da IA
const INVALID_RESUMO_PATTERNS = [
  'Parece que',
  'transcrição fornecida',
  'não contém informações',
  'não forneceu detalhes',
  'não foi possível',
  'está incompleta',
  'forneça os detalhes',
  'forneça informações',
  'não há informações suficientes',
  'não consegui identificar',
  'não é possível gerar',
  'não possui informações',
];

function isResumoInvalido(resumo: string | null | undefined): boolean {
  if (!resumo || resumo.trim().length < 30) return true;
  const lower = resumo.toLowerCase();
  return INVALID_RESUMO_PATTERNS.some(pattern => lower.includes(pattern.toLowerCase()));
}

function extrairResumoDoMarkdown(markdown: string): string {
  // Tentar extrair seção "VISÃO GERAL E CONTEXTO"
  const visaoGeralMatch = markdown.match(
    /## 1\. VIS[ÃA]O GERAL E CONTEXTO[\s\S]*?\n\n([\s\S]*?)(?=\n---|\n## \d|$)/i
  );
  if (visaoGeralMatch && visaoGeralMatch[1] && visaoGeralMatch[1].trim().length > 50) {
    return visaoGeralMatch[1].trim();
  }

  // Fallback: tentar seção "RESUMO EXECUTIVO"
  const resumoMatch = markdown.match(
    /## (?:\d+\.\s*)?RESUMO[\s\S]*?\n\n([\s\S]*?)(?=\n---|\n## \d|$)/i
  );
  if (resumoMatch && resumoMatch[1] && resumoMatch[1].trim().length > 50) {
    return resumoMatch[1].trim();
  }

  // Fallback: primeiros parágrafos após o título
  const paragrafosMatch = markdown.match(/^#[^\n]+\n\n([\s\S]{100,1500}?)(?=\n\n|\n##|\n---)/);
  if (paragrafosMatch && paragrafosMatch[1]) {
    return paragrafosMatch[1].trim();
  }

  return '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: RequestPayload = await req.json();

    console.log('📧 Iniciando envio de ata por e-mail');
    console.log(`   Ata ID: ${payload.ata_id}`);
    console.log(`   Destinatários: ${payload.destinatarios.length}`);

    if (!payload.ata_id || !payload.destinatarios || payload.destinatarios.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payload inválido: ata_id e destinatarios são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar dados da ata
    const { data: ata, error: ataError } = await supabase
      .from('atas')
      .select(`
        *,
        reuniao:reunioes(titulo, data, horario, tipo)
      `)
      .eq('id', payload.ata_id)
      .single();

    if (ataError || !ata) {
      console.error('❌ Ata não encontrada:', ataError);
      return new Response(
        JSON.stringify({ success: false, error: 'Ata não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar decisões, ações, riscos e oportunidades
    const [decisoesRes, acoesRes, riscosRes, oportunidadesRes] = await Promise.all([
      supabase.from('decisoes_ia').select('*').eq('ata_id', payload.ata_id),
      supabase.from('acoes_ia').select('*').eq('ata_id', payload.ata_id),
      supabase.from('riscos_ia').select('*').eq('ata_id', payload.ata_id),
      supabase.from('oportunidades_ia').select('*').eq('ata_id', payload.ata_id),
    ]);

    // Extrair título do markdown se não houver reunião vinculada
    let titulo = ata.reuniao?.titulo || 'Ata de Reunião';
    const markdownMatch = ata.conteudo_markdown.match(/^#\s*ATA DE REUNIÃO\s*[-–]\s*(.+)/m);
    if (markdownMatch) {
      titulo = markdownMatch[1].replace(/_/g, ' ').trim();
    }

    // === VALIDAÇÃO DO RESUMO COM PADRÕES AMPLIADOS ===
    let resumoFinal = ata.resumo_executivo || '';

    if (isResumoInvalido(resumoFinal)) {
      console.log('⚠️ Resumo executivo inválido detectado, extraindo do markdown...');
      const resumoExtraido = extrairResumoDoMarkdown(ata.conteudo_markdown);
      if (resumoExtraido) {
        resumoFinal = resumoExtraido;
        console.log('✅ Resumo extraído do markdown com sucesso');
      } else {
        console.log('⚠️ Não foi possível extrair resumo do markdown');
      }
    }

    // Montar payload para N8N
    const n8nPayload = {
      client_id: 'credimogiana',
      tipo_envio: 'ata',
      ata: {
        id: ata.id,
        titulo,
        resumo_executivo: resumoFinal,
        conteudo_markdown: ata.conteudo_markdown,
        link_drive: ata.link_drive,
        link_auditoria: ata.link_auditoria,
        total_decisoes: ata.total_decisoes,
        total_acoes: ata.total_acoes,
        total_riscos: ata.total_riscos,
        total_oportunidades: ata.total_oportunidades,
        recebida_em: ata.recebida_em,
      },
      reuniao: ata.reuniao ? {
        titulo: ata.reuniao.titulo,
        data: ata.reuniao.data,
        horario: ata.reuniao.horario,
        tipo: ata.reuniao.tipo,
      } : null,
      decisoes: decisoesRes.data || [],
      acoes: acoesRes.data || [],
      riscos: riscosRes.data || [],
      oportunidades: oportunidadesRes.data || [],
      destinatarios: payload.destinatarios,
      enviado_em: new Date().toISOString(),
    };

    console.log('📤 Enviando para N8N...');

    const webhookUrl = 'https://webhook.impactautomacoesai.com.br/webhook/enviar-ata-email';
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('❌ Erro no webhook N8N:', errorText);
      throw new Error(`Webhook N8N retornou status ${n8nResponse.status}`);
    }

    console.log('✅ E-mail enviado com sucesso');

    // Salvar registros de envio
    const enviosParaSalvar = payload.destinatarios.map((dest: Destinatario) => ({
      ata_id: payload.ata_id,
      destinatario_nome: dest.nome,
      destinatario_email: dest.email,
      destinatario_cargo: dest.cargo || null,
      enviado_em: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('envios_email')
      .insert(enviosParaSalvar);

    if (insertError) {
      console.error('⚠️ Erro ao salvar registros de envio (e-mail foi enviado):', insertError);
    } else {
      console.log(`📊 ${enviosParaSalvar.length} registros salvos em envios_email`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'E-mail enviado com sucesso',
        destinatarios_count: payload.destinatarios.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro no envio de e-mail:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
