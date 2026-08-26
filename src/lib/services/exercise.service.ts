import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type ExerciseCategory =
  Database["public"]["Tables"]["exercicios_catalogo"]["Row"]["categoria"];

export type ExerciseLevel =
  Database["public"]["Tables"]["exercicios_catalogo"]["Row"]["nivel"];

export interface ExerciseCatalogItem {
  id: string;
  nome: string;
  categoria: ExerciseCategory;
  categoriaLabel: string;
  nivel: ExerciseLevel;
  nivelLabel: string;
  descricaoCurta: string;
  instrucoes: string;
  alerta: string;
}

export type ExerciseResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

type ExerciseCatalogRow = Pick<
  Database["public"]["Tables"]["exercicios_catalogo"]["Row"],
  | "id"
  | "nome"
  | "categoria"
  | "nivel"
  | "descricao_curta"
  | "instrucoes"
  | "alerta"
>;

const categoryLabels: Record<ExerciseCategory, string> = {
  core: "Core",
  forca: "Força",
  mobilidade: "Mobilidade",
  pliometria: "Pliometria",
  tecnica: "Técnica",
};

const levelLabels: Record<ExerciseLevel, string> = {
  avancado: "Avançado",
  iniciante: "Iniciante",
  intermediario: "Intermediário",
};

function mapExerciseCatalogItem(row: ExerciseCatalogRow): ExerciseCatalogItem {
  return {
    id: row.id,
    nome: row.nome,
    categoria: row.categoria,
    categoriaLabel: categoryLabels[row.categoria],
    nivel: row.nivel,
    nivelLabel: levelLabels[row.nivel],
    descricaoCurta: row.descricao_curta,
    instrucoes: row.instrucoes,
    alerta: row.alerta,
  };
}

export async function listExerciseCatalog(): Promise<
  ExerciseResult<ExerciseCatalogItem[]>
> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("exercicios_catalogo")
    .select("id, nome, categoria, nivel, descricao_curta, instrucoes, alerta")
    .order("categoria", { ascending: true })
    .order("nome", { ascending: true });

  if (error || !data) {
    return {
      error: "Não foi possível carregar a biblioteca de exercícios agora.",
    };
  }

  return { data: (data as ExerciseCatalogRow[]).map(mapExerciseCatalogItem) };
}
