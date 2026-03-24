// Conteúdo simulado das pautas para exportação PDF

export interface ConteudoPauta {
  id: string;
  titulo: string;
  subtitulo?: string;
  objetivos: string[];
  contexto: string;
  dadosApresentados: {
    titulo: string;
    itens: { label: string; valor: string }[];
  }[];
  discussoes: {
    topico: string;
    pontos: string[];
  }[];
  deliberacoes: string[];
  encaminhamentos: {
    acao: string;
    responsavel: string;
    prazo: string;
  }[];
  observacoes?: string;
}

export const PAUTAS_CONTEUDO: ConteudoPauta[] = [
  {
    id: "produtividade-equipes",
    titulo: "Produtividade das Equipes",
    subtitulo: "Análise de Performance e Metas Q4 2024",
    objetivos: [
      "Apresentar indicadores de produtividade do trimestre",
      "Identificar gargalos operacionais",
      "Definir metas para o próximo período",
      "Aprovar plano de capacitação"
    ],
    contexto: "A análise de produtividade das equipes é fundamental para o planejamento estratégico da cooperativa. No último trimestre, observamos variações significativas entre as diferentes agências e departamentos, o que motivou esta revisão detalhada.",
    dadosApresentados: [
      {
        titulo: "Indicadores Gerais",
        itens: [
          { label: "Atendimentos realizados", valor: "45.230" },
          { label: "Tempo médio de atendimento", valor: "12 min" },
          { label: "Índice de satisfação", valor: "94,2%" },
          { label: "Taxa de resolução 1º contato", valor: "87%" },
        ]
      },
      {
        titulo: "Performance por Agência",
        itens: [
          { label: "Agência Centro", valor: "98% da meta" },
          { label: "Agência Sul", valor: "105% da meta" },
          { label: "Agência Norte", valor: "91% da meta" },
          { label: "Agência Oeste", valor: "96% da meta" },
        ]
      },
      {
        titulo: "Comparativo Trimestral",
        itens: [
          { label: "Crescimento Q3 vs Q2", valor: "+8,5%" },
          { label: "Produtividade média", valor: "127 atend/colaborador" },
          { label: "Horas extras", valor: "-15% vs período anterior" },
          { label: "Absenteísmo", valor: "2,3%" },
        ]
      }
    ],
    discussoes: [
      {
        topico: "Variação entre agências",
        pontos: [
          "Agência Norte apresentou queda de performance devido a troca de liderança",
          "Necessidade de padronização de processos entre unidades",
          "Proposta de mentoria cruzada entre agências"
        ]
      },
      {
        topico: "Capacitação",
        pontos: [
          "Identificada necessidade de treinamento em produtos de crédito",
          "Programa de desenvolvimento de líderes deve ser priorizado",
          "Parceria com instituições para certificações"
        ]
      }
    ],
    deliberacoes: [
      "Aprovar meta de crescimento de 10% para o próximo trimestre",
      "Implementar sistema de bonificação por performance",
      "Autorizar contratação de 3 novos colaboradores para Agência Norte"
    ],
    encaminhamentos: [
      { acao: "Elaborar plano de capacitação detalhado", responsavel: "Dr. Sérgio", prazo: "15/01/2025" },
      { acao: "Apresentar proposta de bonificação", responsavel: "Dra. Andressa", prazo: "20/01/2025" },
      { acao: "Agendar visita técnica à Agência Norte", responsavel: "Uli Garcia", prazo: "10/01/2025" }
    ],
    observacoes: "A Diretoria ressaltou a importância do engajamento de todas as equipes no processo de melhoria contínua."
  },
  {
    id: "motor-credito",
    titulo: "Motor de Crédito",
    subtitulo: "Atualização do Sistema de Análise de Crédito",
    objetivos: [
      "Apresentar nova versão do motor de crédito",
      "Analisar impacto nas taxas de aprovação",
      "Avaliar compliance regulatório",
      "Aprovar cronograma de implementação"
    ],
    contexto: "O motor de crédito atual necessita de atualização para incorporar novas variáveis de análise, adequar-se às normas do Banco Central e melhorar a experiência do cooperado. O projeto está em desenvolvimento há 6 meses com participação das áreas de TI, Crédito e Compliance.",
    dadosApresentados: [
      {
        titulo: "Performance Atual",
        itens: [
          { label: "Taxa de aprovação", valor: "72%" },
          { label: "Tempo médio de análise", valor: "48 horas" },
          { label: "Inadimplência (carteira)", valor: "3,2%" },
          { label: "Volume mensal analisado", valor: "R$ 45 milhões" },
        ]
      },
      {
        titulo: "Projeção com Novo Motor",
        itens: [
          { label: "Taxa de aprovação esperada", valor: "78%" },
          { label: "Tempo médio de análise", valor: "4 horas" },
          { label: "Inadimplência projetada", valor: "2,8%" },
          { label: "Capacidade de processamento", valor: "+150%" },
        ]
      },
      {
        titulo: "Investimento",
        itens: [
          { label: "Custo total do projeto", valor: "R$ 2,3 milhões" },
          { label: "Payback estimado", valor: "18 meses" },
          { label: "ROI projetado (3 anos)", valor: "340%" },
          { label: "Economia operacional/ano", valor: "R$ 800 mil" },
        ]
      }
    ],
    discussoes: [
      {
        topico: "Aspectos técnicos",
        pontos: [
          "Integração com bureaus de crédito está em fase final",
          "Machine learning para detecção de fraudes implementado",
          "API para consulta em tempo real desenvolvida",
          "Testes de stress realizados com sucesso"
        ]
      },
      {
        topico: "Compliance e Regulatório",
        pontos: [
          "Adequação à Resolução 4.893/2021 do BCB",
          "LGPD: consentimento e portabilidade implementados",
          "Auditoria externa validou controles",
          "Documentação técnica aprovada pelo Compliance"
        ]
      },
      {
        topico: "Impacto Operacional",
        pontos: [
          "Treinamento de 120 colaboradores necessário",
          "Migração gradual em 3 fases",
          "Suporte 24/7 durante período de transição"
        ]
      }
    ],
    deliberacoes: [
      "Aprovar implementação do novo motor de crédito",
      "Autorizar investimento de R$ 2,3 milhões",
      "Definir go-live para março de 2025",
      "Criar comitê de acompanhamento do projeto"
    ],
    encaminhamentos: [
      { acao: "Finalizar contrato com fornecedor de ML", responsavel: "Dr. Geraldo", prazo: "05/01/2025" },
      { acao: "Iniciar programa de treinamento", responsavel: "Dr. Sérgio", prazo: "15/01/2025" },
      { acao: "Apresentar relatório semanal de progresso", responsavel: "Uli Garcia", prazo: "Toda sexta-feira" },
      { acao: "Validar ambiente de produção", responsavel: "TI", prazo: "01/02/2025" }
    ],
    observacoes: "Projeto considerado estratégico pela Diretoria. Alocação de recursos prioritária."
  },
  {
    id: "app-prospeccao",
    titulo: "App de Prospecção",
    subtitulo: "Aplicativo Mobile para Força de Vendas",
    objetivos: [
      "Apresentar protótipo do aplicativo",
      "Validar funcionalidades com área comercial",
      "Definir métricas de sucesso",
      "Aprovar lançamento piloto"
    ],
    contexto: "O App de Prospecção foi desenvolvido para potencializar a atuação da equipe comercial em campo, permitindo cadastro de prospects, simulações de produtos e acompanhamento de metas em tempo real. O aplicativo funcionará integrado ao CRM existente.",
    dadosApresentados: [
      {
        titulo: "Funcionalidades Principais",
        itens: [
          { label: "Cadastro de prospects", valor: "Offline/Online" },
          { label: "Simulador de produtos", valor: "8 produtos" },
          { label: "Geolocalização", valor: "Mapa de oportunidades" },
          { label: "Dashboard de metas", valor: "Tempo real" },
        ]
      },
      {
        titulo: "Benefícios Esperados",
        itens: [
          { label: "Aumento de produtividade", valor: "+35%" },
          { label: "Redução tempo cadastro", valor: "-60%" },
          { label: "Conversão de leads", valor: "+25%" },
          { label: "Satisfação equipe comercial", valor: "+40%" },
        ]
      },
      {
        titulo: "Cronograma",
        itens: [
          { label: "Fase piloto", valor: "Janeiro/2025" },
          { label: "Ajustes e melhorias", valor: "Fevereiro/2025" },
          { label: "Rollout completo", valor: "Março/2025" },
          { label: "Treinamento", valor: "2 semanas" },
        ]
      }
    ],
    discussoes: [
      {
        topico: "Usabilidade",
        pontos: [
          "Interface intuitiva validada por grupo focal",
          "Modo offline essencial para áreas rurais",
          "Push notifications para follow-up de leads",
          "Integração com WhatsApp Business aprovada"
        ]
      },
      {
        topico: "Segurança",
        pontos: [
          "Autenticação biométrica implementada",
          "Dados criptografados em repouso e trânsito",
          "Wipe remoto em caso de perda do dispositivo",
          "Logs de auditoria completos"
        ]
      },
      {
        topico: "Operacional",
        pontos: [
          "Dispositivos corporativos vs BYOD discutido",
          "Decisão: fornecer smartphones para equipe",
          "Suporte técnico via chat no app",
          "Atualizações automáticas habilitadas"
        ]
      }
    ],
    deliberacoes: [
      "Aprovar lançamento do piloto em janeiro/2025",
      "Autorizar aquisição de 50 smartphones para fase piloto",
      "Definir Agência Sul como unidade piloto",
      "Estabelecer meta de 500 cadastros no primeiro mês"
    ],
    encaminhamentos: [
      { acao: "Selecionar equipe para piloto", responsavel: "Uli Garcia", prazo: "20/12/2024" },
      { acao: "Adquirir dispositivos móveis", responsavel: "Dr. Sérgio", prazo: "27/12/2024" },
      { acao: "Preparar material de treinamento", responsavel: "Comercial", prazo: "03/01/2025" },
      { acao: "Configurar ambiente de produção", responsavel: "TI", prazo: "10/01/2025" }
    ],
    observacoes: "App representa importante passo na transformação digital da cooperativa. Expectativa de expansão para outras funcionalidades após validação do piloto."
  }
];

export function getPautaConteudo(id: string): ConteudoPauta | undefined {
  return PAUTAS_CONTEUDO.find(p => p.id === id);
}
