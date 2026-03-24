import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== UPLOAD CHUNK - Início ===');
    
    const formData = await req.formData();
    
    const chunk = formData.get('chunk') as Blob;
    const uploadUrl = formData.get('upload_url') as string;
    const startByte = parseInt(formData.get('start_byte') as string);
    const endByte = parseInt(formData.get('end_byte') as string);
    const totalSize = parseInt(formData.get('total_size') as string);

    // Validações
    if (!chunk) {
      console.error('Erro: Chunk não fornecido');
      return new Response(
        JSON.stringify({ success: false, error: 'Chunk não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!uploadUrl) {
      console.error('Erro: URL de upload não fornecida');
      return new Response(
        JSON.stringify({ success: false, error: 'URL de upload não fornecida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (isNaN(startByte) || isNaN(endByte) || isNaN(totalSize)) {
      console.error('Erro: Parâmetros de range inválidos');
      return new Response(
        JSON.stringify({ success: false, error: 'Parâmetros de range inválidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Upload chunk: bytes ${startByte}-${endByte}/${totalSize} (${chunk.size} bytes)`);

    // Fazer upload para Google Drive (server-side, sem CORS)
    const chunkBuffer = await chunk.arrayBuffer();
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Range': `bytes ${startByte}-${endByte}/${totalSize}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': chunkBuffer.byteLength.toString(),
      },
      body: chunkBuffer,
    });

    console.log(`Resposta Google Drive: ${response.status}`);

    // 308 = continuar (Resume Incomplete), significa que o chunk foi aceito
    if (response.status === 308) {
      const rangeHeader = response.headers.get('Range');
      console.log(`Chunk aceito, Range: ${rangeHeader}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 308,
          message: 'Chunk uploaded, continue',
          range: rangeHeader,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 200 ou 201 = upload completo
    if (response.ok) {
      const result = await response.json();
      console.log('Upload completo! File ID:', result.id);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: response.status,
          file_id: result.id,
          message: 'Upload complete',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Outros status são erros
    const errorText = await response.text();
    console.error(`Erro do Google Drive: ${response.status} - ${errorText}`);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Google Drive retornou ${response.status}: ${errorText}`,
        status: response.status,
      }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno ao processar chunk';
    console.error('=== UPLOAD CHUNK - Erro ===', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
