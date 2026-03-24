// Tipos para o sistema de Governança Mogiana

export type TipoMembro = 'diretoria' | 'gestor' | 'lider' | 'cooperado';

export type StatusReuniao = 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';

export type StatusPauta = 'pendente' | 'em_discussao' | 'aprovada' | 'rejeitada';

export type StatusAcao = 'pendente' | 'em_progresso' | 'concluida' | 'atrasada';

export interface Membro {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  tipo: TipoMembro;
  foto?: string;
  ativo: boolean;
}

export interface PautaItem {
  id: string;
  titulo: string;
  descricao: string;
  responsavel: Membro;
  tempoPrevisto: number; // em minutos
  status: StatusPauta;
  observacoes?: string;
  anexos?: string[];
}

export interface Reuniao {
  id: string;
  titulo: string;
  descricao?: string;
  data: string;
  horario: string;
  duracao: number; // em minutos
  local?: string;
  plataforma?: string;
  status: StatusReuniao;
  tipo: 'diretoria' | 'gestores' | 'lideres' | 'geral';
  participantes: Membro[];
  pautas: PautaItem[];
  transcricao?: Transcricao;
  ata?: Ata;
  criadoPor: Membro;
  criadoEm: string;
}

export interface Transcricao {
  id: string;
  reuniaoId: string;
  textoCompleto: string;
  duracaoAudio: number; // em segundos
  processadoEm: string;
  status: 'processando' | 'concluido' | 'erro';
}

export interface AnaliseIA {
  resumoExecutivo: string;
  principaisTopicos: string[];
  decisoes: Decisao[];
  acoes: Acao[];
  riscosIdentificados: Risco[];
  oportunidadesIdentificadas: Oportunidade[];
  metricasCitadas: Metrica[];
  projetosMencionados: string[];
  analiseSentimento: {
    tomGeral: 'positivo' | 'neutro' | 'negativo';
    confianca: 'alta' | 'media' | 'baixa';
    urgencia: 'alta' | 'media' | 'baixa';
  };
}

export interface Decisao {
  id: string;
  descricao: string;
  responsavel: string;
  prazo?: string;
  status: StatusAcao;
}

export interface Acao {
  id: string;
  descricao: string;
  responsavel: string;
  prazo: string;
  status: StatusAcao;
}

export interface Risco {
  id: string;
  descricao: string;
  severidade: 'alta' | 'media' | 'baixa';
  mencoes: number;
}

export interface Oportunidade {
  id: string;
  descricao: string;
  potencial: 'alto' | 'medio' | 'baixo';
  mencoes: number;
}

export interface Metrica {
  nome: string;
  valor: string;
  contexto: string;
}

export interface Ata {
  id: string;
  reuniaoId: string;
  conteudoMarkdown: string;
  analise: AnaliseIA;
  geradaEm: string;
  enviadaPara: string[];
  status: 'rascunho' | 'revisao' | 'aprovada' | 'enviada';
}

export interface DestinatarioEmail {
  id: string;
  membro: Membro;
  tiposReuniao: Reuniao['tipo'][];
  receberAtas: boolean;
  receberPautas: boolean;
  receberLembretes: boolean;
}

export interface EstatisticasDashboard {
  reunioesTotais: number;
  reunioesEsteMes: number;
  pautasPendentes: number;
  acoesPendentes: number;
  acoesAtrasadas: number;
  participacaoMedia: number;
  proximaReuniao?: Reuniao;
}

export type StatusTarefa = 'pendente' | 'em_andamento' | 'concluida' | 'nao_realizada';

export interface TarefaDelegada {
  id: string;
  reuniaoId: string;
  reuniaoTitulo: string;
  reuniaoData: string;
  descricao: string;
  responsavel: Membro;
  prazo: string;
  status: StatusTarefa;
  observacoes?: string;
  concluidaEm?: string;
  atualizadoPor?: Membro;
}
