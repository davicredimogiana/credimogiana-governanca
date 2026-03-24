import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface N8NPayload {
  reuniao_id?: string;
  titulo?: string;
  data?: string;
  resumo?: string;
  total_decisoes?: number;
  total_acoes?: number;
  total_riscos?: number;
  total_oportunidades?: number;
  link_drive?: string;
  link_auditoria?: string;
  ata_markdown?: string;
  tom_geral?: string;
  urgencia?: string;
  decisoes?: Array<{
    descricao: string;
    responsavel?: string;
    prazo?: string;
  }>;
  acoes?: Array<{
    descricao: string;
    responsavel?: string;
    prazo?: string;
  }>;
  riscos?: Array<{
    descricao: string;
    severidade?: string;
    mencoes?: number;
  }>;
  oportunidades?: Array<{
    descricao: string;
    potencial?: string;
    mencoes?: number;
  }>;
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

    const payload: N8NPayload = await req.json();
    
    console.log('📥 Payload recebido do N8N:', JSON.stringify(payload, null, 2));

    if (!payload.ata_markdown && !payload.resumo) {
      console.error('❌ Payload inválido: falta conteúdo da ata');
      return new Response(
        JSON.stringify({ success: false, error: 'Payload inválido: é necessário enviar ata_markdown ou resumo' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar reunião se título e data fornecidos
    let reuniaoId = null;
    if (payload.titulo && payload.data) {
      console.log(`🔍 Buscando reunião: ${payload.titulo} em ${payload.data}`);
      const { data: reuniao } = await supabase
        .from('reunioes')
        .select('id')
        .eq('titulo', payload.titulo)
        .eq('data', payload.data)
        .maybeSingle();
      
      if (reuniao) {
        reuniaoId = reuniao.id;
        console.log(`✅ Reunião encontrada: ${reuniaoId}`);
      } else {
        console.log('⚠️ Reunião não encontrada no sistema');
      }
    }

    // === VALIDAÇÃO DO RESUMO ===
    let resumoFinal = payload.resumo || '';
    const markdownContent = payload.ata_markdown || '';

    if (isResumoInvalido(resumoFinal)) {
      console.log('⚠️ Resumo do N8N é inválido ou contém erro da IA, tentando extrair do markdown...');
      const resumoExtraido = extrairResumoDoMarkdown(markdownContent);
      if (resumoExtraido) {
        resumoFinal = resumoExtraido;
        console.log('✅ Resumo extraído do markdown com sucesso');
      } else {
        console.log('⚠️ Não foi possível extrair resumo do markdown, salvando vazio');
        resumoFinal = '';
      }
    } else {
      console.log('✅ Resumo do N8N é válido');
    }

    // Inserir ata
    const ataData = {
      reuniao_id: reuniaoId,
      n8n_reuniao_id: payload.reuniao_id || null,
      conteudo_markdown: markdownContent || resumoFinal,
      link_drive: payload.link_drive || null,
      link_auditoria: payload.link_auditoria || null,
      resumo_executivo: resumoFinal || null,
      tom_geral: payload.tom_geral || 'neutro',
      urgencia: payload.urgencia || 'media',
      total_decisoes: payload.total_decisoes || 0,
      total_acoes: payload.total_acoes || 0,
      total_riscos: payload.total_riscos || 0,
      total_oportunidades: payload.total_oportunidades || 0,
      status: 'recebida',
    };

    console.log('💾 Inserindo ata...');

    const { data: ata, error: ataError } = await supabase
      .from('atas')
      .insert(ataData)
      .select()
      .single();

    if (ataError) {
      console.error('❌ Erro ao inserir ata:', ataError);
      throw new Error(`Erro ao salvar ata: ${ataError.message}`);
    }

    console.log(`✅ Ata criada com ID: ${ata.id}`);

    // Atualizar processamento para concluido
    if (payload.reuniao_id) {
      console.log(`🔄 Atualizando processamento ${payload.reuniao_id} para concluido`);
      const { error: updateProcessamentoError } = await supabase
        .from('processamentos_gravacao')
        .update({
          status: 'concluido',
          progresso: 100,
          etapa_atual: 'Processamento concluído com sucesso!',
        })
        .eq('id', payload.reuniao_id);
        
      if (updateProcessamentoError) {
        console.error('⚠️ Erro ao atualizar processamento:', updateProcessamentoError);
      } else {
        console.log('✅ Processamento atualizado para concluido');
      }
    }

    // Inserir decisões
    if (payload.decisoes && payload.decisoes.length > 0) {
      console.log(`📝 Inserindo ${payload.decisoes.length} decisões`);
      const decisoesData = payload.decisoes.map(d => ({
        ata_id: ata.id,
        descricao: d.descricao,
        responsavel: d.responsavel || null,
        prazo: d.prazo || null,
        status: 'pendente',
      }));
      const { error: decisoesError } = await supabase.from('decisoes_ia').insert(decisoesData);
      if (decisoesError) console.error('⚠️ Erro ao inserir decisões:', decisoesError);
    }

    // Inserir ações
    if (payload.acoes && payload.acoes.length > 0) {
      console.log(`📝 Inserindo ${payload.acoes.length} ações`);
      const acoesData = payload.acoes.map(a => ({
        ata_id: ata.id,
        descricao: a.descricao,
        responsavel: a.responsavel || null,
        prazo: a.prazo || null,
        status: 'pendente',
      }));
      const { error: acoesError } = await supabase.from('acoes_ia').insert(acoesData);
      if (acoesError) console.error('⚠️ Erro ao inserir ações:', acoesError);
    }

    // Inserir riscos
    if (payload.riscos && payload.riscos.length > 0) {
      console.log(`📝 Inserindo ${payload.riscos.length} riscos`);
      const riscosData = payload.riscos.map(r => ({
        ata_id: ata.id,
        descricao: r.descricao,
        severidade: r.severidade || 'media',
        mencoes: r.mencoes || 0,
      }));
      const { error: riscosError } = await supabase.from('riscos_ia').insert(riscosData);
      if (riscosError) console.error('⚠️ Erro ao inserir riscos:', riscosError);
    }

    // Inserir oportunidades
    if (payload.oportunidades && payload.oportunidades.length > 0) {
      console.log(`📝 Inserindo ${payload.oportunidades.length} oportunidades`);
      const oportunidadesData = payload.oportunidades.map(o => ({
        ata_id: ata.id,
        descricao: o.descricao,
        potencial: o.potencial || 'medio',
        mencoes: o.mencoes || 0,
      }));
      const { error: oportunidadesError } = await supabase.from('oportunidades_ia').insert(oportunidadesData);
      if (oportunidadesError) console.error('⚠️ Erro ao inserir oportunidades:', oportunidadesError);
    }

    console.log('✅ Processamento concluído com sucesso');

    // Verificar envio automático
    const { data: configData } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'envio_automatico_atas')
      .single();

    if (configData?.valor?.ativo) {
      console.log('📧 Envio automático ativado, buscando destinatários...');
      const { data: destinatarios } = await supabase
        .from('destinatarios')
        .select('nome, cargo, email')
        .eq('ativo', true);
      
      if (destinatarios && destinatarios.length > 0) {
        console.log(`📧 Disparando envio para ${destinatarios.length} destinatário(s)`);
        try {
          const sendResponse = await fetch(`${supabaseUrl}/functions/v1/send-email-ata`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ ata_id: ata.id, destinatarios })
          });
          
          if (sendResponse.ok) {
            console.log('✅ E-mail automático disparado com sucesso');
          } else {
            console.error('⚠️ Erro ao disparar e-mail automático:', await sendResponse.text());
          }
        } catch (emailError) {
          console.error('⚠️ Erro ao chamar send-email-ata:', emailError);
        }
      } else {
        console.log('⚠️ Nenhum destinatário ativo para envio automático');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ata recebida e processada com sucesso',
        ata_id: ata.id,
        reuniao_vinculada: reuniaoId ? true : false,
        envio_automatico: configData?.valor?.ativo || false,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro no webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
