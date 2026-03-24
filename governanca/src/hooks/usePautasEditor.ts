import { api } from '@/lib/api';
import type { PautaObjetivo, PautaDado, PautaDiscussao, PautaDiscussaoPonto, PautaDeliberacao, PautaEncaminhamento, Pauta } from '@/types/api';

// CRUD Objetivos
export async function adicionarObjetivo(pautaId: string, texto: string, ordem: number): Promise<PautaObjetivo> {
  return api.post<PautaObjetivo>(`/api/pautas/${pautaId}/objetivos`, { texto, ordem });
}
export async function atualizarObjetivo(id: string, texto: string): Promise<void> {
  await api.put(`/api/pautas/objetivos/${id}`, { texto, ordem: 0 });
}
export async function excluirObjetivo(id: string): Promise<void> {
  await api.delete(`/api/pautas/objetivos/${id}`);
}

// CRUD Dados
export async function adicionarDado(pautaId: string, dado: Omit<PautaDado, 'id' | 'pautaId'>): Promise<PautaDado> {
  return api.post<PautaDado>(`/api/pautas/${pautaId}/dados`, dado);
}
export async function atualizarDado(id: string, dado: Partial<PautaDado>): Promise<void> {
  await api.put(`/api/pautas/dados/${id}`, dado);
}
export async function excluirDado(id: string): Promise<void> {
  await api.delete(`/api/pautas/dados/${id}`);
}

// CRUD Discussões
export async function adicionarDiscussao(pautaId: string, topico: string, ordem: number): Promise<PautaDiscussao> {
  return api.post<PautaDiscussao>(`/api/pautas/${pautaId}/discussoes`, { topico, ordem });
}
export async function atualizarDiscussao(id: string, topico: string): Promise<void> {
  await api.put(`/api/pautas/discussoes/${id}`, { topico, ordem: 0 });
}
export async function excluirDiscussao(id: string): Promise<void> {
  await api.delete(`/api/pautas/discussoes/${id}`);
}

// CRUD Pontos de Discussão
export async function adicionarPontoDiscussao(discussaoId: string, texto: string, ordem: number): Promise<PautaDiscussaoPonto> {
  return api.post<PautaDiscussaoPonto>(`/api/pautas/discussoes/${discussaoId}/pontos`, { texto, ordem });
}
export async function atualizarPontoDiscussao(id: string, texto: string): Promise<void> {
  await api.put(`/api/pautas/discussoes/pontos/${id}`, { texto, ordem: 0 });
}
export async function excluirPontoDiscussao(id: string): Promise<void> {
  await api.delete(`/api/pautas/discussoes/pontos/${id}`);
}

// CRUD Deliberações
export async function adicionarDeliberacao(pautaId: string, texto: string, ordem: number): Promise<PautaDeliberacao> {
  return api.post<PautaDeliberacao>(`/api/pautas/${pautaId}/deliberacoes`, { texto, ordem });
}
export async function atualizarDeliberacao(id: string, texto: string): Promise<void> {
  await api.put(`/api/pautas/deliberacoes/${id}`, { texto, ordem: 0 });
}
export async function excluirDeliberacao(id: string): Promise<void> {
  await api.delete(`/api/pautas/deliberacoes/${id}`);
}

// CRUD Encaminhamentos
export async function adicionarEncaminhamento(pautaId: string, dados: { acao: string; responsavel: string; prazo: string; ordem: number }): Promise<PautaEncaminhamento> {
  return api.post<PautaEncaminhamento>(`/api/pautas/${pautaId}/encaminhamentos`, dados);
}
export async function atualizarEncaminhamento(id: string, dados: { acao?: string; responsavel?: string; prazo?: string }): Promise<void> {
  await api.put(`/api/pautas/encaminhamentos/${id}`, dados);
}
export async function excluirEncaminhamento(id: string): Promise<void> {
  await api.delete(`/api/pautas/encaminhamentos/${id}`);
}

// Atualizar dados gerais da Pauta
export async function atualizarPauta(id: string, dados: { titulo?: string; subtitulo?: string | null; contexto?: string | null; observacoes?: string | null; status?: string; responsavel_id?: string | null; reuniao_id?: string | null; tempo_previsto?: number | null }): Promise<void> {
  await api.put(`/api/pautas/${id}`, dados);
}

// CRUD Itens de Pauta
export async function adicionarItemPauta(pautaId: string, dados: { tema: string; responsavel_id?: string | null; hora_inicio?: string | null; hora_fim?: string | null; ordem: number }): Promise<{ id: string; tema: string; responsavel_id: string | null; ordem: number; hora_inicio: string | null; hora_fim: string | null }> {
  return api.post(`/api/pautas/${pautaId}/itens`, dados);
}
export async function atualizarItemPauta(id: string, dados: { tema?: string; responsavel_id?: string | null; hora_inicio?: string | null; hora_fim?: string | null }): Promise<void> {
  await api.put(`/api/pautas/itens/${id}`, dados);
}
export async function excluirItemPauta(id: string): Promise<void> {
  await api.delete(`/api/pautas/itens/${id}`);
}

// Fetch completo para edição
export async function fetchPautaParaEdicao(pautaId: string): Promise<Pauta> {
  return api.get<Pauta>(`/api/pautas/${pautaId}`);
}
