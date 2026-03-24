export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      acoes_ia: {
        Row: {
          ata_id: string | null
          created_at: string | null
          descricao: string
          id: string
          prazo: string | null
          responsavel: string | null
          status: string | null
        }
        Insert: {
          ata_id?: string | null
          created_at?: string | null
          descricao: string
          id?: string
          prazo?: string | null
          responsavel?: string | null
          status?: string | null
        }
        Update: {
          ata_id?: string | null
          created_at?: string | null
          descricao?: string
          id?: string
          prazo?: string | null
          responsavel?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acoes_ia_ata_id_fkey"
            columns: ["ata_id"]
            isOneToOne: false
            referencedRelation: "atas"
            referencedColumns: ["id"]
          },
        ]
      }
      atas: {
        Row: {
          conteudo_markdown: string
          created_at: string | null
          id: string
          link_auditoria: string | null
          link_drive: string | null
          n8n_reuniao_id: string | null
          recebida_em: string | null
          resumo_executivo: string | null
          reuniao_id: string | null
          status: string | null
          tom_geral: string | null
          total_acoes: number | null
          total_decisoes: number | null
          total_oportunidades: number | null
          total_riscos: number | null
          updated_at: string | null
          urgencia: string | null
        }
        Insert: {
          conteudo_markdown: string
          created_at?: string | null
          id?: string
          link_auditoria?: string | null
          link_drive?: string | null
          n8n_reuniao_id?: string | null
          recebida_em?: string | null
          resumo_executivo?: string | null
          reuniao_id?: string | null
          status?: string | null
          tom_geral?: string | null
          total_acoes?: number | null
          total_decisoes?: number | null
          total_oportunidades?: number | null
          total_riscos?: number | null
          updated_at?: string | null
          urgencia?: string | null
        }
        Update: {
          conteudo_markdown?: string
          created_at?: string | null
          id?: string
          link_auditoria?: string | null
          link_drive?: string | null
          n8n_reuniao_id?: string | null
          recebida_em?: string | null
          resumo_executivo?: string | null
          reuniao_id?: string | null
          status?: string | null
          tom_geral?: string | null
          total_acoes?: number | null
          total_decisoes?: number | null
          total_oportunidades?: number | null
          total_riscos?: number | null
          updated_at?: string | null
          urgencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atas_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          chave: string
          created_at: string | null
          id: string
          updated_at: string | null
          valor: Json
        }
        Insert: {
          chave: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          valor: Json
        }
        Update: {
          chave?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          valor?: Json
        }
        Relationships: []
      }
      decisoes_ia: {
        Row: {
          ata_id: string | null
          created_at: string | null
          descricao: string
          id: string
          prazo: string | null
          responsavel: string | null
          status: string | null
        }
        Insert: {
          ata_id?: string | null
          created_at?: string | null
          descricao: string
          id?: string
          prazo?: string | null
          responsavel?: string | null
          status?: string | null
        }
        Update: {
          ata_id?: string | null
          created_at?: string | null
          descricao?: string
          id?: string
          prazo?: string | null
          responsavel?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decisoes_ia_ata_id_fkey"
            columns: ["ata_id"]
            isOneToOne: false
            referencedRelation: "atas"
            referencedColumns: ["id"]
          },
        ]
      }
      destinatarios: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          created_at: string | null
          email: string
          grupo: string | null
          id: string
          membro_id: string | null
          nome: string
          origem: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          email: string
          grupo?: string | null
          id?: string
          membro_id?: string | null
          nome: string
          origem?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          email?: string
          grupo?: string | null
          id?: string
          membro_id?: string | null
          nome?: string
          origem?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destinatarios_membro_id_fkey"
            columns: ["membro_id"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
        ]
      }
      envios_email: {
        Row: {
          ata_id: string | null
          created_at: string | null
          destinatario_cargo: string | null
          destinatario_email: string
          destinatario_nome: string
          enviado_em: string | null
          id: string
          lido: boolean | null
          lido_em: string | null
        }
        Insert: {
          ata_id?: string | null
          created_at?: string | null
          destinatario_cargo?: string | null
          destinatario_email: string
          destinatario_nome: string
          enviado_em?: string | null
          id?: string
          lido?: boolean | null
          lido_em?: string | null
        }
        Update: {
          ata_id?: string | null
          created_at?: string | null
          destinatario_cargo?: string | null
          destinatario_email?: string
          destinatario_nome?: string
          enviado_em?: string | null
          id?: string
          lido?: boolean | null
          lido_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "envios_email_ata_id_fkey"
            columns: ["ata_id"]
            isOneToOne: false
            referencedRelation: "atas"
            referencedColumns: ["id"]
          },
        ]
      }
      membros: {
        Row: {
          ativo: boolean
          cargo: string
          created_at: string
          email: string
          foto: string | null
          id: string
          nome: string
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cargo: string
          created_at?: string
          email: string
          foto?: string | null
          id?: string
          nome: string
          tipo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cargo?: string
          created_at?: string
          email?: string
          foto?: string | null
          id?: string
          nome?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      oportunidades_ia: {
        Row: {
          ata_id: string | null
          created_at: string | null
          descricao: string
          id: string
          mencoes: number | null
          potencial: string | null
        }
        Insert: {
          ata_id?: string | null
          created_at?: string | null
          descricao: string
          id?: string
          mencoes?: number | null
          potencial?: string | null
        }
        Update: {
          ata_id?: string | null
          created_at?: string | null
          descricao?: string
          id?: string
          mencoes?: number | null
          potencial?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_ia_ata_id_fkey"
            columns: ["ata_id"]
            isOneToOne: false
            referencedRelation: "atas"
            referencedColumns: ["id"]
          },
        ]
      }
      pauta_dados: {
        Row: {
          created_at: string
          id: string
          label: string
          ordem: number
          pauta_id: string
          secao_titulo: string
          valor: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          ordem?: number
          pauta_id: string
          secao_titulo: string
          valor: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          ordem?: number
          pauta_id?: string
          secao_titulo?: string
          valor?: string
        }
        Relationships: [
          {
            foreignKeyName: "pauta_dados_pauta_id_fkey"
            columns: ["pauta_id"]
            isOneToOne: false
            referencedRelation: "pautas"
            referencedColumns: ["id"]
          },
        ]
      }
      pauta_deliberacoes: {
        Row: {
          created_at: string
          id: string
          ordem: number
          pauta_id: string
          texto: string
        }
        Insert: {
          created_at?: string
          id?: string
          ordem?: number
          pauta_id: string
          texto: string
        }
        Update: {
          created_at?: string
          id?: string
          ordem?: number
          pauta_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "pauta_deliberacoes_pauta_id_fkey"
            columns: ["pauta_id"]
            isOneToOne: false
            referencedRelation: "pautas"
            referencedColumns: ["id"]
          },
        ]
      }
      pauta_discussao_pontos: {
        Row: {
          created_at: string
          discussao_id: string
          id: string
          ordem: number
          texto: string
        }
        Insert: {
          created_at?: string
          discussao_id: string
          id?: string
          ordem?: number
          texto: string
        }
        Update: {
          created_at?: string
          discussao_id?: string
          id?: string
          ordem?: number
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "pauta_discussao_pontos_discussao_id_fkey"
            columns: ["discussao_id"]
            isOneToOne: false
            referencedRelation: "pauta_discussoes"
            referencedColumns: ["id"]
          },
        ]
      }
      pauta_discussoes: {
        Row: {
          created_at: string
          id: string
          ordem: number
          pauta_id: string
          topico: string
        }
        Insert: {
          created_at?: string
          id?: string
          ordem?: number
          pauta_id: string
          topico: string
        }
        Update: {
          created_at?: string
          id?: string
          ordem?: number
          pauta_id?: string
          topico?: string
        }
        Relationships: [
          {
            foreignKeyName: "pauta_discussoes_pauta_id_fkey"
            columns: ["pauta_id"]
            isOneToOne: false
            referencedRelation: "pautas"
            referencedColumns: ["id"]
          },
        ]
      }
      pauta_encaminhamentos: {
        Row: {
          acao: string
          created_at: string
          id: string
          ordem: number
          pauta_id: string
          prazo: string
          responsavel: string
        }
        Insert: {
          acao: string
          created_at?: string
          id?: string
          ordem?: number
          pauta_id: string
          prazo: string
          responsavel: string
        }
        Update: {
          acao?: string
          created_at?: string
          id?: string
          ordem?: number
          pauta_id?: string
          prazo?: string
          responsavel?: string
        }
        Relationships: [
          {
            foreignKeyName: "pauta_encaminhamentos_pauta_id_fkey"
            columns: ["pauta_id"]
            isOneToOne: false
            referencedRelation: "pautas"
            referencedColumns: ["id"]
          },
        ]
      }
      pauta_itens: {
        Row: {
          created_at: string | null
          hora_fim: string | null
          hora_inicio: string | null
          id: string
          ordem: number | null
          pauta_id: string
          responsavel_id: string | null
          tema: string
        }
        Insert: {
          created_at?: string | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          ordem?: number | null
          pauta_id: string
          responsavel_id?: string | null
          tema: string
        }
        Update: {
          created_at?: string | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          ordem?: number | null
          pauta_id?: string
          responsavel_id?: string | null
          tema?: string
        }
        Relationships: [
          {
            foreignKeyName: "pauta_itens_pauta_id_fkey"
            columns: ["pauta_id"]
            isOneToOne: false
            referencedRelation: "pautas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pauta_itens_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
        ]
      }
      pauta_objetivos: {
        Row: {
          created_at: string
          id: string
          ordem: number
          pauta_id: string
          texto: string
        }
        Insert: {
          created_at?: string
          id?: string
          ordem?: number
          pauta_id: string
          texto: string
        }
        Update: {
          created_at?: string
          id?: string
          ordem?: number
          pauta_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "pauta_objetivos_pauta_id_fkey"
            columns: ["pauta_id"]
            isOneToOne: false
            referencedRelation: "pautas"
            referencedColumns: ["id"]
          },
        ]
      }
      pautas: {
        Row: {
          contexto: string | null
          created_at: string
          id: string
          observacoes: string | null
          responsavel_id: string | null
          reuniao_id: string | null
          status: string
          subtitulo: string | null
          tempo_previsto: number | null
          titulo: string
          updated_at: string
        }
        Insert: {
          contexto?: string | null
          created_at?: string
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          reuniao_id?: string | null
          status?: string
          subtitulo?: string | null
          tempo_previsto?: number | null
          titulo: string
          updated_at?: string
        }
        Update: {
          contexto?: string | null
          created_at?: string
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          reuniao_id?: string | null
          status?: string
          subtitulo?: string | null
          tempo_previsto?: number | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pautas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pautas_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
      processamentos_gravacao: {
        Row: {
          assinaturas: Json | null
          created_at: string
          erro_mensagem: string | null
          etapa_atual: string | null
          id: string
          link_arquivo_processado: string | null
          link_drive: string | null
          nome_arquivo: string
          participantes: string[] | null
          pauta_id: string | null
          progresso: number | null
          reuniao_id: string | null
          status: string
          tarefas_marcadas: string[] | null
          updated_at: string
        }
        Insert: {
          assinaturas?: Json | null
          created_at?: string
          erro_mensagem?: string | null
          etapa_atual?: string | null
          id?: string
          link_arquivo_processado?: string | null
          link_drive?: string | null
          nome_arquivo: string
          participantes?: string[] | null
          pauta_id?: string | null
          progresso?: number | null
          reuniao_id?: string | null
          status?: string
          tarefas_marcadas?: string[] | null
          updated_at?: string
        }
        Update: {
          assinaturas?: Json | null
          created_at?: string
          erro_mensagem?: string | null
          etapa_atual?: string | null
          id?: string
          link_arquivo_processado?: string | null
          link_drive?: string | null
          nome_arquivo?: string
          participantes?: string[] | null
          pauta_id?: string | null
          progresso?: number | null
          reuniao_id?: string | null
          status?: string
          tarefas_marcadas?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "processamentos_gravacao_pauta_id_fkey"
            columns: ["pauta_id"]
            isOneToOne: false
            referencedRelation: "pautas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processamentos_gravacao_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
      reunioes: {
        Row: {
          created_at: string
          criado_por: string | null
          data: string
          descricao: string | null
          duracao: number
          horario: string
          id: string
          local: string | null
          plataforma: string | null
          status: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criado_por?: string | null
          data: string
          descricao?: string | null
          duracao?: number
          horario: string
          id?: string
          local?: string | null
          plataforma?: string | null
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criado_por?: string | null
          data?: string
          descricao?: string | null
          duracao?: number
          horario?: string
          id?: string
          local?: string | null
          plataforma?: string | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reunioes_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
        ]
      }
      riscos_ia: {
        Row: {
          ata_id: string | null
          created_at: string | null
          descricao: string
          id: string
          mencoes: number | null
          severidade: string | null
        }
        Insert: {
          ata_id?: string | null
          created_at?: string | null
          descricao: string
          id?: string
          mencoes?: number | null
          severidade?: string | null
        }
        Update: {
          ata_id?: string | null
          created_at?: string | null
          descricao?: string
          id?: string
          mencoes?: number | null
          severidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "riscos_ia_ata_id_fkey"
            columns: ["ata_id"]
            isOneToOne: false
            referencedRelation: "atas"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas_delegadas: {
        Row: {
          atualizado_por: string | null
          concluida_em: string | null
          created_at: string
          descricao: string
          id: string
          observacoes: string | null
          prazo: string
          responsavel_id: string
          reuniao_id: string | null
          status: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          atualizado_por?: string | null
          concluida_em?: string | null
          created_at?: string
          descricao: string
          id?: string
          observacoes?: string | null
          prazo: string
          responsavel_id: string
          reuniao_id?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          atualizado_por?: string | null
          concluida_em?: string | null
          created_at?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          prazo?: string
          responsavel_id?: string
          reuniao_id?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_delegadas_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_delegadas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_delegadas_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
