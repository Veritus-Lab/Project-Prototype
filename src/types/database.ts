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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      assessorias: {
        Row: {
          cor_primaria: string | null
          cor_secundaria: string | null
          created_at: string
          id: string
          logo_url: string | null
          nome: string
          slug: string
          timezone: string
          updated_at: string
        }
        Insert: {
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          nome: string
          slug: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          nome?: string
          slug?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      assinaturas_atletas: {
        Row: {
          assessoria_id: string
          atleta_id: string
          created_at: string
          dia_vencimento: number
          fim_em: string | null
          id: string
          inicio_em: string
          metodo_previsto: string | null
          moeda: string
          periodicidade: string
          status: string
          updated_at: string
          valor_centavos: number
        }
        Insert: {
          assessoria_id: string
          atleta_id: string
          created_at?: string
          dia_vencimento: number
          fim_em?: string | null
          id?: string
          inicio_em: string
          metodo_previsto?: string | null
          moeda?: string
          periodicidade: string
          status?: string
          updated_at?: string
          valor_centavos: number
        }
        Update: {
          assessoria_id?: string
          atleta_id?: string
          created_at?: string
          dia_vencimento?: number
          fim_em?: string | null
          id?: string
          inicio_em?: string
          metodo_previsto?: string | null
          moeda?: string
          periodicidade?: string
          status?: string
          updated_at?: string
          valor_centavos?: number
        }
        Relationships: [
          {
            foreignKeyName: "assinaturas_atletas_atleta_fkey"
            columns: ["assessoria_id", "atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
      atletas: {
        Row: {
          assessoria_id: string
          created_at: string
          id: string
          treinador_id: string | null
          updated_at: string
        }
        Insert: {
          assessoria_id: string
          created_at?: string
          id: string
          treinador_id?: string | null
          updated_at?: string
        }
        Update: {
          assessoria_id?: string
          created_at?: string
          id?: string
          treinador_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atletas_profile_fkey"
            columns: ["assessoria_id", "id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["assessoria_id", "id"]
          },
          {
            foreignKeyName: "atletas_treinador_fkey"
            columns: ["assessoria_id", "treinador_id"]
            isOneToOne: false
            referencedRelation: "treinadores"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
      atletas_operacionais: {
        Row: {
          assessoria_id: string
          atleta_id: string
          contato_emergencia_nome: string | null
          contato_emergencia_telefone: string | null
          created_at: string
          data_nascimento: string | null
          nivel: string | null
          objetivo: string | null
          observacoes_internas: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          assessoria_id: string
          atleta_id: string
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          created_at?: string
          data_nascimento?: string | null
          nivel?: string | null
          objetivo?: string | null
          observacoes_internas?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          assessoria_id?: string
          atleta_id?: string
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          created_at?: string
          data_nascimento?: string | null
          nivel?: string | null
          objetivo?: string | null
          observacoes_internas?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atletas_operacionais_atleta_fkey"
            columns: ["assessoria_id", "atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
      cobrancas: {
        Row: {
          assessoria_id: string
          assinatura_id: string
          atleta_id: string
          created_at: string
          id: string
          moeda: string
          paga_em: string | null
          status: string
          updated_at: string
          valor_centavos: number
          vencimento_em: string
        }
        Insert: {
          assessoria_id: string
          assinatura_id: string
          atleta_id: string
          created_at?: string
          id?: string
          moeda?: string
          paga_em?: string | null
          status?: string
          updated_at?: string
          valor_centavos: number
          vencimento_em: string
        }
        Update: {
          assessoria_id?: string
          assinatura_id?: string
          atleta_id?: string
          created_at?: string
          id?: string
          moeda?: string
          paga_em?: string | null
          status?: string
          updated_at?: string
          valor_centavos?: number
          vencimento_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "cobrancas_assinatura_fkey"
            columns: ["assessoria_id", "assinatura_id"]
            isOneToOne: false
            referencedRelation: "assinaturas_atletas"
            referencedColumns: ["assessoria_id", "id"]
          },
          {
            foreignKeyName: "cobrancas_atleta_fkey"
            columns: ["assessoria_id", "atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
      convites_atletas: {
        Row: {
          assessoria_id: string
          created_at: string
          email: string
          expira_em: string
          id: string
          revogado_em: string | null
          status: Database["public"]["Enums"]["status_convite"]
          token_hash: string
          treinador_id: string
          updated_at: string
          usado_em: string | null
        }
        Insert: {
          assessoria_id: string
          created_at?: string
          email: string
          expira_em: string
          id?: string
          revogado_em?: string | null
          status?: Database["public"]["Enums"]["status_convite"]
          token_hash: string
          treinador_id: string
          updated_at?: string
          usado_em?: string | null
        }
        Update: {
          assessoria_id?: string
          created_at?: string
          email?: string
          expira_em?: string
          id?: string
          revogado_em?: string | null
          status?: Database["public"]["Enums"]["status_convite"]
          token_hash?: string
          treinador_id?: string
          updated_at?: string
          usado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convites_assessoria_fkey"
            columns: ["assessoria_id"]
            isOneToOne: false
            referencedRelation: "assessorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convites_treinador_fkey"
            columns: ["assessoria_id", "treinador_id"]
            isOneToOne: false
            referencedRelation: "treinadores"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
      eventos_financeiros: {
        Row: {
          assessoria_id: string
          assinatura_id: string | null
          atleta_id: string
          ator_id: string
          cobranca_id: string | null
          created_at: string
          detalhes: Json
          id: string
          tipo: string
        }
        Insert: {
          assessoria_id: string
          assinatura_id?: string | null
          atleta_id: string
          ator_id: string
          cobranca_id?: string | null
          created_at?: string
          detalhes?: Json
          id?: string
          tipo: string
        }
        Update: {
          assessoria_id?: string
          assinatura_id?: string | null
          atleta_id?: string
          ator_id?: string
          cobranca_id?: string | null
          created_at?: string
          detalhes?: Json
          id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_financeiros_assinatura_fkey"
            columns: ["assessoria_id", "assinatura_id"]
            isOneToOne: false
            referencedRelation: "assinaturas_atletas"
            referencedColumns: ["assessoria_id", "id"]
          },
          {
            foreignKeyName: "eventos_financeiros_atleta_fkey"
            columns: ["assessoria_id", "atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas"
            referencedColumns: ["assessoria_id", "id"]
          },
          {
            foreignKeyName: "eventos_financeiros_cobranca_fkey"
            columns: ["assessoria_id", "cobranca_id"]
            isOneToOne: false
            referencedRelation: "cobrancas"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
      execucoes_treino: {
        Row: {
          assessoria_id: string
          atleta_id: string
          created_at: string
          desconforto_intensidade: number | null
          desconforto_regiao: string | null
          distancia_real_metros: number | null
          duracao_real_minutos: number | null
          id: string
          observacao_atleta: string | null
          registrado_em: string
          rpe: number | null
          status: string
          treino_atleta_id: string
        }
        Insert: {
          assessoria_id: string
          atleta_id: string
          created_at?: string
          desconforto_intensidade?: number | null
          desconforto_regiao?: string | null
          distancia_real_metros?: number | null
          duracao_real_minutos?: number | null
          id?: string
          observacao_atleta?: string | null
          registrado_em?: string
          rpe?: number | null
          status: string
          treino_atleta_id: string
        }
        Update: {
          assessoria_id?: string
          atleta_id?: string
          created_at?: string
          desconforto_intensidade?: number | null
          desconforto_regiao?: string | null
          distancia_real_metros?: number | null
          duracao_real_minutos?: number | null
          id?: string
          observacao_atleta?: string | null
          registrado_em?: string
          rpe?: number | null
          status?: string
          treino_atleta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "execucoes_treino_assignment_fkey"
            columns: ["assessoria_id", "treino_atleta_id"]
            isOneToOne: false
            referencedRelation: "treinos_atletas"
            referencedColumns: ["assessoria_id", "id"]
          },
          {
            foreignKeyName: "execucoes_treino_atleta_fkey"
            columns: ["assessoria_id", "atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
      exercicios_catalogo: {
        Row: {
          alerta: string
          ativo: boolean
          categoria: string
          created_at: string
          descricao_curta: string
          id: string
          instrucoes: string
          nivel: string
          nome: string
          ordem: number
          updated_at: string
        }
        Insert: {
          alerta: string
          ativo?: boolean
          categoria: string
          created_at?: string
          descricao_curta: string
          id?: string
          instrucoes: string
          nivel: string
          nome: string
          ordem: number
          updated_at?: string
        }
        Update: {
          alerta?: string
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao_curta?: string
          id?: string
          instrucoes?: string
          nivel?: string
          nome?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: []
      }
      lembretes_cobranca: {
        Row: {
          assessoria_id: string
          atleta_id: string
          canal: string
          cobranca_id: string
          created_at: string
          id: string
          programado_para: string
          provider_message_id: string | null
          status: string
          template_codigo: string
          tentativas: number
          ultimo_erro: string | null
          updated_at: string
        }
        Insert: {
          assessoria_id: string
          atleta_id: string
          canal: string
          cobranca_id: string
          created_at?: string
          id?: string
          programado_para: string
          provider_message_id?: string | null
          status: string
          template_codigo: string
          tentativas?: number
          ultimo_erro?: string | null
          updated_at?: string
        }
        Update: {
          assessoria_id?: string
          atleta_id?: string
          canal?: string
          cobranca_id?: string
          created_at?: string
          id?: string
          programado_para?: string
          provider_message_id?: string | null
          status?: string
          template_codigo?: string
          tentativas?: number
          ultimo_erro?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lembretes_cobranca_atleta_fkey"
            columns: ["assessoria_id", "atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas"
            referencedColumns: ["assessoria_id", "id"]
          },
          {
            foreignKeyName: "lembretes_cobranca_cobranca_fkey"
            columns: ["assessoria_id", "cobranca_id"]
            isOneToOne: false
            referencedRelation: "cobrancas"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
      preferencias_comunicacao: {
        Row: {
          assessoria_id: string
          atleta_id: string
          cobranca_whatsapp: boolean
          created_at: string
          id: string
          updated_at: string
          whatsapp_opt_in: boolean
          whatsapp_opt_in_em: string | null
          whatsapp_opt_out_em: string | null
          whatsapp_telefone: string | null
        }
        Insert: {
          assessoria_id: string
          atleta_id: string
          cobranca_whatsapp?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          whatsapp_opt_in?: boolean
          whatsapp_opt_in_em?: string | null
          whatsapp_opt_out_em?: string | null
          whatsapp_telefone?: string | null
        }
        Update: {
          assessoria_id?: string
          atleta_id?: string
          cobranca_whatsapp?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          whatsapp_opt_in?: boolean
          whatsapp_opt_in_em?: string | null
          whatsapp_opt_out_em?: string | null
          whatsapp_telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preferencias_comunicacao_atleta_fkey"
            columns: ["assessoria_id", "atleta_id"]
            isOneToOne: true
            referencedRelation: "atletas"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
      profiles: {
        Row: {
          assessoria_id: string
          created_at: string
          id: string
          nome: string
          papel: Database["public"]["Enums"]["papel_usuario"]
          updated_at: string
        }
        Insert: {
          assessoria_id: string
          created_at?: string
          id: string
          nome: string
          papel: Database["public"]["Enums"]["papel_usuario"]
          updated_at?: string
        }
        Update: {
          assessoria_id?: string
          created_at?: string
          id?: string
          nome?: string
          papel?: Database["public"]["Enums"]["papel_usuario"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_assessoria_fkey"
            columns: ["assessoria_id"]
            isOneToOne: false
            referencedRelation: "assessorias"
            referencedColumns: ["id"]
          },
        ]
      }
      referencias_ritmo_atribuicoes: {
        Row: {
          assessoria_id: string
          created_at: string
          teste_desempenho_id: string
          treino_atleta_id: string
          zonas: Json
        }
        Insert: {
          assessoria_id: string
          created_at?: string
          teste_desempenho_id: string
          treino_atleta_id: string
          zonas: Json
        }
        Update: {
          assessoria_id?: string
          created_at?: string
          teste_desempenho_id?: string
          treino_atleta_id?: string
          zonas?: Json
        }
        Relationships: [
          {
            foreignKeyName: "referencias_ritmo_atribuicoes_assignment_fkey"
            columns: ["assessoria_id", "treino_atleta_id"]
            isOneToOne: false
            referencedRelation: "treinos_atletas"
            referencedColumns: ["assessoria_id", "id"]
          },
          {
            foreignKeyName: "referencias_ritmo_atribuicoes_teste_fkey"
            columns: ["assessoria_id", "teste_desempenho_id"]
            isOneToOne: false
            referencedRelation: "testes_desempenho"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
      tenis_atletas: {
        Row: {
          assessoria_id: string
          ativo: boolean
          atleta_id: string
          created_at: string
          id: string
          inicio_em: string | null
          limite_rodagem_metros: number | null
          nome: string
          quilometragem_inicial_metros: number
          updated_at: string
        }
        Insert: {
          assessoria_id: string
          ativo?: boolean
          atleta_id: string
          created_at?: string
          id?: string
          inicio_em?: string | null
          limite_rodagem_metros?: number | null
          nome: string
          quilometragem_inicial_metros?: number
          updated_at?: string
        }
        Update: {
          assessoria_id?: string
          ativo?: boolean
          atleta_id?: string
          created_at?: string
          id?: string
          inicio_em?: string | null
          limite_rodagem_metros?: number | null
          nome?: string
          quilometragem_inicial_metros?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenis_atletas_atleta_fkey"
            columns: ["assessoria_id", "atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
      tenis_execucoes: {
        Row: {
          assessoria_id: string
          created_at: string
          execucao_treino_id: string
          tenis_id: string
        }
        Insert: {
          assessoria_id: string
          created_at?: string
          execucao_treino_id: string
          tenis_id: string
        }
        Update: {
          assessoria_id?: string
          created_at?: string
          execucao_treino_id?: string
          tenis_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenis_execucoes_execucao_fkey"
            columns: ["assessoria_id", "execucao_treino_id"]
            isOneToOne: false
            referencedRelation: "execucoes_treino"
            referencedColumns: ["assessoria_id", "id"]
          },
          {
            foreignKeyName: "tenis_execucoes_tenis_fkey"
            columns: ["assessoria_id", "tenis_id"]
            isOneToOne: false
            referencedRelation: "tenis_atletas"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
      testes_desempenho: {
        Row: {
          assessoria_id: string
          atleta_id: string
          avaliado_em: string
          created_at: string
          id: string
          observacao: string | null
          protocolo: string
          ritmo_limiar_segundos_por_km: number | null
          treinador_id: string
          vam_metros_por_min: number | null
        }
        Insert: {
          assessoria_id: string
          atleta_id: string
          avaliado_em: string
          created_at?: string
          id?: string
          observacao?: string | null
          protocolo: string
          ritmo_limiar_segundos_por_km?: number | null
          treinador_id: string
          vam_metros_por_min?: number | null
        }
        Update: {
          assessoria_id?: string
          atleta_id?: string
          avaliado_em?: string
          created_at?: string
          id?: string
          observacao?: string | null
          protocolo?: string
          ritmo_limiar_segundos_por_km?: number | null
          treinador_id?: string
          vam_metros_por_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "testes_desempenho_atleta_fkey"
            columns: ["assessoria_id", "atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas"
            referencedColumns: ["assessoria_id", "id"]
          },
          {
            foreignKeyName: "testes_desempenho_treinador_fkey"
            columns: ["assessoria_id", "treinador_id"]
            isOneToOne: false
            referencedRelation: "treinadores"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
      tipos_treino_catalogo: {
        Row: {
          alerta: string
          ativo: boolean
          codigo: string
          created_at: string
          descricao: string
          estrutura_schema: Json
          id: string
          nome: string
          objetivo: string
          ordem: number
          updated_at: string
        }
        Insert: {
          alerta: string
          ativo?: boolean
          codigo: string
          created_at?: string
          descricao: string
          estrutura_schema: Json
          id?: string
          nome: string
          objetivo: string
          ordem: number
          updated_at?: string
        }
        Update: {
          alerta?: string
          ativo?: boolean
          codigo?: string
          created_at?: string
          descricao?: string
          estrutura_schema?: Json
          id?: string
          nome?: string
          objetivo?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: []
      }
      treinadores: {
        Row: {
          assessoria_id: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          assessoria_id: string
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          assessoria_id?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treinadores_profile_fkey"
            columns: ["assessoria_id", "id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
      treinos: {
        Row: {
          assessoria_id: string
          created_at: string
          descricao: string | null
          estrutura: Json
          id: string
          origem: Database["public"]["Enums"]["origem_treino"]
          tipo_treino_id: string | null
          titulo: string
          treinador_id: string
          updated_at: string
        }
        Insert: {
          assessoria_id: string
          created_at?: string
          descricao?: string | null
          estrutura?: Json
          id?: string
          origem?: Database["public"]["Enums"]["origem_treino"]
          tipo_treino_id?: string | null
          titulo: string
          treinador_id: string
          updated_at?: string
        }
        Update: {
          assessoria_id?: string
          created_at?: string
          descricao?: string | null
          estrutura?: Json
          id?: string
          origem?: Database["public"]["Enums"]["origem_treino"]
          tipo_treino_id?: string | null
          titulo?: string
          treinador_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treinos_assessoria_fkey"
            columns: ["assessoria_id"]
            isOneToOne: false
            referencedRelation: "assessorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treinos_tipo_treino_id_fkey"
            columns: ["tipo_treino_id"]
            isOneToOne: false
            referencedRelation: "tipos_treino_catalogo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treinos_treinador_fkey"
            columns: ["assessoria_id", "treinador_id"]
            isOneToOne: false
            referencedRelation: "treinadores"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
      treinos_atletas: {
        Row: {
          agendado_para: string | null
          assessoria_id: string
          atleta_id: string
          atribuido_em: string
          concluido_em: string | null
          created_at: string
          id: string
          iniciado_em: string | null
          observacao_treinador: string | null
          status: string
          timezone: string | null
          treino_id: string
          updated_at: string
        }
        Insert: {
          agendado_para?: string | null
          assessoria_id: string
          atleta_id: string
          atribuido_em?: string
          concluido_em?: string | null
          created_at?: string
          id?: string
          iniciado_em?: string | null
          observacao_treinador?: string | null
          status?: string
          timezone?: string | null
          treino_id: string
          updated_at?: string
        }
        Update: {
          agendado_para?: string | null
          assessoria_id?: string
          atleta_id?: string
          atribuido_em?: string
          concluido_em?: string | null
          created_at?: string
          id?: string
          iniciado_em?: string | null
          observacao_treinador?: string | null
          status?: string
          timezone?: string | null
          treino_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treinos_atletas_atleta_fkey"
            columns: ["assessoria_id", "atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas"
            referencedColumns: ["assessoria_id", "id"]
          },
          {
            foreignKeyName: "treinos_atletas_treino_fkey"
            columns: ["assessoria_id", "treino_id"]
            isOneToOne: false
            referencedRelation: "treinos"
            referencedColumns: ["assessoria_id", "id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aceitar_convite: {
        Args: { hash: string; nome: string; user_id: string }
        Returns: undefined
      }
      validar_convite: {
        Args: { hash: string }
        Returns: {
          assessoria_nome: string
          email_mascarado: string
          estado: string
        }[]
      }
    }
    Enums: {
      origem_treino: "manual" | "ia" | "importado"
      papel_usuario: "treinador" | "atleta"
      status_convite: "pendente" | "aceito" | "revogado" | "expirado"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      origem_treino: ["manual", "ia", "importado"],
      papel_usuario: ["treinador", "atleta"],
      status_convite: ["pendente", "aceito", "revogado", "expirado"],
    },
  },
} as const
