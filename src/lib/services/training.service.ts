import type { SessionUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import type { CreateTrainingInput } from "@/lib/validators/training";
import type { TrainingBlockInput } from "@/lib/validators/training-template";
import type { Database, Json } from "@/types/database";

export interface TrainerTraining {
  id: string;
  titulo: string;
  descricao: string | null;
  tipoTreinoId: string | null;
  blocos: TrainingBlockInput[];
  criadoEm: string;
}

export interface TrainerTrainingListItem {
  id: string;
  titulo: string;
  descricao: string | null;
  tipoTreinoId: string | null;
  quantidadeBlocos: number;
  criadoEm: string;
}

export type TrainingResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

type TrainingRow = Pick<
  Database["public"]["Tables"]["treinos"]["Row"],
  | "id"
  | "titulo"
  | "descricao"
  | "tipo_treino_id"
  | "estrutura"
  | "created_at"
>;

function extractBlocks(estrutura: Json): TrainingBlockInput[] | null {
  if (!estrutura || typeof estrutura !== "object" || Array.isArray(estrutura)) {
    return null;
  }

  const blocks = estrutura.blocos;
  return Array.isArray(blocks) ? (blocks as TrainingBlockInput[]) : null;
}

function mapTraining(row: TrainingRow): TrainerTraining | null {
  const blocks = extractBlocks(row.estrutura);

  if (!blocks) {
    return null;
  }

  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao,
    tipoTreinoId: row.tipo_treino_id,
    blocos: blocks,
    criadoEm: row.created_at,
  };
}

export async function createTraining(
  user: SessionUser,
  input: CreateTrainingInput,
): Promise<TrainingResult<TrainerTraining>> {
  const supabase = await createServerClient();

  if (input.tipoTreinoId) {
    const { data: trainingType, error: trainingTypeError } = await supabase
      .from("tipos_treino_catalogo")
      .select("id")
      .eq("id", input.tipoTreinoId)
      .maybeSingle();

    if (trainingTypeError || !trainingType) {
      return { error: "Não foi possível criar o treino agora." };
    }
  }

  const { data, error } = await supabase
    .from("treinos")
    .insert({
      assessoria_id: user.assessoriaId,
      treinador_id: user.id,
      titulo: input.titulo,
      descricao: input.descricao,
      tipo_treino_id: input.tipoTreinoId,
      origem: "manual",
      estrutura: { blocos: input.blocos },
    })
    .select("id, titulo, descricao, tipo_treino_id, estrutura, created_at")
    .single();

  const training = data ? mapTraining(data as TrainingRow) : null;

  if (error || !training) {
    return { error: "Não foi possível criar o treino agora." };
  }

  return { data: training };
}

export async function listTrainerTrainings(
  user: SessionUser,
): Promise<TrainingResult<TrainerTrainingListItem[]>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("treinos")
    .select("id, titulo, descricao, tipo_treino_id, estrutura, created_at")
    .eq("assessoria_id", user.assessoriaId)
    .eq("treinador_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { error: "Não foi possível carregar os treinos agora." };
  }

  const trainings = (data as TrainingRow[]).map((row) => {
    const blocks = extractBlocks(row.estrutura);

    if (!blocks) {
      return null;
    }

    return {
      id: row.id,
      titulo: row.titulo,
      descricao: row.descricao,
      tipoTreinoId: row.tipo_treino_id,
      quantidadeBlocos: blocks.length,
      criadoEm: row.created_at,
    };
  });

  if (trainings.some((training) => training === null)) {
    return { error: "Não foi possível carregar os treinos agora." };
  }

  return { data: trainings as TrainerTrainingListItem[] };
}
