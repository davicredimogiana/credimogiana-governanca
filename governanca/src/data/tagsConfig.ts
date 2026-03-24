export const TAGS_DISPONIVEIS = [
  { value: 'cartao_credito', label: 'Cartão de Crédito', color: 'bg-violet-500/20 text-violet-700 border-violet-500/30' },
  { value: 'cartao_debito', label: 'Cartão de Débito', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
  { value: 'credito', label: 'Crédito', color: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30' },
  { value: 'emprestimo', label: 'Empréstimo', color: 'bg-orange-500/20 text-orange-700 border-orange-500/30' },
  { value: 'investimento', label: 'Investimento', color: 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30' },
  { value: 'consignado', label: 'Consignado', color: 'bg-pink-500/20 text-pink-700 border-pink-500/30' },
  { value: 'poupanca', label: 'Poupança', color: 'bg-lime-500/20 text-lime-700 border-lime-500/30' },
  { value: 'seguros', label: 'Seguros', color: 'bg-amber-500/20 text-amber-700 border-amber-500/30' },
  { value: 'consorcio', label: 'Consórcio', color: 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30' },
  { value: 'financiamento', label: 'Financiamento', color: 'bg-rose-500/20 text-rose-700 border-rose-500/30' },
  { value: 'previdencia', label: 'Previdência', color: 'bg-teal-500/20 text-teal-700 border-teal-500/30' },
  { value: 'cambio', label: 'Câmbio', color: 'bg-sky-500/20 text-sky-700 border-sky-500/30' },
] as const;

export type TagValue = typeof TAGS_DISPONIVEIS[number]['value'];

export function getTagConfig(value: string) {
  return TAGS_DISPONIVEIS.find(t => t.value === value) || { 
    value, 
    label: value, 
    color: 'bg-muted text-muted-foreground border-border' 
  };
}
