/**
 * Tipos TypeScript alinhados com as entidades do backend .NET
 */

export interface Membro {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  tipo: string;
  foto?: string | null;
  ativo: boolean;
}

export interface Reuniao {
  id: string;
  titulo: string;
  data: string;
  horario?: string;
  local?: string;
  tipo: string;
  status: string;
  descricao?: string;
  pauta?: string;
  participantes?: Membro[];
  createdAt?: string;
}

export interface DecisaoIA {
  id: string;
  descricao: string;
  responsavel?: string;
  prazo?: string;
  status: string;
}

export interface AcaoIA {
  id: string;
  descricao: string;
  responsavel?: string;
  prazo?: string;
  status: string;
}

export interface RiscoIA {
  id: string;
  descricao: string;
  severidade?: string;
  mencoes: number;
}

export interface OportunidadeIA {
  id: string;
  descricao: string;
  potencial?: string;
  mencoes: number;
}

export interface AnaliseIA {
  resumo: string;
  decisoes: DecisaoIA[];
  acoes: AcaoIA[];
  riscos: RiscoIA[];
  oportunidades: OportunidadeIA[];
  sentimentoGeral: string;
}

export interface Ata {
  id: string;
  reuniaoId: string;
  conteudoMarkdown: string;
  geradaEm: string;
  status: string;
  enviadaPara: string[];
  analise: AnaliseIA;
}

export interface PautaObjetivo {
  id: string;
  pautaId: string;
  texto: string;
  ordem: number;
}

export interface PautaDado {
  id: string;
  pautaId: string;
  secaoTitulo: string;
  label: string;
  valor: string;
  ordem: number;
}

export interface PautaDiscussaoPonto {
  id: string;
  discussaoId: string;
  texto: string;
  ordem: number;
}

export interface PautaDiscussao {
  id: string;
  pautaId: string;
  topico: string;
  ordem: number;
  pontos: PautaDiscussaoPonto[];
}

export interface PautaDeliberacao {
  id: string;
  pautaId: string;
  texto: string;
  ordem: number;
}

export interface PautaEncaminhamento {
  id: string;
  pautaId: string;
  acao: string;
  responsavel: string;
  prazo: string;
  ordem: number;
}

export interface PautaItem {
  id: string;
  pautaId: string;
  responsavelId?: string;
  responsavel?: Membro;
  tema: string;
  ordem: number;
  horaInicio?: string;
  horaFim?: string;
}

export interface ReuniaoResumo {
  id: string;
  titulo: string;
}

export interface Pauta {
  id: string;
  reuniaoId?: string;
  responsavelId?: string;
  titulo: string;
  subtitulo?: string;
  contexto?: string;
  observacoes?: string;
  status: string;
  tempoPrevisto: number;
  createdAt: string;
  updatedAt: string;
  responsavel?: Membro;
  reuniao?: ReuniaoResumo;
  objetivos: PautaObjetivo[];
  dados: PautaDado[];
  discussoes: PautaDiscussao[];
  deliberacoes: PautaDeliberacao[];
  encaminhamentos: PautaEncaminhamento[];
  itens: PautaItem[];
}

export interface ProcessamentoGravacao {
  id: string;
  reuniaoId?: string;
  pautaId?: string;
  nomeArquivo: string;
  status: string;
  etapaAtual?: string;
  progresso: number;
  linkDrive?: string;
  linkArquivoProcessado?: string;
  erroMensagem?: string;
  participantes: string[];
  tarefasMarcadas: string[];
  assinaturas: { nome: string; imagem: string; hora: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface EnvioEmail {
  id: string;
  ataId?: string;
  destinatarioNome: string;
  destinatarioEmail: string;
  destinatarioCargo?: string;
  enviadoEm?: string;
  lido: boolean;
  lidoEm?: string;
  createdAt: string;
  ataResumoExecutivo?: string;
  reuniaoTitulo?: string;
  reuniaoData?: string;
}

export interface DestinatarioEmail {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  grupo: string;
  membroId?: string;
  ativo: boolean;
  origem: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TarefaDelegada {
  id: string;
  reuniaoId: string;
  reuniaoTitulo: string;
  reuniaoData: string;
  descricao: string;
  prazo: string;
  status: string;
  observacoes?: string;
  concluidaEm?: string;
  responsavel: Membro;
  atualizadoPor?: Membro;
}

export interface ConfiguracoesSistema {
  enviarEmailAutomatico: boolean;
  enviarEmailAutomaticoPautas: boolean;
  webhookN8nReceberAtas?: string;
  webhookN8nEnviarAtas?: string;
  emailRemetente?: string;
  nomeRemetente?: string;
}

export interface DashboardStats {
  totalReunioes: number;
  reunioesEsteAno: number;
  totalMembros: number;
  membrosAtivos: number;
  totalAtas: number;
  totalTarefas: number;
  tarefasPendentes: number;
  tarefasConcluidas: number;
}
