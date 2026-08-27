export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assessorias: {
        Row: {
          id: string
          nome: string
          slug: string
          logo_url: string | null
          cor_primaria: string | null
          cor_secundaria: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          slug: string
          logo_url?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          slug?: string
          logo_url?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          assessoria_id: string
          nome: string
          papel: Database['public']['Enums']['papel_usuario']
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          assessoria_id: string
          nome: string
          papel: Database['public']['Enums']['papel_usuario']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessoria_id?: string
          nome?: string
          papel?: Database['public']['Enums']['papel_usuario']
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_auth_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'profiles_assessoria_fkey'
            columns: ['assessoria_id']
            isOneToOne: false
            referencedRelation: 'assessorias'
            referencedColumns: ['id']
          },
        ]
      }
      treinadores: {
        Row: {
          id: string
          assessoria_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          assessoria_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessoria_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'treinadores_profile_fkey'
            columns: ['assessoria_id', 'id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['assessoria_id', 'id']
          },
        ]
      }
      atletas: {
        Row: {
          id: string
          assessoria_id: string
          treinador_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          assessoria_id: string
          treinador_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessoria_id?: string
          treinador_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'atletas_profile_fkey'
            columns: ['assessoria_id', 'id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['assessoria_id', 'id']
          },
          {
            foreignKeyName: 'atletas_treinador_fkey'
            columns: ['assessoria_id', 'treinador_id']
            isOneToOne: false
            referencedRelation: 'treinadores'
            referencedColumns: ['assessoria_id', 'id']
          },
        ]
      }
      atletas_operacionais: {
        Row: {
          atleta_id: string
          assessoria_id: string
          telefone: string | null
          observacoes_internas: string | null
          objetivo: string | null
          nivel: 'iniciante' | 'intermediario' | 'avancado' | null
          data_nascimento: string | null
          contato_emergencia_nome: string | null
          contato_emergencia_telefone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          atleta_id: string
          assessoria_id: string
          telefone?: string | null
          observacoes_internas?: string | null
          objetivo?: string | null
          nivel?: 'iniciante' | 'intermediario' | 'avancado' | null
          data_nascimento?: string | null
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          atleta_id?: string
          assessoria_id?: string
          telefone?: string | null
          observacoes_internas?: string | null
          objetivo?: string | null
          nivel?: 'iniciante' | 'intermediario' | 'avancado' | null
          data_nascimento?: string | null
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'atletas_operacionais_atleta_fkey'
            columns: ['assessoria_id', 'atleta_id']
            isOneToOne: true
            referencedRelation: 'atletas'
            referencedColumns: ['assessoria_id', 'id']
          },
        ]
      }
      exercicios_catalogo: {
        Row: {
          id: string
          nome: string
          categoria: 'forca' | 'mobilidade' | 'core' | 'pliometria' | 'tecnica'
          nivel: 'iniciante' | 'intermediario' | 'avancado'
          descricao_curta: string
          instrucoes: string
          alerta: string
          ativo: boolean
          ordem: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          categoria: 'forca' | 'mobilidade' | 'core' | 'pliometria' | 'tecnica'
          nivel: 'iniciante' | 'intermediario' | 'avancado'
          descricao_curta: string
          instrucoes: string
          alerta: string
          ativo?: boolean
          ordem: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          categoria?: 'forca' | 'mobilidade' | 'core' | 'pliometria' | 'tecnica'
          nivel?: 'iniciante' | 'intermediario' | 'avancado'
          descricao_curta?: string
          instrucoes?: string
          alerta?: string
          ativo?: boolean
          ordem?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tipos_treino_catalogo: {
        Row: {
          id: string
          codigo: string
          nome: string
          objetivo: string
          descricao: string
          estrutura_schema: Json
          alerta: string
          ativo: boolean
          ordem: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo: string
          nome: string
          objetivo: string
          descricao: string
          estrutura_schema: Json
          alerta: string
          ativo?: boolean
          ordem: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo?: string
          nome?: string
          objetivo?: string
          descricao?: string
          estrutura_schema?: Json
          alerta?: string
          ativo?: boolean
          ordem?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      convites_atletas: {
        Row: {
          id: string
          assessoria_id: string
          treinador_id: string
          email: string
          token_hash: string
          status: Database['public']['Enums']['status_convite']
          expira_em: string
          usado_em: string | null
          revogado_em: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessoria_id: string
          treinador_id: string
          email: string
          token_hash: string
          status?: Database['public']['Enums']['status_convite']
          expira_em: string
          usado_em?: string | null
          revogado_em?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessoria_id?: string
          treinador_id?: string
          email?: string
          token_hash?: string
          status?: Database['public']['Enums']['status_convite']
          expira_em?: string
          usado_em?: string | null
          revogado_em?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'convites_assessoria_fkey'
            columns: ['assessoria_id']
            isOneToOne: false
            referencedRelation: 'assessorias'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'convites_treinador_fkey'
            columns: ['assessoria_id', 'treinador_id']
            isOneToOne: false
            referencedRelation: 'treinadores'
            referencedColumns: ['assessoria_id', 'id']
          },
        ]
      }
      treinos: {
        Row: {
          id: string
          assessoria_id: string
          treinador_id: string
          titulo: string
          descricao: string | null
          origem: Database['public']['Enums']['origem_treino']
          estrutura: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessoria_id: string
          treinador_id: string
          titulo: string
          descricao?: string | null
          origem?: Database['public']['Enums']['origem_treino']
          estrutura?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessoria_id?: string
          treinador_id?: string
          titulo?: string
          descricao?: string | null
          origem?: Database['public']['Enums']['origem_treino']
          estrutura?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'treinos_assessoria_fkey'
            columns: ['assessoria_id']
            isOneToOne: false
            referencedRelation: 'assessorias'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'treinos_treinador_fkey'
            columns: ['assessoria_id', 'treinador_id']
            isOneToOne: false
            referencedRelation: 'treinadores'
            referencedColumns: ['assessoria_id', 'id']
          },
        ]
      }
      treinos_atletas: {
        Row: {
          id: string
          assessoria_id: string
          treino_id: string
          atleta_id: string
          status: 'atribuido' | 'em_andamento' | 'concluido' | 'cancelado'
          atribuido_em: string
          iniciado_em: string | null
          concluido_em: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessoria_id: string
          treino_id: string
          atleta_id: string
          status?: 'atribuido' | 'em_andamento' | 'concluido' | 'cancelado'
          atribuido_em?: string
          iniciado_em?: string | null
          concluido_em?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessoria_id?: string
          treino_id?: string
          atleta_id?: string
          status?: 'atribuido' | 'em_andamento' | 'concluido' | 'cancelado'
          atribuido_em?: string
          iniciado_em?: string | null
          concluido_em?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'treinos_atletas_treino_fkey'
            columns: ['assessoria_id', 'treino_id']
            isOneToOne: false
            referencedRelation: 'treinos'
            referencedColumns: ['assessoria_id', 'id']
          },
          {
            foreignKeyName: 'treinos_atletas_atleta_fkey'
            columns: ['assessoria_id', 'atleta_id']
            isOneToOne: false
            referencedRelation: 'atletas'
            referencedColumns: ['assessoria_id', 'id']
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      bootstrap_treinador: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      validar_convite: {
        Args: { hash: string }
        Returns: {
          email_mascarado: string | null
          assessoria_nome: string | null
          estado: string
        }[]
      }
      aceitar_convite: {
        Args: { hash: string; user_id: string; nome: string }
        Returns: undefined
      }
    }
    Enums: {
      papel_usuario: 'treinador' | 'atleta'
      status_convite: 'pendente' | 'aceito' | 'revogado' | 'expirado'
      origem_treino: 'manual' | 'ia' | 'importado'
    }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database['public']

export type Tables<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends { Row: infer Row }
    ? Row
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends { Row: infer Row }
      ? Row
      : never
    : never

export type TablesInsert<TableName extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][TableName] extends { Insert: infer Insert } ? Insert : never

export type TablesUpdate<TableName extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][TableName] extends { Update: infer Update } ? Update : never

export type Enums<EnumName extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][EnumName]
