import { createServerClient } from "@/lib/supabase/server";
import {
  trainingTypeStructureSchema,
  type TrainingTypeStructure,
} from "@/lib/validators/training-template";
import type { Database } from "@/types/database";

export interface TrainingTypeCatalogItem {
  id: string;
  codigo: string;
  nome: string;
  objetivo: string;
  descricao: string;
  estruturaSchema: TrainingTypeStructure;
  alerta: string;
}

export type TrainingTemplateResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

type TrainingTypeCatalogRow = Pick<
  Database["public"]["Tables"]["tipos_treino_catalogo"]["Row"],
  | "id"
  | "codigo"
  | "nome"
  | "objetivo"
  | "descricao"
  | "estrutura_schema"
  | "alerta"
>;

function mapTrainingTypeCatalogItem(
  row: TrainingTypeCatalogRow,
): TrainingTypeCatalogItem | null {
  const parsedStructure = trainingTypeStructureSchema.safeParse(
    row.estrutura_schema,
  );

  if (!parsedStructure.success) {
    return null;
  }

  return {
    id: row.id,
    codigo: row.codigo,
    nome: row.nome,
    objetivo: row.objetivo,
    descricao: row.descricao,
    estruturaSchema: parsedStructure.data,
    alerta: row.alerta,
  };
}

export async function listTrainingTypeCatalog(): Promise<
  TrainingTemplateResult<TrainingTypeCatalogItem[]>
> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("tipos_treino_catalogo")
    .select("id, codigo, nome, objetivo, descricao, estrutura_schema, alerta")
    .order("ordem", { ascending: true })
    .order("nome", { ascending: true });

  if (error || !data) {
    return { error: "Não foi possível carregar a biblioteca de treinos agora." };
  }

  const catalog = (data as TrainingTypeCatalogRow[])
    .map(mapTrainingTypeCatalogItem)
    .filter((item): item is TrainingTypeCatalogItem => item !== null);

  if (catalog.length !== data.length) {
    return { error: "Não foi possível carregar a biblioteca de treinos agora." };
  }

  return { data: catalog };
}
